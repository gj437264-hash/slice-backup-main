import React, { useState } from 'react';
import { PACKAGE_SPEC_DEFINITION } from '../data/researchData';
import { HardDrive, Database, FileCode, CheckCircle, Copy, Check } from 'lucide-react';

export const PackageFormatSpec: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'package' | 'manifest' | 'sql-schema'>('package');
  const [copied, setCopied] = useState<boolean>(false);

  const manifestJsonSample = `{
  "format_version": "1.0",
  "engine": "WpMigrator/1.0.0",
  "created_at": "2026-09-11T07:20:00Z",
  "wordpress": {
    "version": "6.7.2",
    "site_url": "https://source-example.com",
    "home_url": "https://source-example.com",
    "table_prefix": "wp_",
    "multisite": false,
    "charset": "utf8mb4",
    "collate": "utf8mb4_unicode_ci"
  },
  "environment": {
    "php_version": "8.3.6",
    "mysql_version": "8.0.35"
  },
  "components": {
    "database": {
      "included": true,
      "tables_count": 42,
      "uncompressed_bytes": 341258900,
      "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    "files": {
      "included": true,
      "total_files": 14280,
      "total_bytes": 1492001400,
      "directories": ["wp-content/plugins", "wp-content/themes", "wp-content/uploads"]
    }
  },
  "signature": {
    "algorithm": "HMAC-SHA256",
    "token_hash": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"
  }
}`;

  const databaseSqlSchema = `-- --------------------------------------------------------
-- Custom Database Tables for WordPress Migration Engine
-- --------------------------------------------------------

-- 1. Migration Jobs Table: Tracks active, paused, and completed operations
CREATE TABLE \`wp_migrator_jobs\` (
  \`id\` VARCHAR(64) NOT NULL COMMENT 'UUID / microtime job identifier',
  \`type\` ENUM('export', 'import', 'backup', 'restore') NOT NULL,
  \`status\` ENUM('CREATED', 'VALIDATING', 'PREPARING', 'EXPORTING_DB', 'EXPORTING_FILES', 'PACKAGING', 'IMPORTING', 'RESTORING_DB', 'RESTORING_FILES', 'UPDATING_URLS', 'FINALIZING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
  \`progress_percent\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  \`current_step\` VARCHAR(64) NOT NULL,
  \`step_offset\` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Byte or record offset for resumability',
  \`source_url\` VARCHAR(255) DEFAULT NULL,
  \`target_url\` VARCHAR(255) DEFAULT NULL,
  \`options_json\` LONGTEXT DEFAULT NULL COMMENT 'JSON configuration payload',
  \`error_message\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL,
  \`updated_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_status\` (\`status\`),
  KEY \`idx_created_at\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Backups Registry Table: Metadata of stored snapshots
CREATE TABLE \`wp_migrator_backups\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`filename\` VARCHAR(255) NOT NULL,
  \`filesize_bytes\` BIGINT UNSIGNED NOT NULL,
  \`wp_version\` VARCHAR(32) NOT NULL,
  \`php_version\` VARCHAR(32) NOT NULL,
  \`components\` VARCHAR(128) NOT NULL COMMENT 'db,plugins,themes,uploads',
  \`checksum_sha256\` CHAR(64) NOT NULL,
  \`storage_adapter\` VARCHAR(32) NOT NULL DEFAULT 'local',
  \`created_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_created_at\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Structured Event Logs Table
CREATE TABLE \`wp_migrator_logs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`job_id\` VARCHAR(64) NOT NULL,
  \`level\` ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR') NOT NULL,
  \`component\` VARCHAR(64) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`created_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_job_id\` (\`job_id\`),
  KEY \`idx_level\` (\`level\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <HardDrive className="w-4 h-4" />
              <span>Original Open Packaging Standard</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
              Package Specification (.wpbundle) & Database DDL
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Designed as an open, backward-compatible, streaming archive format. Unlike proprietary formats (.wpress), `.wpbundle` uses standard TAR-compatible chunk streaming with embedded JSON manifests and SHA256 integrity verification.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('package')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubTab === 'package' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Package Layout
            </button>
            <button
              onClick={() => setActiveSubTab('manifest')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubTab === 'manifest' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              manifest.json
            </button>
            <button
              onClick={() => setActiveSubTab('sql-schema')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubTab === 'sql-schema' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Database DDL
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            {activeSubTab === 'package' && 'Archive Directory Hierarchy (.wpbundle)'}
            {activeSubTab === 'manifest' && 'Package Descriptor Schema (manifest.json)'}
            {activeSubTab === 'sql-schema' && 'MySQL / MariaDB Custom Engine Tables'}
          </div>
          <button
            onClick={() => {
              const text = activeSubTab === 'package'
                ? PACKAGE_SPEC_DEFINITION.structure
                : activeSubTab === 'manifest'
                ? manifestJsonSample
                : databaseSqlSchema;
              handleCopyCode(text);
            }}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {activeSubTab === 'package' && (
          <div className="space-y-4">
            <pre className="p-4 bg-slate-900 text-indigo-300 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {PACKAGE_SPEC_DEFINITION.structure}
            </pre>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Streaming Friendly</strong>
                <span>Files are read and written sequentially at 5MB boundaries so the archive can be created without buffering into RAM.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Standard Tool Compatible</strong>
                <span>Can be extracted with standard CLI utilities (`tar -xf`) or inspected manually if recovery is needed outside WordPress.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Cryptographic Integrity</strong>
                <span>Contains SHA256 checksums of every constituent component to prevent corrupted or tampered restorations.</span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'manifest' && (
          <div className="space-y-4">
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {manifestJsonSample}
            </pre>
            <p className="text-xs text-slate-600">
              The manifest is read first upon upload. If WordPress versions differ or target MySQL version does not support source collations, the pre-flight validator warns the administrator before executing any changes.
            </p>
          </div>
        )}

        {activeSubTab === 'sql-schema' && (
          <div className="space-y-4">
            <pre className="p-4 bg-slate-900 text-amber-300 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {databaseSqlSchema}
            </pre>
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
              <strong>Uninstall Behavior:</strong> Configurable via WordPress settings. By default, upon uninstallation via <code className="font-mono">uninstall.php</code>, the plugin checks if the user opted into complete cleanup. If enabled, all tables and the secret backup directory are wiped clean.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
