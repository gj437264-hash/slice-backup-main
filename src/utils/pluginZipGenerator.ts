import JSZip from 'jszip';
import { WP_ORG_README_TXT } from '../data/phase6HardeningData';
import { adminPageViewPhp } from './pluginTemplates/adminView';
import { adminCss, adminJs } from './pluginTemplates/adminAssets';
import {
  mainPluginPhp,
  classMigratorEngine,
  classChunkedDatabaseDumper,
  classRecursiveSearchReplace,
  classSecuritySanitizer,
  classCompatibilityInspector,
  classStreamingArchiver,
  classRestController,
  classCliCommand,
} from './pluginTemplates/phpClasses';

export interface GeneratedZipResult {
  blob: Blob;
  sizeBytes: number;
  fileName: string;
  sha256: string;
  fileCount: number;
}

/**
 * Computes SHA-256 hex string from ArrayBuffer using Web Crypto API.
 */
async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const LICENSE_TXT = `GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) 1989, 1991 Free Software Foundation, Inc.
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA

Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Preamble
The licenses for most software are designed to take away your
freedom to share and change it. By contrast, the GNU General Public
License is intended to guarantee your freedom to share and change free
software--to make sure the software is free for all its users.
`;

const UNINSTALL_PHP = `<?php
/**
 * WP Bundle Migrator Uninstall Cleanup
 *
 * Triggered only when the administrator permanently deletes the plugin via the WordPress Admin Plugins screen.
 * Removes temporary migration files and plugin options in accordance with WordPress.org guidelines.
 *
 * @package WpBundleMigrator
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// 1. Delete plugin settings and option records
delete_option('wp_bundle_migrator_settings');
delete_option('wp_bundle_active_extensions');
delete_option('wp_bundle_migrator_last_conflict_report');
delete_transient('wp_bundle_migrator_lock');

// If multisite, delete network-wide settings
if (is_multisite()) {
    delete_site_option('wp_bundle_migrator_settings');
    delete_site_option('wp_bundle_active_extensions');
    delete_site_transient('wp_bundle_migrator_lock');
}

// 2. Safely purge temporary migration folder and leftovers
$uploadDir = wp_upload_dir();
$tempDir = wp_normalize_path($uploadDir['basedir'] . '/wp-bundle-migrator-temp');

if (is_dir($tempDir)) {
    $files = scandir($tempDir);
    if ($files) {
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            $target = $tempDir . '/' . $file;
            if (is_file($target)) {
                @unlink($target);
            }
        }
    }
    @rmdir($tempDir);
}
`;

/**
 * Builds the official, production-ready WordPress plugin distribution package.
 * Contains the complete, enterprise-grade plugin with:
 * - Full 5-tab admin dashboard (Export, Import & Restore, Backups Vault, Settings, System Diagnostics)
 * - Safe cursor-seeking MySQL dumper (esc_sql/addslashes compatible, zero _real_escape fatal errors)
 * - True streaming zip archive creation with files and database
 * - Robust REST API & admin-ajax fallback controllers
 * - Non-executing serialized tokenizer search & replace
 * - Secure directory protections & Zip Slip guards
 */
export async function generatePluginZip(onProgress?: (percent: number, currentFile: string) => void): Promise<GeneratedZipResult> {
  const zip = new JSZip();
  const root = zip.folder('wp-bundle-migrator');
  if (!root) {
    throw new Error('Failed to create root directory in zip archive');
  }

  onProgress?.(10, 'Adding bootstrap files and WordPress.org metadata...');

  // 1. Root files
  root.file('wp-bundle-migrator.php', mainPluginPhp);
  root.file('uninstall.php', UNINSTALL_PHP);
  root.file('readme.txt', WP_ORG_README_TXT);
  root.file('LICENSE.txt', LICENSE_TXT);

  onProgress?.(30, 'Adding PHP engine classes...');

  // 2. Includes classes
  const includesFolder = root.folder('includes')!;
  includesFolder.file('class-migrator-engine.php', classMigratorEngine);
  includesFolder.file('class-chunked-database-dumper.php', classChunkedDatabaseDumper);
  includesFolder.file('class-recursive-search-replace.php', classRecursiveSearchReplace);
  includesFolder.file('class-security-sanitizer.php', classSecuritySanitizer);
  includesFolder.file('class-compatibility-inspector.php', classCompatibilityInspector);
  includesFolder.file('class-rest-controller.php', classRestController);
  includesFolder.file('class-cli-command.php', classCliCommand);
  includesFolder.file('class-streaming-archiver.php', classStreamingArchiver);

  onProgress?.(60, 'Adding UI assets and admin templates...');

  // 3. Admin assets
  const assetsFolder = root.folder('assets')!;
  const cssFolder = assetsFolder.folder('css')!;
  cssFolder.file('admin.css', adminCss);
  const jsFolder = assetsFolder.folder('js')!;
  jsFolder.file('migrator.min.js', adminJs);

  // 4. Views
  const viewsFolder = root.folder('views')!;
  viewsFolder.file('admin-page.php', adminPageViewPhp);

  // 5. Localization
  const languagesFolder = root.folder('languages')!;
  languagesFolder.file('wp-bundle-migrator.pot', '# WP Bundle Migrator Translation Template\\n');

  onProgress?.(80, 'Compressing production release archive...');

  const arrayBuffer = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  }, (metadata) => {
    onProgress?.(Math.round(80 + (metadata.percent * 0.18)), metadata.currentFile || 'Bundling...');
  });

  const sha256 = await computeSha256(arrayBuffer);
  const blob = new Blob([arrayBuffer], { type: 'application/zip' });

  onProgress?.(100, 'Release archive ready.');

  return {
    blob,
    sizeBytes: blob.size,
    fileName: 'wp-bundle-migrator-1.0.0.zip',
    sha256,
    fileCount: 15,
  };
}

/**
 * Triggers an immediate browser download for the generated zip blob.
 */
export function triggerZipDownload(blob: Blob, fileName: string = 'wp-bundle-migrator-1.0.0.zip'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
