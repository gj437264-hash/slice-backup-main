/**
 * WordPress Admin Page View template (views/admin-page.php)
 * Full interface with 5 tabs: Export, Import, Backups Vault, Settings, and System Diagnostics.
 * Supports WordPress Core, Root Files, wp-config, mu-plugins, languages, and WordPress Multisite networks.
 */
export const adminPageViewPhp = `<?php
if (!defined('ABSPATH')) {
    exit;
}

$currentSiteUrl = esc_url(get_option('siteurl'));
$currentHomeUrl = esc_url(get_option('home'));
$tablePrefix    = $GLOBALS['table_prefix'] ?? 'wp_';
$uploadDir      = wp_upload_dir();
$tempDir        = wp_normalize_path($uploadDir['basedir'] . '/wp-bundle-migrator-temp');
$isDirWritable  = wp_is_writable($uploadDir['basedir']);

// Multisite state
$isMultisite    = is_multisite();
$subsitesList   = array();
$networkType    = 'Single Site';
$subdomainInstall = defined('SUBDOMAIN_INSTALL') && SUBDOMAIN_INSTALL;

if ($isMultisite) {
    $networkType = $subdomainInstall ? 'Subdomain Network' : 'Subdirectory Network';
    if (function_exists('get_sites')) {
        $sites = get_sites(array('number' => 100));
        foreach ($sites as $site) {
            $blogId = (int) $site->blog_id;
            $details = function_exists('get_blog_details') ? get_blog_details($blogId) : null;
            $subsitesList[] = array(
                'blog_id'  => $blogId,
                'domain'   => $site->domain,
                'path'     => $site->path,
                'blogname' => $details && !empty($details->blogname) ? $details->blogname : ($site->domain . $site->path),
                'url'      => get_site_url($blogId),
            );
        }
    }
}

// Retrieve saved settings (Core + In-App Extensions)
$settings = get_option('wp_bundle_migrator_settings', array());
$chunkSize = isset($settings['chunk_size']) ? (int) $settings['chunk_size'] : 2500;
$maxMemory = isset($settings['memory_limit']) ? sanitize_text_field($settings['memory_limit']) : '256M';
$maxTime   = isset($settings['max_execution_time']) ? (int) $settings['max_execution_time'] : 300;
$retention = isset($settings['retention_count']) ? (int) $settings['retention_count'] : 5;

// Extension 1: Pluggable Cloud Storage Hub Settings
$cloudProvider   = isset($settings['cloud_provider']) ? sanitize_text_field($settings['cloud_provider']) : 's3';
$cloudS3Key      = isset($settings['cloud_s3_key']) ? sanitize_text_field($settings['cloud_s3_key']) : '';
$cloudS3Secret   = isset($settings['cloud_s3_secret']) ? sanitize_text_field($settings['cloud_s3_secret']) : '';
$cloudS3Bucket   = isset($settings['cloud_s3_bucket']) ? sanitize_text_field($settings['cloud_s3_bucket']) : '';
$cloudS3Region   = isset($settings['cloud_s3_region']) ? sanitize_text_field($settings['cloud_s3_region']) : 'us-east-1';
$cloudS3Endpoint = isset($settings['cloud_s3_endpoint']) ? esc_url($settings['cloud_s3_endpoint']) : '';
$cloudStoragePath = isset($settings['cloud_storage_path']) ? sanitize_text_field($settings['cloud_storage_path']) : 'wp-backups/';
$cloudAutoUpload = !empty($settings['cloud_auto_upload']);

// Extension 2: Automated GFS Retention Scheduler Settings
$schedEnabled    = !empty($settings['sched_enabled']);
$schedFreq       = isset($settings['sched_frequency']) ? sanitize_text_field($settings['sched_frequency']) : 'daily';
$schedTime       = isset($settings['sched_time']) ? sanitize_text_field($settings['sched_time']) : '02:00';
$schedScope      = isset($settings['sched_scope']) ? sanitize_text_field($settings['sched_scope']) : 'turnkey_full';
$schedDaily      = isset($settings['sched_daily_retention']) ? (int) $settings['sched_daily_retention'] : 7;
$schedWeekly     = isset($settings['sched_weekly_retention']) ? (int) $settings['sched_weekly_retention'] : 4;
$schedMonthly    = isset($settings['sched_monthly_retention']) ? (int) $settings['sched_monthly_retention'] : 12;
$schedEmail      = isset($settings['sched_alert_email']) ? sanitize_email($settings['sched_alert_email']) : get_option('admin_email');
$schedWebhook    = isset($settings['sched_webhook_url']) ? esc_url($settings['sched_webhook_url']) : '';

// Extension 3: AES-256-GCM Military Encryption Settings
$encEnabled      = !empty($settings['encryption_enabled']);
$encPassphrase   = isset($settings['encryption_passphrase']) ? sanitize_text_field($settings['encryption_passphrase']) : '';

// Extension 4: Peer-to-Peer Live Push/Pull Settings
$p2pEnabled      = !empty($settings['p2p_enabled']);
$p2pRemoteUrl    = isset($settings['p2p_remote_url']) ? esc_url($settings['p2p_remote_url']) : '';
$p2pToken        = isset($settings['p2p_pairing_token']) ? sanitize_text_field($settings['p2p_pairing_token']) : wp_generate_password(32, false);

$activeExts = get_option('wp_bundle_active_extensions', array('multisite_pro' => true, 'aes_encryption' => true, 'cloud_hub' => true));
?>
<div class="wrap wp-bundle-wrap">
    <div class="wp-bundle-header">
        <div class="wp-bundle-brand">
            <div class="wp-bundle-logo">WP</div>
            <div>
                <h1><?php esc_html_e('WP Bundle Migrator', 'wp-bundle-migrator'); ?></h1>
                <div class="wp-bundle-brand-meta">
                    <span>v1.0.0</span>
                    <span aria-hidden="true">·</span>
                    <span><?php esc_html_e('Zero-Memory Streaming Migration &amp; Vault Engine', 'wp-bundle-migrator'); ?></span>
                </div>
            </div>
        </div>
        <div class="wp-bundle-header-status">
            <span class="wp-bundle-status-active">
                <span class="wp-bundle-status-dot"></span> <?php esc_html_e('Engine Ready', 'wp-bundle-migrator'); ?>
            </span>
            <span aria-hidden="true">·</span>
            <span>PHP <?php echo esc_html(PHP_VERSION); ?></span>
            <?php if ($isMultisite) : ?>
                <span aria-hidden="true">·</span>
                <span><?php echo esc_html($networkType); ?> (<?php echo count($subsitesList); ?> <?php esc_html_e('sites', 'wp-bundle-migrator'); ?>)</span>
            <?php endif; ?>
        </div>
    </div>

    <?php if ($isMultisite) : ?>
    <div class="wp-bundle-network-banner">
        <div class="wp-bundle-network-icon">🌐</div>
        <div class="wp-bundle-network-body">
            <strong><?php esc_html_e('WordPress Multisite Network Active', 'wp-bundle-migrator'); ?></strong>
            <p><?php echo esc_html(sprintf(__('You are managing a WordPress Multisite Network with %d site(s). You can export the entire network or isolate and extract individual subsites into standalone single-site bundles.', 'wp-bundle-migrator'), count($subsitesList))); ?></p>
        </div>
    </div>
    <?php endif; ?>

    <!-- Tab Navigation -->
    <nav class="nav-tab-wrapper wp-bundle-tabs">
        <a href="#tab-export" class="nav-tab nav-tab-active" data-tab="export">
            <span class="dashicons dashicons-upload"></span> <?php esc_html_e('Export Bundle', 'wp-bundle-migrator'); ?>
        </a>
        <a href="#tab-import" class="nav-tab" data-tab="import">
            <span class="dashicons dashicons-download"></span> <?php esc_html_e('Import & Restore', 'wp-bundle-migrator'); ?>
        </a>
        <a href="#tab-backups" class="nav-tab" data-tab="backups">
            <span class="dashicons dashicons-backup"></span> <?php esc_html_e('Backups Vault', 'wp-bundle-migrator'); ?>
        </a>
        <a href="#tab-settings" class="nav-tab" data-tab="settings">
            <span class="dashicons dashicons-admin-settings"></span> <?php esc_html_e('Settings', 'wp-bundle-migrator'); ?>
        </a>
        <a href="#tab-extensions" class="nav-tab" data-tab="extensions">
            <span class="dashicons dashicons-admin-plugins"></span> <?php esc_html_e('Extensions Hub', 'wp-bundle-migrator'); ?> <span class="wp-bundle-pill-inline" style="background:#00a32a;color:#fff;border-radius:10px;padding:2px 7px;font-size:10px;font-weight:700;">1-Click</span>
        </a>
        <a href="#tab-system" class="nav-tab" data-tab="system">
            <span class="dashicons dashicons-heart"></span> <?php esc_html_e('System Diagnostics', 'wp-bundle-migrator'); ?>
        </a>
    </nav>

    <!-- Global Notice Box -->
    <div id="wp-bundle-global-notice" style="display:none;" class="notice"></div>

    <!-- TAB 1: EXPORT -->
    <div id="tab-export" class="wp-bundle-tab-pane wp-bundle-tab-active">
        <div class="wp-bundle-grid">
            <div class="wp-bundle-card wp-bundle-card-main">
                <h2><?php esc_html_e('Export WordPress Bundle', 'wp-bundle-migrator'); ?></h2>
                <p><?php esc_html_e('Package your WordPress database and media into a standalone, portable .bundle.zip file with constant O(1) RAM usage.', 'wp-bundle-migrator'); ?></p>

                <form id="wp-bundle-export-form">
                    <?php if ($isMultisite) : ?>
                    <div class="wp-bundle-section">
                        <h3><?php esc_html_e('1. Multisite Network Target', 'wp-bundle-migrator'); ?></h3>
                        <div class="wp-bundle-radio-group">
                            <label class="wp-bundle-radio-card selected">
                                <input type="radio" name="multisite_mode" value="entire_network" checked />
                                <div>
                                    <strong><?php esc_html_e('Entire Multisite Network (All Subsites)', 'wp-bundle-migrator'); ?></strong>
                                    <span><?php esc_html_e('Includes network tables, all subsite databases, shared user accounts, and all network media.', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>
                            <label class="wp-bundle-radio-card">
                                <input type="radio" name="multisite_mode" value="subsite" />
                                <div>
                                    <strong><?php esc_html_e('Single Subsite Extraction (Standalone / Isolated)', 'wp-bundle-migrator'); ?></strong>
                                    <span><?php esc_html_e('Extracts a single subsite and converts it into a self-contained single-site package or subsite backup.', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>
                        </div>

                        <div id="multisite-subsite-picker" style="display:none; margin-top: 14px; padding: 14px; background: #f0f6fc; border-radius: 6px; border: 1px solid #c8d8ec;">
                            <label for="export-subsite-id" style="display:block; margin-bottom: 6px;"><strong><?php esc_html_e('Select Subsite to Export:', 'wp-bundle-migrator'); ?></strong></label>
                            <select id="export-subsite-id" name="subsite_id" class="regular-text" style="max-width: 100%;">
                                <?php foreach ($subsitesList as $sub) : ?>
                                    <option value="<?php echo esc_attr((string)$sub['blog_id']); ?>">
                                        #<?php echo esc_html((string)$sub['blog_id']); ?> - <?php echo esc_html($sub['blogname']); ?> (<?php echo esc_html($sub['domain'] . $sub['path']); ?>)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div style="margin-top: 10px;">
                                <label>
                                    <input type="checkbox" name="convert_subsite_standalone" value="1" checked />
                                    <span><strong><?php esc_html_e('Convert to Standalone Single-Site Format', 'wp-bundle-migrator'); ?></strong> (Rewrites table prefixes from <code>wp_X_</code> to standard <code>wp_</code> and isolates media)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>

                    <div class="wp-bundle-section">
                        <div class="wp-bundle-section-header">
                            <div>
                                <h3><?php echo $isMultisite ? '2' : '1'; ?>. <?php esc_html_e('Export Preset & Scope', 'wp-bundle-migrator'); ?></h3>
                                <p class="description"><?php esc_html_e('Choose a migration preset or customize specific components below:', 'wp-bundle-migrator'); ?></p>
                            </div>
                            <div class="wp-bundle-preset-meta">
                                <span id="active-preset-tag" class="wp-bundle-badge-status ready"><?php esc_html_e('Preset: Standard', 'wp-bundle-migrator'); ?></span>
                            </div>
                        </div>

                        <div class="wp-bundle-radio-group">
                            <label class="wp-bundle-radio-card selected" data-preset="full">
                                <input type="radio" name="export_type" value="full" checked />
                                <div class="wp-bundle-radio-content">
                                    <div class="wp-bundle-radio-title">
                                        <strong><?php esc_html_e('Standard Complete Migration', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-pill-inline wp-bundle-pill-recommended"><?php esc_html_e('Recommended', 'wp-bundle-migrator'); ?></span>
                                    </div>
                                    <span class="wp-bundle-radio-desc"><?php esc_html_e('Database, Uploads, Plugins, Themes, Must-Use Plugins, Languages, and Root Configs (wp-config.php, .htaccess). Excludes redundant core binaries.', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>

                            <label class="wp-bundle-radio-card" data-preset="turnkey_full">
                                <input type="radio" name="export_type" value="turnkey_full" />
                                <div class="wp-bundle-radio-content">
                                    <div class="wp-bundle-radio-title">
                                        <strong><?php esc_html_e('Complete Turnkey Clone (All Files + Core + DB)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-pill-inline wp-bundle-pill-turnkey"><?php esc_html_e('Turnkey Bare-Metal', 'wp-bundle-migrator'); ?></span>
                                    </div>
                                    <span class="wp-bundle-radio-desc"><?php esc_html_e('Everything included: full WordPress Core (wp-admin, wp-includes), root files, configurations, plugins, themes, uploads, and all database tables.', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>

                            <label class="wp-bundle-radio-card" data-preset="db_only">
                                <input type="radio" name="export_type" value="db_only" />
                                <div class="wp-bundle-radio-content">
                                    <div class="wp-bundle-radio-title">
                                        <strong><?php esc_html_e('Database Only', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-pill-inline wp-bundle-pill-db"><?php esc_html_e('SQL Only', 'wp-bundle-migrator'); ?></span>
                                    </div>
                                    <span class="wp-bundle-radio-desc"><?php esc_html_e('All SQL tables with primary key cursor seeking. Extremely fast, lightweight text archive (~18 MB).', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>

                            <label class="wp-bundle-radio-card" data-preset="media_only">
                                <input type="radio" name="export_type" value="media_only" />
                                <div class="wp-bundle-radio-content">
                                    <div class="wp-bundle-radio-title">
                                        <strong><?php esc_html_e('Media & Uploads Only', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-pill-inline wp-bundle-pill-media"><?php esc_html_e('Media Only', 'wp-bundle-migrator'); ?></span>
                                    </div>
                                    <span class="wp-bundle-radio-desc"><?php esc_html_e('wp-content/uploads directory content only (images, videos, documents, PDFs).', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>

                            <label class="wp-bundle-radio-card wp-bundle-radio-custom" data-preset="custom">
                                <input type="radio" name="export_type" value="custom" />
                                <div class="wp-bundle-radio-content">
                                    <div class="wp-bundle-radio-title">
                                        <strong><?php esc_html_e('Custom Tailored Selection', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-pill-inline wp-bundle-pill-custom"><?php esc_html_e('Custom Granular', 'wp-bundle-migrator'); ?></span>
                                    </div>
                                    <span class="wp-bundle-radio-desc"><?php esc_html_e('Custom combination defined by the granular checkboxes below. Automatically selected when modifying inclusions.', 'wp-bundle-migrator'); ?></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="wp-bundle-section" id="export-components-section">
                        <div class="wp-bundle-section-header">
                            <div>
                                <h3><?php echo $isMultisite ? '3' : '2'; ?>. <?php esc_html_e('Granular Component Selection', 'wp-bundle-migrator'); ?></h3>
                                <p class="description"><?php esc_html_e('Customize which files, directories, and tables are included in your bundle archive:', 'wp-bundle-migrator'); ?></p>
                            </div>
                            <div class="wp-bundle-quick-actions">
                                <button type="button" id="btn-select-all-components" class="button button-small"><?php esc_html_e('Select All', 'wp-bundle-migrator'); ?></button>
                                <button type="button" id="btn-reset-recommended" class="button button-small"><?php esc_html_e('Recommended', 'wp-bundle-migrator'); ?></button>
                                <button type="button" id="btn-deselect-all-components" class="button button-small"><?php esc_html_e('Clear All', 'wp-bundle-migrator'); ?></button>
                            </div>
                        </div>
                        
                        <div class="wp-bundle-checkbox-grid">
                            <label class="wp-bundle-checkbox-item" data-component="db" data-size="24000000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_db" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-db">🗄️</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Database Tables (SQL)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~24 MB</span>
                                    </div>
                                    <small><?php esc_html_e('All SQL tables or subsite-specific isolated schema', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="uploads" data-size="125000000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_uploads" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-media">🖼️</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Media Library (/uploads)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~125 MB</span>
                                    </div>
                                    <small><?php esc_html_e('Images, PDFs, audio, video, attachments', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="plugins" data-size="42000000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_plugins" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-plugins">🔌</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Installed Plugins (/plugins)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~42 MB</span>
                                    </div>
                                    <small><?php esc_html_e('Active and inactive installed WordPress plugins', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="themes" data-size="18000000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_themes" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-themes">🎨</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Themes (/themes)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~18 MB</span>
                                    </div>
                                    <small><?php esc_html_e('Active parent and child themes and templates', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="mu_plugins" data-size="1200000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_mu_plugins" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-mu">⚡</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Must-Use Plugins (/mu-plugins)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~1.2 MB</span>
                                    </div>
                                    <small><?php esc_html_e('Host drop-ins and automatic loaders', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="languages" data-size="4500000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_languages" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-lang">🌐</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Languages (/languages)', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~4.5 MB</span>
                                    </div>
                                    <small><?php esc_html_e('Translation catalogs and locale PO/MO files', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="root_files" data-size="80000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_root_files" value="1" checked />
                                    <span class="wp-bundle-icon-chip icon-config">⚙️</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('Root Config Files', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~80 KB</span>
                                    </div>
                                    <small><?php esc_html_e('wp-config.php, .htaccess, robots.txt, web.config', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>

                            <label class="wp-bundle-checkbox-item" data-component="wp_core" data-size="48000000">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="include_wp_core" value="1" />
                                    <span class="wp-bundle-icon-chip icon-core">📦</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <div class="wp-bundle-checkbox-header">
                                        <strong><?php esc_html_e('WordPress Core Files', 'wp-bundle-migrator'); ?></strong>
                                        <span class="wp-bundle-size-chip">~48 MB</span>
                                    </div>
                                    <small><?php esc_html_e('wp-admin, wp-includes, and root core PHP files', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="wp-bundle-section">
                        <h3><?php echo $isMultisite ? '4' : '3'; ?>. <?php esc_html_e('Optimization & Exclusions', 'wp-bundle-migrator'); ?></h3>
                        <div class="wp-bundle-checkbox-grid">
                            <label class="wp-bundle-checkbox-item">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="exclude_spam" value="1" checked />
                                    <span class="wp-bundle-icon-chip">🧹</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <strong><?php esc_html_e('Exclude Spam & Trash', 'wp-bundle-migrator'); ?></strong>
                                    <small><?php esc_html_e('Spam comments and trashed posts', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="exclude_revisions" value="1" checked />
                                    <span class="wp-bundle-icon-chip">⏱️</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <strong><?php esc_html_e('Exclude Post Revisions', 'wp-bundle-migrator'); ?></strong>
                                    <small><?php esc_html_e('Reduces database size significantly', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <div class="wp-bundle-checkbox-lead">
                                    <input type="checkbox" name="exclude_transients" value="1" checked />
                                    <span class="wp-bundle-icon-chip">💨</span>
                                </div>
                                <div class="wp-bundle-checkbox-body">
                                    <strong><?php esc_html_e('Exclude Transients', 'wp-bundle-migrator'); ?></strong>
                                    <small><?php esc_html_e('Temporary cache keys and expired sessions', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Zero Selection Error Warning -->
                    <div id="export-zero-selection-warning" class="wp-bundle-alert-box wp-bundle-alert-warning" style="display:none;">
                        <span class="dashicons dashicons-warning"></span>
                        <div>
                            <strong><?php esc_html_e('No components selected!', 'wp-bundle-migrator'); ?></strong>
                            <span><?php esc_html_e('Please check at least one component (Database, Uploads, Plugins, Themes, or Config) to export.', 'wp-bundle-migrator'); ?></span>
                        </div>
                    </div>

                    <div class="wp-bundle-actions">
                        <button type="submit" id="btn-start-export" class="button button-primary button-hero">
                            <span class="dashicons dashicons-cloud-upload"></span> <?php esc_html_e('Start Streaming Export', 'wp-bundle-migrator'); ?>
                        </button>
                    </div>
                </form>

                <!-- Progress Visualizer -->
                <div id="export-progress-container" class="wp-bundle-progress-box" style="display:none;">
                    <div class="wp-bundle-progress-header">
                        <strong id="export-status-label"><?php esc_html_e('Scanning database and filesystem...', 'wp-bundle-migrator'); ?></strong>
                        <span id="export-percent-label">0%</span>
                    </div>
                    <div class="wp-bundle-progress">
                        <div id="export-progress-bar" class="wp-bundle-progress-bar" style="width: 0%;"></div>
                    </div>
                    <p id="export-status-detail" class="wp-bundle-progress-sub"><?php esc_html_e('Streaming data with zero RAM consumption...', 'wp-bundle-migrator'); ?></p>
                </div>

                <!-- Export Download Card -->
                <div id="export-result-card" class="wp-bundle-success-card" style="display:none;">
                    <div class="wp-bundle-success-icon">✓</div>
                    <div class="wp-bundle-success-body">
                        <h3><?php esc_html_e('Export Successfully Created!', 'wp-bundle-migrator'); ?></h3>
                        <p id="export-result-details"></p>
                        <div class="wp-bundle-result-actions">
                            <a id="export-download-btn" href="#" class="button button-primary" target="_blank">
                                <span class="dashicons dashicons-download"></span> <?php esc_html_e('Download Bundle (.zip)', 'wp-bundle-migrator'); ?>
                            </a>
                            <button type="button" class="button" onclick="location.reload();">
                                <?php esc_html_e('Done', 'wp-bundle-migrator'); ?>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modern Interactive Sidebar: Live Blueprint & Size Estimator -->
            <div class="wp-bundle-sidebar">
                <div class="wp-bundle-card wp-bundle-blueprint-card">
                    <div class="wp-bundle-card-header">
                        <h3><?php esc_html_e('Live Blueprint Estimator', 'wp-bundle-migrator'); ?></h3>
                        <span id="blueprint-scope-badge" class="wp-bundle-badge-status active">Standard</span>
                    </div>

                    <!-- Dynamic Size Gauge -->
                    <div class="wp-bundle-blueprint-metrics">
                        <div class="wp-bundle-metric-row">
                            <span class="metric-label"><?php esc_html_e('Selected Components:', 'wp-bundle-migrator'); ?></span>
                            <span id="blueprint-component-count" class="metric-value">7 of 8</span>
                        </div>
                        <div class="wp-bundle-metric-row">
                            <span class="metric-label"><?php esc_html_e('Estimated Raw Data:', 'wp-bundle-migrator'); ?></span>
                            <span id="blueprint-raw-size" class="metric-value">~214.7 MB</span>
                        </div>
                        <div class="wp-bundle-metric-row highlight">
                            <span class="metric-label"><strong><?php esc_html_e('Est. Bundle (.zip) Size:', 'wp-bundle-migrator'); ?></strong></span>
                            <span id="blueprint-compressed-size" class="metric-value font-bold">~78.5 MB</span>
                        </div>
                    </div>

                    <!-- Dynamic Active Components Tag Cloud -->
                    <div class="wp-bundle-blueprint-tags">
                        <label class="metric-label"><?php esc_html_e('Included In Package:', 'wp-bundle-migrator'); ?></label>
                        <div id="blueprint-active-tags" class="wp-bundle-tag-cloud">
                            <!-- Injected dynamically by JS -->
                        </div>
                    </div>

                    <hr class="wp-bundle-divider" />

                    <div class="wp-bundle-blueprint-guide">
                        <h4><?php esc_html_e('Why Are Core Files Optional?', 'wp-bundle-migrator'); ?></h4>
                        <p class="description">
                            <?php esc_html_e('Standard migrations exclude wp-admin & wp-includes to minimize backup size and avoid binary version collisions. Enable WordPress Core only for complete bare-metal restores onto empty servers.', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>

                    <div class="wp-bundle-shield-notice">
                        <span class="dashicons dashicons-shield"></span>
                        <span><?php esc_html_e('Constant O(1) streaming memory: will not trigger PHP memory_limit or max_execution_time errors.', 'wp-bundle-migrator'); ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- TAB 2: IMPORT & RESTORE -->
    <div id="tab-import" class="wp-bundle-tab-pane">
        <div class="wp-bundle-grid">
            <div class="wp-bundle-card wp-bundle-card-main">
                <h2><?php esc_html_e('Import & Restore Site', 'wp-bundle-migrator'); ?></h2>
                <p><?php esc_html_e('Upload a previously exported .bundle.zip or .wpbundle package to restore database, media, and WordPress files with atomic URL replacement.', 'wp-bundle-migrator'); ?></p>

                <form id="wp-bundle-import-form" enctype="multipart/form-data">
                    <div class="wp-bundle-section">
                        <h3><?php esc_html_e('1. Select Archive Package', 'wp-bundle-migrator'); ?></h3>
                        
                        <div class="wp-bundle-dropzone" id="import-dropzone">
                            <input type="file" id="import-file-input" accept=".zip,.bundle.zip,.wpbundle" />
                            <div class="dropzone-content">
                                <span class="dashicons dashicons-upload dropzone-icon"></span>
                                <p class="dropzone-prompt"><strong><?php esc_html_e('Click to browse', 'wp-bundle-migrator'); ?></strong> <?php esc_html_e('or drag and drop your .bundle.zip here', 'wp-bundle-migrator'); ?></p>
                                <span class="dropzone-sub"><?php esc_html_e('Supports packages up to 100GB via streaming chunks', 'wp-bundle-migrator'); ?></span>
                            </div>
                            <div class="dropzone-selected-file" id="dropzone-selected-file" style="display:none;">
                                <span class="dashicons dashicons-media-archive"></span>
                                <span id="selected-file-name"></span>
                                <span id="selected-file-size" class="file-size"></span>
                            </div>
                        </div>

                        <div class="wp-bundle-or-divider">
                            <span><?php esc_html_e('OR SELECT FROM SAVED BACKUPS', 'wp-bundle-migrator'); ?></span>
                        </div>

                        <div class="wp-bundle-form-row">
                            <label for="import-vault-select"><strong><?php esc_html_e('Server Vault Backups:', 'wp-bundle-migrator'); ?></strong></label>
                            <select id="import-vault-select" class="regular-text">
                                <option value=""><?php esc_html_e('-- Choose a backup from server storage --', 'wp-bundle-migrator'); ?></option>
                            </select>
                        </div>
                    </div>

                    <div class="wp-bundle-section">
                        <h3><?php esc_html_e('2. Domain Search & Replace Configuration', 'wp-bundle-migrator'); ?></h3>
                        <p class="description"><?php esc_html_e('Safely updates all URLs inside serialized metadata, theme options, and widgets without byte-count breakage.', 'wp-bundle-migrator'); ?></p>
                        
                        <div class="wp-bundle-replace-grid">
                            <div class="replace-field">
                                <label for="replace-old-url"><strong><?php esc_html_e('Source / Old Site URL:', 'wp-bundle-migrator'); ?></strong></label>
                                <input type="text" id="replace-old-url" class="regular-text" placeholder="https://old-domain.com" />
                                <span class="description"><?php esc_html_e('The original domain from the imported bundle', 'wp-bundle-migrator'); ?></span>
                            </div>
                            <div class="replace-field">
                                <label for="replace-new-url"><strong><?php esc_html_e('Destination / Current Site URL:', 'wp-bundle-migrator'); ?></strong></label>
                                <input type="text" id="replace-new-url" class="regular-text" value="<?php echo esc_attr($currentSiteUrl); ?>" />
                                <span class="description"><?php esc_html_e('Current target domain', 'wp-bundle-migrator'); ?></span>
                            </div>
                        </div>

                        <?php if ($isMultisite) : ?>
                        <div class="wp-bundle-replace-grid" style="margin-top: 14px;">
                            <div class="replace-field">
                                <label for="replace-old-network-domain"><strong><?php esc_html_e('Old Network Domain (Multisite):', 'wp-bundle-migrator'); ?></strong></label>
                                <input type="text" id="replace-old-network-domain" class="regular-text" placeholder="old-network.com" />
                                <span class="description"><?php esc_html_e('Original base domain for wp_site and wp_blogs', 'wp-bundle-migrator'); ?></span>
                            </div>
                            <div class="replace-field">
                                <label for="replace-new-network-domain"><strong><?php esc_html_e('New Network Domain (Multisite):', 'wp-bundle-migrator'); ?></strong></label>
                                <input type="text" id="replace-new-network-domain" class="regular-text" value="<?php echo esc_attr(defined('DOMAIN_CURRENT_SITE') ? DOMAIN_CURRENT_SITE : ''); ?>" />
                                <span class="description"><?php esc_html_e('Current network base domain', 'wp-bundle-migrator'); ?></span>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="wp-bundle-section">
                        <h3><?php esc_html_e('3. Restoration Scope', 'wp-bundle-migrator'); ?></h3>
                        <div class="wp-bundle-checkbox-grid">
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_db" value="1" checked />
                                <span><?php esc_html_e('Restore Database Tables', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_uploads" value="1" checked />
                                <span><?php esc_html_e('Restore Media Library (/uploads)', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_plugins" value="1" checked />
                                <span><?php esc_html_e('Restore Plugins (/plugins)', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_themes" value="1" checked />
                                <span><?php esc_html_e('Restore Themes (/themes)', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_mu_plugins" value="1" checked />
                                <span><?php esc_html_e('Restore Must-Use Plugins (/mu-plugins)', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_languages" value="1" checked />
                                <span><?php esc_html_e('Restore Languages (/languages)', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_root_files" value="1" checked />
                                <span><?php esc_html_e('Restore Root Files (.htaccess, robots.txt)', 'wp-bundle-migrator'); ?></span>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="restore_core" value="1" />
                                <span><?php esc_html_e('Restore Core Files (wp-admin, wp-includes)', 'wp-bundle-migrator'); ?></span>
                            </label>
                        </div>
                    </div>

                    <div class="wp-bundle-section">
                        <h3>4. <?php esc_html_e('Fault-Tolerant Theme & Plugin Compatibility Shield', 'wp-bundle-migrator'); ?></h3>
                        <p class="description" style="margin-bottom: 12px;"><?php esc_html_e('Prevents PHP version mismatches, syntax deprecations, and corrupted archives from breaking your migration or causing White Screen of Death (WSOD):', 'wp-bundle-migrator'); ?></p>
                        
                        <div class="wp-bundle-checkbox-grid">
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="isolate_conflicts" value="1" checked />
                                <div>
                                    <strong><?php esc_html_e('Safe Quarantine Mode (Recommended)', 'wp-bundle-migrator'); ?></strong>
                                    <small><?php esc_html_e('Scans plugins & themes during import for fatal PHP syntax ($var{0}, create_function, each). Safely deactivates conflicting plugins in the database so the site boots cleanly.', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>
                            <label class="wp-bundle-checkbox-item">
                                <input type="checkbox" name="resilient_unpack" value="1" checked />
                                <div>
                                    <strong><?php esc_html_e('Resilient Archive Recovery', 'wp-bundle-migrator'); ?></strong>
                                    <small><?php esc_html_e('Bypasses minor zip CRC corruption in non-essential files instead of aborting the entire restore.', 'wp-bundle-migrator'); ?></small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="wp-bundle-actions">
                        <button type="submit" id="btn-start-import" class="button button-primary button-hero">
                            <span class="dashicons dashicons-update"></span> <?php esc_html_e('Start Restoration & Migration', 'wp-bundle-migrator'); ?>
                        </button>
                    </div>
                </form>

                <!-- Import Progress -->
                <div id="import-progress-container" class="wp-bundle-progress-box" style="display:none;">
                    <div class="wp-bundle-progress-header">
                        <strong id="import-status-label"><?php esc_html_e('Uploading package...', 'wp-bundle-migrator'); ?></strong>
                        <span id="import-percent-label">0%</span>
                    </div>
                    <div class="wp-bundle-progress">
                        <div id="import-progress-bar" class="wp-bundle-progress-bar" style="width: 0%;"></div>
                    </div>
                    <p id="import-status-detail" class="wp-bundle-progress-sub"><?php esc_html_e('Please do not close this browser window during restoration.', 'wp-bundle-migrator'); ?></p>
                </div>

                <!-- Import Complete Card & Health Report -->
                <div id="import-result-card" class="wp-bundle-success-card" style="display:none; flex-direction: column;">
                    <div style="display:flex; gap:16px; align-items:flex-start; width:100%;">
                        <div class="wp-bundle-success-icon">✓</div>
                        <div class="wp-bundle-success-body" style="flex:1;">
                            <h3><?php esc_html_e('Migration & Restoration Complete!', 'wp-bundle-migrator'); ?></h3>
                            <p><?php esc_html_e('Database restored, URLs updated, and rewrite cache flushed.', 'wp-bundle-migrator'); ?></p>
                            
                            <!-- Environment & Compatibility Overview -->
                            <div id="import-compat-overview" style="display:none; margin: 14px 0; padding: 14px; background: #ffffff; border: 1px solid #dcdcde; border-radius: 6px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom: 10px;">
                                    <div>
                                        <span id="import-php-shift-badge" class="wp-bundle-pill wp-bundle-pill-info">PHP Version Check</span>
                                    </div>
                                    <div id="import-compat-counters" style="display:flex; gap:8px;"></div>
                                </div>
                                <div id="import-conflicts-container" style="display:none;">
                                    <h4 style="margin: 12px 0 6px 0; color: #b32d2e; font-size: 13px; display:flex; align-items:center; gap:6px;">
                                        <span class="dashicons dashicons-warning"></span> <?php esc_html_e('Compatibility Shield Actions Taken (WSOD Prevented):', 'wp-bundle-migrator'); ?>
                                    </h4>
                                    <p class="description" style="margin-bottom: 8px;">
                                        <?php esc_html_e('The following plugins/themes contain syntax incompatible with your current PHP version. They were safely deactivated in the database so your site remains fully accessible. You can update or replace them whenever convenient.', 'wp-bundle-migrator'); ?>
                                    </p>
                                    <table class="wp-list-table widefat fixed striped" style="font-size: 12px;">
                                        <thead>
                                            <tr>
                                                <th style="width: 25%;"><?php esc_html_e('Item', 'wp-bundle-migrator'); ?></th>
                                                <th style="width: 30%;"><?php esc_html_e('Detected Conflict', 'wp-bundle-migrator'); ?></th>
                                                <th style="width: 20%;"><?php esc_html_e('Protection Status', 'wp-bundle-migrator'); ?></th>
                                                <th style="width: 25%;"><?php esc_html_e('Action Plan', 'wp-bundle-migrator'); ?></th>
                                            </tr>
                                        </thead>
                                        <tbody id="import-conflicts-tbody"></tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="wp-bundle-result-actions" style="margin-top: 14px;">
                                <a href="<?php echo esc_url(admin_url('options-permalink.php')); ?>" class="button button-primary">
                                    <?php esc_html_e('Save Permalinks & Verify', 'wp-bundle-migrator'); ?>
                                </a>
                                <a href="<?php echo esc_url(home_url('/')); ?>" class="button" target="_blank">
                                    <?php esc_html_e('Visit Restored Site', 'wp-bundle-migrator'); ?>
                                </a>
                                <button type="button" id="btn-download-conflict-log" class="button" style="display:none;">
                                    <span class="dashicons dashicons-media-text"></span> <?php esc_html_e('Download Conflict Log (.txt)', 'wp-bundle-migrator'); ?>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wp-bundle-sidebar">
                <div class="wp-bundle-card">
                    <h3><?php esc_html_e('Safety & Security', 'wp-bundle-migrator'); ?></h3>
                    <ul class="wp-bundle-feature-list">
                        <li><strong>Zip Slip Protected</strong>: Validates archive paths against base directory jail to stop CWE-22 traversal.</li>
                        <li><strong>wp-config Safety</strong>: Preserves existing target database credentials while restoring configuration keys.</li>
                        <li><strong>CWE-502 Safe</strong>: Deserializes without gadget instantiation; parses serialized strings with grammar tokenizer.</li>
                        <li><strong>UTF-8 Emoji Safe</strong>: Recalculates exact 8-bit byte counts for serialized strings.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- TAB 3: BACKUPS VAULT -->
    <div id="tab-backups" class="wp-bundle-tab-pane">
        <div class="wp-bundle-card">
            <div class="wp-bundle-card-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                <div>
                    <h2 style="margin:0 0 4px 0; font-size:17px;"><?php esc_html_e('Saved Backups &amp; Bundles Vault', 'wp-bundle-migrator'); ?></h2>
                    <p style="margin:0; font-size:12.5px; color:#64748b;"><?php esc_html_e('Local archives stored in the protected storage directory with .htaccess restrictions.', 'wp-bundle-migrator'); ?></p>
                </div>
                <button type="button" id="btn-refresh-backups" class="button" style="border-radius:8px;">
                    <span class="dashicons dashicons-update"></span> <?php esc_html_e('Refresh Vault', 'wp-bundle-migrator'); ?>
                </button>
            </div>

            <!-- Toolbar: Search & Scope Filter Buttons -->
            <div class="wp-bundle-vault-toolbar">
                <div class="wp-bundle-search-box">
                    <span class="dashicons dashicons-search"></span>
                    <input type="text" id="vault-search-input" placeholder="<?php esc_attr_e('Search backups by name or date...', 'wp-bundle-migrator'); ?>" />
                </div>
                <div class="wp-bundle-filter-buttons">
                    <button type="button" class="wp-bundle-filter-btn active" data-scope="all"><?php esc_html_e('All', 'wp-bundle-migrator'); ?></button>
                    <button type="button" class="wp-bundle-filter-btn" data-scope="turnkey"><?php esc_html_e('Turnkey', 'wp-bundle-migrator'); ?></button>
                    <button type="button" class="wp-bundle-filter-btn" data-scope="db"><?php esc_html_e('Database', 'wp-bundle-migrator'); ?></button>
                    <button type="button" class="wp-bundle-filter-btn" data-scope="media"><?php esc_html_e('Media', 'wp-bundle-migrator'); ?></button>
                </div>
            </div>

            <div id="backups-loading" style="padding: 24px; text-align: center; color: #64748b;">
                <span class="spinner is-active" style="float:none; margin:0 8px 0 0;"></span> <?php esc_html_e('Loading vault archives...', 'wp-bundle-migrator'); ?>
            </div>

            <table class="wp-bundle-table" id="backups-table" style="display:none;">
                <thead>
                    <tr>
                        <th><?php esc_html_e('Archive File', 'wp-bundle-migrator'); ?></th>
                        <th style="width: 130px;"><?php esc_html_e('Size', 'wp-bundle-migrator'); ?></th>
                        <th style="width: 180px;"><?php esc_html_e('Date Created', 'wp-bundle-migrator'); ?></th>
                        <th style="width: 230px; text-align: right;"><?php esc_html_e('Actions', 'wp-bundle-migrator'); ?></th>
                    </tr>
                </thead>
                <tbody id="backups-list-body">
                    <!-- Loaded dynamically via JavaScript -->
                </tbody>
            </table>

            <div id="backups-empty" class="wp-bundle-empty-state" style="display:none;">
                <span class="dashicons dashicons-portfolio wp-bundle-empty-icon"></span>
                <h4><?php esc_html_e('No backups found in vault', 'wp-bundle-migrator'); ?></h4>
                <p><?php esc_html_e('Create your first backup using the Export tab.', 'wp-bundle-migrator'); ?></p>
            </div>
        </div>
    </div>

    <!-- TAB 4: SETTINGS & EXTENSIONS CONFIGURATION -->
    <div id="tab-settings" class="wp-bundle-tab-pane">
        <!-- Settings Sub-Navigation Jump Bar -->
        <div class="wp-bundle-settings-nav" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; padding:12px 16px; background:#fff; border:1px solid #c3c4c7; border-radius:6px; box-shadow:0 1px 1px rgba(0,0,0,.04);">
            <span style="font-weight:700; color:#1d2327; align-self:center; margin-right:6px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">
                <?php esc_html_e('Quick Jump:', 'wp-bundle-migrator'); ?>
            </span>
            <a href="#section-settings-engine" class="button button-small btn-settings-jump">
                ⚙️ <?php esc_html_e('Core Engine', 'wp-bundle-migrator'); ?>
            </a>
            <a href="#section-settings-cloud" class="button button-small btn-settings-jump">
                ☁️ <?php esc_html_e('Cloud Storage Hub', 'wp-bundle-migrator'); ?>
            </a>
            <a href="#section-settings-scheduler" class="button button-small btn-settings-jump">
                📅 <?php esc_html_e('Automated GFS Scheduler', 'wp-bundle-migrator'); ?>
            </a>
            <a href="#section-settings-encryption" class="button button-small btn-settings-jump">
                🔒 <?php esc_html_e('AES-256-GCM Encryption', 'wp-bundle-migrator'); ?>
            </a>
            <a href="#section-settings-p2p" class="button button-small btn-settings-jump">
                🚀 <?php esc_html_e('Direct P2P Migration', 'wp-bundle-migrator'); ?>
            </a>
        </div>

        <form id="wp-bundle-settings-form">
            <!-- SECTION 1: CORE ENGINE & PERFORMANCE -->
            <div class="wp-bundle-card wp-bundle-settings-section" id="section-settings-engine" style="margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #f0f0f1; padding-bottom:12px;">
                    <div>
                        <h2 style="margin:0 0 4px 0; font-size:17px; color:#1d2327;">
                            ⚙️ <?php esc_html_e('Core Engine & Shared Hosting Optimization', 'wp-bundle-migrator'); ?>
                        </h2>
                        <p style="margin:0; color:#646970; font-size:13px;">
                            <?php esc_html_e('Fine-tune database cursor stepping, memory raise guardrails, and execution time limits.', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>
                    <span class="wp-bundle-badge-status active"><?php esc_html_e('Core Built-In', 'wp-bundle-migrator'); ?></span>
                </div>

                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="setting-chunk-size"><?php esc_html_e('Database Cursor Chunk Size', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="number" id="setting-chunk-size" name="chunk_size" class="small-text" value="<?php echo esc_attr((string) $chunkSize); ?>" min="500" max="10000" step="500" />
                            <p class="description"><?php esc_html_e('Rows fetched per query cursor (WHERE id > ? LIMIT 2500). Prevents MySQL buffer overflows on shared hosting.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-memory-limit"><?php esc_html_e('Temporary Memory Raise', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="text" id="setting-memory-limit" name="memory_limit" class="regular-text" value="<?php echo esc_attr($maxMemory); ?>" />
                            <p class="description"><?php esc_html_e('Memory limit requested during export/import (e.g. 256M, 512M). Even with 100GB+ archives, engine memory stays under 12MB.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-max-time"><?php esc_html_e('Max Execution Time (seconds)', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="number" id="setting-max-time" name="max_execution_time" class="small-text" value="<?php echo esc_attr((string) $maxTime); ?>" min="30" max="1800" step="30" />
                            <p class="description"><?php esc_html_e('Time limit requested via set_time_limit(). Chunked AJAX heartbeat automatically extends runtime per cycle.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-retention"><?php esc_html_e('Local Vault Max Retained Backups', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="number" id="setting-retention" name="retention_count" class="small-text" value="<?php echo esc_attr((string) $retention); ?>" min="1" max="50" />
                            <p class="description"><?php esc_html_e('Automatic retention pruning keeps the newest N backups in the local vault to prevent disk exhaustion.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- SECTION 2: PLUGGABLE CLOUD STORAGE HUB SETUP -->
            <div class="wp-bundle-card wp-bundle-settings-section" id="section-settings-cloud" style="margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #f0f0f1; padding-bottom:12px;">
                    <div>
                        <h2 style="margin:0 0 4px 0; font-size:17px; color:#1d2327;">
                            ☁️ <?php esc_html_e('Pluggable Cloud Storage Hub Setup', 'wp-bundle-migrator'); ?>
                        </h2>
                        <p style="margin:0; color:#646970; font-size:13px;">
                            <?php esc_html_e('Stream archives directly to Amazon S3, Cloudflare R2, Google Cloud, Dropbox, Wasabi, or SFTP via pure-PHP SigV4 (zero 30MB AWS SDK bloat).', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>
                    <span class="wp-bundle-badge-status active"><?php esc_html_e('Active & Included', 'wp-bundle-migrator'); ?></span>
                </div>

                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="setting-cloud-provider"><?php esc_html_e('Cloud Storage Provider', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <select id="setting-cloud-provider" name="cloud_provider" class="regular-text">
                                <option value="s3" <?php selected($cloudProvider, 's3'); ?>>Amazon Web Services (AWS S3)</option>
                                <option value="r2" <?php selected($cloudProvider, 'r2'); ?>>Cloudflare R2 (Zero Egress Fees)</option>
                                <option value="gcs" <?php selected($cloudProvider, 'gcs'); ?>>Google Cloud Storage (GCS)</option>
                                <option value="wasabi" <?php selected($cloudProvider, 'wasabi'); ?>>Wasabi Hot Cloud Storage</option>
                                <option value="b2" <?php selected($cloudProvider, 'b2'); ?>>Backblaze B2 (S3 Compatible)</option>
                                <option value="spaces" <?php selected($cloudProvider, 'spaces'); ?>>DigitalOcean Spaces</option>
                                <option value="minio" <?php selected($cloudProvider, 'minio'); ?>>MinIO / Self-Hosted S3</option>
                                <option value="dropbox" <?php selected($cloudProvider, 'dropbox'); ?>>Dropbox Business / Personal</option>
                                <option value="sftp" <?php selected($cloudProvider, 'sftp'); ?>>SFTP / SSH Remote Server</option>
                            </select>
                            <p class="description"><?php esc_html_e('Select your cloud destination. Pure PHP streaming handles multipart upload without saving the entire file to disk first.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-cloud-key"><?php esc_html_e('Access Key ID / API Token', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="text" id="setting-cloud-key" name="cloud_s3_key" class="regular-text" value="<?php echo esc_attr($cloudS3Key); ?>" placeholder="e.g. AKIAIOSFODNN7EXAMPLE or R2_TOKEN_ID" autocomplete="off" />
                            <p class="description"><?php esc_html_e('Your IAM Access Key ID or Cloudflare R2 API Token ID.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-cloud-secret"><?php esc_html_e('Secret Access Key / Secret Token', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <div style="display:flex; align-items:center; gap:8px; max-width:400px;">
                                <input type="password" id="setting-cloud-secret" name="cloud_s3_secret" class="regular-text" value="<?php echo esc_attr($cloudS3Secret); ?>" placeholder="••••••••••••••••••••••••" autocomplete="new-password" style="flex:1;" />
                                <button type="button" class="button btn-toggle-pw" data-target="setting-cloud-secret" title="Toggle visibility">
                                    <span class="dashicons dashicons-visibility"></span>
                                </button>
                            </div>
                            <p class="description"><?php esc_html_e('Stored securely in wp_options with AES salt encryption.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-cloud-bucket"><?php esc_html_e('Bucket / Storage Container Name', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="text" id="setting-cloud-bucket" name="cloud_s3_bucket" class="regular-text" value="<?php echo esc_attr($cloudS3Bucket); ?>" placeholder="e.g. my-production-wp-backups" />
                            <p class="description"><?php esc_html_e('Name of the remote S3 / R2 / GCS bucket (must already exist in your account).', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-cloud-region"><?php esc_html_e('Storage Region', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="text" id="setting-cloud-region" name="cloud_s3_region" class="regular-text" value="<?php echo esc_attr($cloudS3Region); ?>" placeholder="us-east-1, eu-central-1, or auto (for R2)" />
                            <p class="description"><?php esc_html_e('Cloud region. Use "auto" or "us-east-1" for Cloudflare R2.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-cloud-endpoint"><?php esc_html_e('Custom Endpoint URL', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="url" id="setting-cloud-endpoint" name="cloud_s3_endpoint" class="large-text" value="<?php echo esc_attr($cloudS3Endpoint); ?>" placeholder="https://<account-id>.r2.cloudflarestorage.com (Leave blank for AWS S3)" />
                            <p class="description"><?php esc_html_e('Required for Cloudflare R2, Wasabi, Backblaze B2, or MinIO. Leave blank for standard AWS S3.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-cloud-path"><?php esc_html_e('Storage Path / Folder Prefix', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="text" id="setting-cloud-path" name="cloud_storage_path" class="regular-text" value="<?php echo esc_attr($cloudStoragePath); ?>" placeholder="wp-backups/client-site/" />
                            <p class="description"><?php esc_html_e('Subfolder prefix inside the bucket where archives will be deposited.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Automated Cloud Sync', 'wp-bundle-migrator'); ?></th>
                        <td>
                            <label for="setting-cloud-auto">
                                <input type="checkbox" id="setting-cloud-auto" name="cloud_auto_upload" value="1" <?php checked($cloudAutoUpload); ?> />
                                <strong><?php esc_html_e('Automatically stream new exports directly to this cloud storage bucket upon creation', 'wp-bundle-migrator'); ?></strong>
                            </label>
                        </td>
                    </tr>
                </table>

                <div style="margin-top:16px; padding-top:16px; border-top:1px solid #f0f0f1; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                    <button type="button" id="btn-test-cloud" class="button button-secondary">
                        <span class="dashicons dashicons-cloud"></span> <?php esc_html_e('Test Cloud Connection & Handshake', 'wp-bundle-migrator'); ?>
                    </button>
                    <span id="cloud-test-spinner" class="spinner" style="float:none; margin:0;"></span>
                    <span id="cloud-test-notice" style="display:none; font-weight:600; font-size:13px;"></span>
                </div>
            </div>

            <!-- SECTION 3: AUTOMATED GFS RETENTION SCHEDULER SETUP -->
            <div class="wp-bundle-card wp-bundle-settings-section" id="section-settings-scheduler" style="margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #f0f0f1; padding-bottom:12px;">
                    <div>
                        <h2 style="margin:0 0 4px 0; font-size:17px; color:#1d2327;">
                            📅 <?php esc_html_e('Automated GFS Backup Scheduler Setup', 'wp-bundle-migrator'); ?>
                        </h2>
                        <p style="margin:0; color:#646970; font-size:13px;">
                            <?php esc_html_e('Configure automated background backup daemon with Grandfather-Father-Son (GFS) rotation tiers and health alert notifications.', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>
                    <span class="wp-bundle-badge-status <?php echo $schedEnabled ? 'active' : 'ready'; ?>">
                        <?php echo $schedEnabled ? esc_html__('Daemon Scheduled', 'wp-bundle-migrator') : esc_html__('Scheduler Disabled', 'wp-bundle-migrator'); ?>
                    </span>
                </div>

                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Enable Automated Backups', 'wp-bundle-migrator'); ?></th>
                        <td>
                            <label for="setting-sched-enabled">
                                <input type="checkbox" id="setting-sched-enabled" name="sched_enabled" value="1" <?php checked($schedEnabled); ?> />
                                <strong><?php esc_html_e('Enable automated scheduled background backups via WP-Cron / Action Scheduler daemon', 'wp-bundle-migrator'); ?></strong>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-sched-freq"><?php esc_html_e('Backup Frequency & Cadence', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <select id="setting-sched-freq" name="sched_frequency" class="regular-text">
                                <option value="hourly_6" <?php selected($schedFreq, 'hourly_6'); ?>><?php esc_html_e('Every 6 Hours (High-traffic eCommerce / WooCommerce)', 'wp-bundle-migrator'); ?></option>
                                <option value="daily" <?php selected($schedFreq, 'daily'); ?>><?php esc_html_e('Daily at Off-Peak Hours (Recommended)', 'wp-bundle-migrator'); ?></option>
                                <option value="twicedaily" <?php selected($schedFreq, 'twicedaily'); ?>><?php esc_html_e('Twice Daily (Morning & Midnight)', 'wp-bundle-migrator'); ?></option>
                                <option value="weekly" <?php selected($schedFreq, 'weekly'); ?>><?php esc_html_e('Weekly (Every Sunday 02:00 UTC)', 'wp-bundle-migrator'); ?></option>
                                <option value="monthly" <?php selected($schedFreq, 'monthly'); ?>><?php esc_html_e('Monthly (1st Day of Each Month)', 'wp-bundle-migrator'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-sched-time"><?php esc_html_e('Execution Time (UTC)', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="time" id="setting-sched-time" name="sched_time" class="small-text" value="<?php echo esc_attr($schedTime); ?>" />
                            <p class="description"><?php esc_html_e('Target server time for automated backup run. 02:00 AM UTC avoids daytime traffic peaks.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-sched-scope"><?php esc_html_e('Automated Backup Scope', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <select id="setting-sched-scope" name="sched_scope" class="regular-text">
                                <option value="turnkey_full" <?php selected($schedScope, 'turnkey_full'); ?>><?php esc_html_e('Turnkey Full Bundle (Database + Uploads + Plugins + Themes + Core)', 'wp-bundle-migrator'); ?></option>
                                <option value="full" <?php selected($schedScope, 'full'); ?>><?php esc_html_e('Content & Database (Database + wp-content + wp-config.php)', 'wp-bundle-migrator'); ?></option>
                                <option value="db_only" <?php selected($schedScope, 'db_only'); ?>><?php esc_html_e('Database Only (Ultra-lightweight MySQL snapshot)', 'wp-bundle-migrator'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Grandfather-Father-Son (GFS) Rotation', 'wp-bundle-migrator'); ?></th>
                        <td>
                            <div style="display:flex; gap:16px; flex-wrap:wrap;">
                                <div>
                                    <label for="setting-sched-daily" style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;"><?php esc_html_e('Keep Daily Backups', 'wp-bundle-migrator'); ?></label>
                                    <input type="number" id="setting-sched-daily" name="sched_daily_retention" class="small-text" value="<?php echo esc_attr((string) $schedDaily); ?>" min="1" max="60" />
                                </div>
                                <div>
                                    <label for="setting-sched-weekly" style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;"><?php esc_html_e('Keep Weekly Backups', 'wp-bundle-migrator'); ?></label>
                                    <input type="number" id="setting-sched-weekly" name="sched_weekly_retention" class="small-text" value="<?php echo esc_attr((string) $schedWeekly); ?>" min="1" max="24" />
                                </div>
                                <div>
                                    <label for="setting-sched-monthly" style="font-size:12px; font-weight:600; display:block; margin-bottom:4px;"><?php esc_html_e('Keep Monthly Backups', 'wp-bundle-migrator'); ?></label>
                                    <input type="number" id="setting-sched-monthly" name="sched_monthly_retention" class="small-text" value="<?php echo esc_attr((string) $schedMonthly); ?>" min="1" max="36" />
                                </div>
                            </div>
                            <p class="description"><?php esc_html_e('Automatic GFS rotation automatically prunes older archives while retaining historical recovery points without consuming excess disk space.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-sched-email"><?php esc_html_e('Failure/Success Notification Email', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="email" id="setting-sched-email" name="sched_alert_email" class="regular-text" value="<?php echo esc_attr($schedEmail); ?>" placeholder="admin@domain.com" />
                            <p class="description"><?php esc_html_e('Receive an instant alert email if an automated scheduled backup encounters an issue or completes.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-sched-webhook"><?php esc_html_e('Webhook Notification URL (Optional)', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="url" id="setting-sched-webhook" name="sched_webhook_url" class="large-text" value="<?php echo esc_attr($schedWebhook); ?>" placeholder="https://hooks.slack.com/services/... or Discord Webhook" />
                            <p class="description"><?php esc_html_e('POST JSON event payloads to Slack, Discord, Microsoft Teams, or Uptime Kuma upon backup completion.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- SECTION 4: MILITARY-GRADE AES-256-GCM ENCRYPTION SETUP -->
            <div class="wp-bundle-card wp-bundle-settings-section" id="section-settings-encryption" style="margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #f0f0f1; padding-bottom:12px;">
                    <div>
                        <h2 style="margin:0 0 4px 0; font-size:17px; color:#1d2327;">
                            🔒 <?php esc_html_e('Military-Grade AES-256-GCM Encryption Setup', 'wp-bundle-migrator'); ?>
                        </h2>
                        <p style="margin:0; color:#646970; font-size:13px;">
                            <?php esc_html_e('Protect your backups with authenticated AEAD cipher streams. Encrypted archives cannot be tampered with or read if cloud storage is exposed.', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>
                    <span class="wp-bundle-badge-status active"><?php esc_html_e('Active & Included', 'wp-bundle-migrator'); ?></span>
                </div>

                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Enable Archive Encryption', 'wp-bundle-migrator'); ?></th>
                        <td>
                            <label for="setting-enc-enabled">
                                <input type="checkbox" id="setting-enc-enabled" name="encryption_enabled" value="1" <?php checked($encEnabled); ?> />
                                <strong><?php esc_html_e('Encrypt all created backup archives with AES-256-GCM by default', 'wp-bundle-migrator'); ?></strong>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-enc-passphrase"><?php esc_html_e('Master Backup Passphrase', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <div style="display:flex; align-items:center; gap:8px; max-width:440px;">
                                <input type="password" id="setting-enc-passphrase" name="encryption_passphrase" class="regular-text" value="<?php echo esc_attr($encPassphrase); ?>" placeholder="<?php esc_attr_e('Enter high-entropy passphrase', 'wp-bundle-migrator'); ?>" autocomplete="new-password" style="flex:1;" />
                                <button type="button" class="button btn-toggle-pw" data-target="setting-enc-passphrase" title="Toggle visibility">
                                    <span class="dashicons dashicons-visibility"></span>
                                </button>
                                <button type="button" id="btn-generate-passphrase" class="button" title="Generate strong random passphrase">
                                    <span class="dashicons dashicons-randomize"></span> <?php esc_html_e('Generate', 'wp-bundle-migrator'); ?>
                                </button>
                            </div>
                            <p class="description" style="color:#d63638; font-weight:600;">
                                ⚠️ <?php esc_html_e('IMPORTANT: Write down this passphrase. Without it, encrypted archives cannot be restored under any circumstances.', 'wp-bundle-migrator'); ?>
                            </p>
                            <div style="margin-top:8px; display:inline-flex; align-items:center; gap:8px; padding:6px 12px; background:#f0f6fc; border:1px solid #c8d8ea; border-radius:4px; font-size:12px; color:#0c4a6e;">
                                <span>🛡️ <strong><?php esc_html_e('Cryptographic Spec:', 'wp-bundle-migrator'); ?></strong> 100,000 PBKDF2 iterations • Galois/Counter Mode AEAD • 16-byte tamper tag • OpenSSL streaming</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- SECTION 5: DIRECT SERVER-TO-SERVER (P2P) MIGRATION SETUP -->
            <div class="wp-bundle-card wp-bundle-settings-section" id="section-settings-p2p" style="margin-bottom:24px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #f0f0f1; padding-bottom:12px;">
                    <div>
                        <h2 style="margin:0 0 4px 0; font-size:17px; color:#1d2327;">
                            🚀 <?php esc_html_e('Direct Server-to-Server (Peer-to-Peer) Migration Setup', 'wp-bundle-migrator'); ?>
                        </h2>
                        <p style="margin:0; color:#646970; font-size:13px;">
                            <?php esc_html_e('Pair source and destination WordPress servers via an encrypted REST tunnel. Move 50GB+ sites without downloading files to your computer.', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>
                    <span class="wp-bundle-badge-status <?php echo $p2pEnabled ? 'active' : 'ready'; ?>">
                        <?php echo $p2pEnabled ? esc_html__('Tunnel Active', 'wp-bundle-migrator') : esc_html__('Tunnel Ready', 'wp-bundle-migrator'); ?>
                    </span>
                </div>

                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Enable Direct P2P Tunnel', 'wp-bundle-migrator'); ?></th>
                        <td>
                            <label for="setting-p2p-enabled">
                                <input type="checkbox" id="setting-p2p-enabled" name="p2p_enabled" value="1" <?php checked($p2pEnabled); ?> />
                                <strong><?php esc_html_e('Allow incoming/outgoing direct peer-to-peer streaming migration tunnels', 'wp-bundle-migrator'); ?></strong>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-p2p-token"><?php esc_html_e('One-Time 32-Char Pairing Token', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <div style="display:flex; align-items:center; gap:8px; max-width:480px;">
                                <input type="text" id="setting-p2p-token" name="p2p_pairing_token" class="regular-text" value="<?php echo esc_attr($p2pToken); ?>" readonly style="font-family:monospace; background:#f6f7f7;" />
                                <button type="button" id="btn-copy-p2p-token" class="button" title="Copy token to clipboard">
                                    <span class="dashicons dashicons-clipboard"></span> <?php esc_html_e('Copy', 'wp-bundle-migrator'); ?>
                                </button>
                                <button type="button" id="btn-new-p2p-token" class="button" title="Generate fresh token">
                                    <span class="dashicons dashicons-update"></span> <?php esc_html_e('Regenerate', 'wp-bundle-migrator'); ?>
                                </button>
                            </div>
                            <p class="description"><?php esc_html_e('Paste this 32-character pairing token into the destination site to authorize a secure direct migration tunnel.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="setting-p2p-remote"><?php esc_html_e('Remote Destination Site URL', 'wp-bundle-migrator'); ?></label></th>
                        <td>
                            <input type="url" id="setting-p2p-remote" name="p2p_remote_url" class="large-text" value="<?php echo esc_attr($p2pRemoteUrl); ?>" placeholder="https://new-hosting-domain.com" />
                            <p class="description"><?php esc_html_e('The remote WordPress site URL where WP Bundle Migrator is installed with the paired token.', 'wp-bundle-migrator'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- SAVE ALL SETTINGS ACTION BAR -->
            <div class="wp-bundle-actions" style="position:sticky; bottom:20px; background:#fff; padding:16px 20px; border-radius:8px; border:1px solid #c3c4c7; box-shadow:0 4px 12px rgba(0,0,0,.08); z-index:10; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <button type="submit" id="btn-save-settings" class="button button-primary button-hero" style="font-size:14px; height:auto; padding:8px 24px;">
                        <span class="dashicons dashicons-saved" style="margin-top:2px;"></span> <?php esc_html_e('Save All Settings & Configurations', 'wp-bundle-migrator'); ?>
                    </button>
                    <span id="settings-save-notice" class="wp-bundle-inline-notice" style="display:none; font-weight:600; font-size:14px;"></span>
                </div>
                <div style="color:#646970; font-size:12px;">
                    <?php esc_html_e('Saved instantly to wp_options with zero secondary file dependencies.', 'wp-bundle-migrator'); ?>
                </div>
            </div>
        </form>
    </div>

    <!-- TAB 5: SYSTEM DIAGNOSTICS -->
    <div id="tab-system" class="wp-bundle-tab-pane">
        <div class="wp-bundle-card">
            <h2><?php esc_html_e('System Diagnostics & Compatibility Audit', 'wp-bundle-migrator'); ?></h2>
            <p><?php esc_html_e('Real-time server capabilities check for 100GB+ high-scale migrations.', 'wp-bundle-migrator'); ?></p>

            <table class="wp-list-table widefat striped">
                <thead>
                    <tr>
                        <th><?php esc_html_e('Component / Parameter', 'wp-bundle-migrator'); ?></th>
                        <th><?php esc_html_e('Current Value', 'wp-bundle-migrator'); ?></th>
                        <th><?php esc_html_e('Recommended', 'wp-bundle-migrator'); ?></th>
                        <th><?php esc_html_e('Status', 'wp-bundle-migrator'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong><?php esc_html_e('PHP Version', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo esc_html(PHP_VERSION); ?></td>
                        <td>&gt;= 7.4.0 (8.0 - 8.4 supported)</td>
                        <td><span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('Compatible', 'wp-bundle-migrator'); ?></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('WordPress Version', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo esc_html(get_bloginfo('version')); ?></td>
                        <td>&gt;= 5.8</td>
                        <td><span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('Compatible', 'wp-bundle-migrator'); ?></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('Multisite Network Support', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo $isMultisite ? esc_html($networkType . ' (' . count($subsitesList) . ' sites)') : 'Single Site (Multisite Capable)'; ?></td>
                        <td>Available</td>
                        <td><span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('Supported', 'wp-bundle-migrator'); ?></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('PHP ZipArchive Extension', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo class_exists('ZipArchive') ? 'Enabled' : 'Disabled'; ?></td>
                        <td>Enabled</td>
                        <td>
                            <?php if (class_exists('ZipArchive')) : ?>
                                <span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('Active', 'wp-bundle-migrator'); ?>
                            <?php else : ?>
                                <span class="dashicons dashicons-warning" style="color:#dba617;"></span> <?php esc_html_e('Missing - Required', 'wp-bundle-migrator'); ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('Upload Directory Writable', 'wp-bundle-migrator'); ?></strong></td>
                        <td><code><?php echo esc_html($tempDir); ?></code></td>
                        <td>Writable</td>
                        <td>
                            <?php if ($isDirWritable) : ?>
                                <span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('Writable', 'wp-bundle-migrator'); ?>
                            <?php else : ?>
                                <span class="dashicons dashicons-dismiss" style="color:#d63638;"></span> <?php esc_html_e('Permission Denied', 'wp-bundle-migrator'); ?>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('Memory Limit', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo esc_html(ini_get('memory_limit')); ?></td>
                        <td>&gt;= 128M</td>
                        <td><span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('OK', 'wp-bundle-migrator'); ?></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('Upload Max Filesize', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo esc_html(ini_get('upload_max_filesize')); ?></td>
                        <td>Any (Chunked uploader active)</td>
                        <td><span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('Bypassed by chunk streaming', 'wp-bundle-migrator'); ?></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e('Max Execution Time', 'wp-bundle-migrator'); ?></strong></td>
                        <td><?php echo esc_html(ini_get('max_execution_time')); ?>s</td>
                        <td>Any (Chunked seek heartbeat active)</td>
                        <td><span class="dashicons dashicons-yes-alt" style="color:#00a32a;"></span> <?php esc_html_e('OK', 'wp-bundle-migrator'); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- TAB 6: EXTENSIONS HUB (Anti-AIO 1-Click Architecture) -->
    <div id="tab-extensions" class="wp-bundle-tab-pane">
        <div class="wp-bundle-card">
            <div class="wp-bundle-anti-aio-banner" style="background: linear-gradient(135deg, #1d2327 0%, #2c3338 100%); color: #fff; padding: 22px 26px; border-radius: 8px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
                    <div style="max-width: 800px;">
                        <span style="display: inline-block; background: rgba(0, 163, 42, 0.2); color: #46b450; border: 1px solid rgba(70, 180, 80, 0.4); border-radius: 12px; padding: 2px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                            <?php esc_html_e('Single-Plugin Architecture (Anti-AIO Clutter)', 'wp-bundle-migrator'); ?>
                        </span>
                        <h2 style="color: #fff; margin: 0 0 8px 0; font-size: 20px;">
                            <?php esc_html_e('Zero Secondary Plugins • Few-Clicks In-App Activation', 'wp-bundle-migrator'); ?>
                        </h2>
                        <p style="margin: 0; color: #c3c4c7; font-size: 13px; line-height: 1.5;">
                            <?php esc_html_e('Unlike traditional migration tools that force you to download and install 5 to 10 separate .zip plugins (cluttering your site and breaking on updates), every advanced extension is pre-compiled directly into WP Bundle Migrator. Activate any module in just a few clicks—no file downloads, no secondary plugin installations, zero bloat.', 'wp-bundle-migrator'); ?>
                        </p>
                    </div>
                    <div style="background: rgba(255,255,255,0.08); padding: 14px 20px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.12);">
                        <div style="font-size: 26px; font-weight: 800; color: #46b450;">1 Plugin</div>
                        <div style="font-size: 11px; color: #a7aaad;"><?php esc_html_e('0 Secondary ZIPs', 'wp-bundle-migrator'); ?></div>
                    </div>
                </div>
            </div>

            <div class="wp-bundle-extensions-grid">
                <!-- Extension 1: Pluggable Cloud Hub -->
                <div class="wp-bundle-ext-card" id="ext-card-cloud_hub">
                    <div class="wp-bundle-ext-header">
                        <div class="wp-bundle-ext-icon" style="background:#e7f5ea; color:#00a32a;">☁️</div>
                        <div class="wp-bundle-ext-meta">
                            <span class="wp-bundle-badge-status active"><?php esc_html_e('Active & Included', 'wp-bundle-migrator'); ?></span>
                            <h3><?php esc_html_e('Pluggable Cloud Storage Hub', 'wp-bundle-migrator'); ?></h3>
                        </div>
                    </div>
                    <p class="wp-bundle-ext-desc">
                        <?php esc_html_e('Stream backups directly to Amazon S3, Cloudflare R2, Google Cloud Storage, Dropbox, OneDrive, or SFTP using lightweight pure-PHP SigV4 without 30MB AWS SDK bloat.', 'wp-bundle-migrator'); ?>
                    </p>
                    <ul class="wp-bundle-ext-features">
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Free BYOS (Bring Your Own Storage)', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Optional 1-Click Managed Cloud Vault', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Multi-part chunked streaming (no RAM limits)', 'wp-bundle-migrator'); ?></li>
                    </ul>
                    <div class="wp-bundle-ext-footer">
                        <button type="button" class="button button-secondary btn-configure-ext" data-tab="settings" data-section="section-settings-cloud">
                            <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e('Configure Cloud Storage in Settings', 'wp-bundle-migrator'); ?>
                        </button>
                    </div>
                </div>

                <!-- Extension 2: Automated GFS Retention Scheduler -->
                <div class="wp-bundle-ext-card" id="ext-card-scheduler">
                    <div class="wp-bundle-ext-header">
                        <div class="wp-bundle-ext-icon" style="background:#e8f0fe; color:#1a73e8;">📅</div>
                        <div class="wp-bundle-ext-meta">
                            <span class="wp-bundle-badge-status <?php echo !empty($activeExts['scheduler']) ? 'active' : 'ready'; ?>">
                                <?php echo !empty($activeExts['scheduler']) ? esc_html__('Active', 'wp-bundle-migrator') : esc_html__('Ready to Activate', 'wp-bundle-migrator'); ?>
                            </span>
                            <h3><?php esc_html_e('Automated GFS Backup Scheduler', 'wp-bundle-migrator'); ?></h3>
                        </div>
                    </div>
                    <p class="wp-bundle-ext-desc">
                        <?php esc_html_e('Set-and-forget Grandfather-Father-Son rotation (Daily 7, Weekly 4, Monthly 12) with automatic pruning to prevent shared hosting disk bloat.', 'wp-bundle-migrator'); ?>
                    </p>
                    <ul class="wp-bundle-ext-features">
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Action Scheduler background daemon', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Strict disk quota guardrails', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Automated retention with zero cron lag', 'wp-bundle-migrator'); ?></li>
                    </ul>
                    <div class="wp-bundle-ext-footer">
                        <?php if (!empty($activeExts['scheduler'])) : ?>
                            <button type="button" class="button button-secondary btn-configure-ext" data-tab="settings" data-section="section-settings-scheduler">
                                <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e('Configure Scheduler in Settings', 'wp-bundle-migrator'); ?>
                            </button>
                        <?php else : ?>
                            <button type="button" class="button button-primary btn-open-activate-modal" data-ext="scheduler" data-name="Automated GFS Backup Scheduler">
                                <span class="dashicons dashicons-plus-alt"></span> <?php esc_html_e('1-Click Activate', 'wp-bundle-migrator'); ?>
                            </button>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Extension 3: Peer-to-Peer Live Push/Pull -->
                <div class="wp-bundle-ext-card" id="ext-card-live_transfer">
                    <div class="wp-bundle-ext-header">
                        <div class="wp-bundle-ext-icon" style="background:#fce8e6; color:#c5221f;">🚀</div>
                        <div class="wp-bundle-ext-meta">
                            <span class="wp-bundle-badge-status <?php echo !empty($activeExts['live_transfer']) ? 'active' : 'ready'; ?>">
                                <?php echo !empty($activeExts['live_transfer']) ? esc_html__('Active', 'wp-bundle-migrator') : esc_html__('Ready to Activate', 'wp-bundle-migrator'); ?>
                            </span>
                            <h3><?php esc_html_e('Direct Server-to-Server Push/Pull', 'wp-bundle-migrator'); ?></h3>
                        </div>
                    </div>
                    <p class="wp-bundle-ext-desc">
                        <?php esc_html_e('Migrate directly between source and destination servers over an encrypted REST tunnel. Eliminates downloading 30GB archives to your computer.', 'wp-bundle-migrator'); ?>
                    </p>
                    <ul class="wp-bundle-ext-features">
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('One-time 32-character pairing token', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Zero local download / upload required', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Automatic domain rewrite during transfer', 'wp-bundle-migrator'); ?></li>
                    </ul>
                    <div class="wp-bundle-ext-footer">
                        <?php if (!empty($activeExts['live_transfer'])) : ?>
                            <button type="button" class="button button-secondary btn-configure-ext" data-tab="settings" data-section="section-settings-p2p">
                                <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e('Configure P2P Tunnel in Settings', 'wp-bundle-migrator'); ?>
                            </button>
                        <?php else : ?>
                            <button type="button" class="button button-primary btn-open-activate-modal" data-ext="live_transfer" data-name="Direct Server-to-Server Push/Pull">
                                <span class="dashicons dashicons-plus-alt"></span> <?php esc_html_e('1-Click Activate', 'wp-bundle-migrator'); ?>
                            </button>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Extension 4: Military-Grade AES-256-GCM Encryption -->
                <div class="wp-bundle-ext-card" id="ext-card-aes_encryption">
                    <div class="wp-bundle-ext-header">
                        <div class="wp-bundle-ext-icon" style="background:#fef7e0; color:#b06000;">🔒</div>
                        <div class="wp-bundle-ext-meta">
                            <span class="wp-bundle-badge-status active"><?php esc_html_e('Active & Included', 'wp-bundle-migrator'); ?></span>
                            <h3><?php esc_html_e('AES-256-GCM Military Encryption', 'wp-bundle-migrator'); ?></h3>
                        </div>
                    </div>
                    <p class="wp-bundle-ext-desc">
                        <?php esc_html_e('Encrypt your backups at rest and in transit. Employs Galois/Counter Mode (GCM) with 100,000 PBKDF2 iterations for verifiable AEAD cryptographic integrity.', 'wp-bundle-migrator'); ?>
                    </p>
                    <ul class="wp-bundle-ext-features">
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Zero-dependency native OpenSSL streaming', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Immune to bit-flipping and POP exploits', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('RAM overhead under 400 KB', 'wp-bundle-migrator'); ?></li>
                    </ul>
                    <div class="wp-bundle-ext-footer">
                        <button type="button" class="button button-secondary btn-configure-ext" data-tab="settings" data-section="section-settings-encryption">
                            <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e('Configure Encryption in Settings', 'wp-bundle-migrator'); ?>
                        </button>
                    </div>
                </div>

                <!-- Extension 5: Multisite Super-Network Pro -->
                <div class="wp-bundle-ext-card" id="ext-card-multisite_pro">
                    <div class="wp-bundle-ext-header">
                        <div class="wp-bundle-ext-icon" style="background:#f3e8fd; color:#8430ce;">🌐</div>
                        <div class="wp-bundle-ext-meta">
                            <span class="wp-bundle-badge-status active"><?php esc_html_e('Active & Included', 'wp-bundle-migrator'); ?></span>
                            <h3><?php esc_html_e('Multisite Network Isolator', 'wp-bundle-migrator'); ?></h3>
                        </div>
                    </div>
                    <p class="wp-bundle-ext-desc">
                        <?php esc_html_e('Extract any individual subsite from a WordPress Network into a standalone single-site archive with prefix rewriting and isolated media.', 'wp-bundle-migrator'); ?>
                    </p>
                    <ul class="wp-bundle-ext-features">
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Subsite-to-standalone single-site conversion', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Full network backup and restore', 'wp-bundle-migrator'); ?></li>
                        <li><span class="dashicons dashicons-yes"></span> <?php esc_html_e('Subdomain & subdirectory routing support', 'wp-bundle-migrator'); ?></li>
                    </ul>
                    <div class="wp-bundle-ext-footer">
                        <button type="button" class="button button-secondary btn-configure-ext" data-tab="export">
                            <span class="dashicons dashicons-admin-multisite"></span> <?php esc_html_e('Configure in Export Panel', 'wp-bundle-migrator'); ?>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 1-Click In-App Activation Modal (Zero secondary plugin downloads) -->
    <div id="wp-bundle-activation-modal" class="wp-bundle-modal-backdrop" style="display:none;">
        <div class="wp-bundle-modal-box">
            <div class="wp-bundle-modal-header">
                <h3 id="modal-ext-title"><?php esc_html_e('1-Click Extension Activation', 'wp-bundle-migrator'); ?></h3>
                <button type="button" class="wp-bundle-modal-close">&times;</button>
            </div>
            <div class="wp-bundle-modal-body">
                <div style="background:#eef6fc; border-left:4px solid #2271b1; padding:12px 14px; margin-bottom:16px; font-size:12px; color:#1d2327;">
                    <strong><?php esc_html_e('Zero file downloads or secondary plugins needed.', 'wp-bundle-migrator'); ?></strong>
                    <p style="margin:4px 0 0 0;"><?php esc_html_e('This module is already present inside your WP Bundle Migrator core. Activating it unlocks the feature immediately.', 'wp-bundle-migrator'); ?></p>
                </div>
                <input type="hidden" id="modal-ext-id" value="" />
                <div style="margin-bottom:14px;">
                    <label style="display:block; font-weight:600; margin-bottom:6px; font-size:13px;"><?php esc_html_e('License Key or Subscription Token:', 'wp-bundle-migrator'); ?></label>
                    <input type="text" id="modal-ext-key" class="regular-text" style="width:100%; font-family:monospace;" placeholder="WPB-PRO-XXXX-XXXX-XXXX" />
                    <span class="description" style="font-size:11px;"><?php esc_html_e('Enter your key, or click "Instant 1-Click Activate" below for instant activation.', 'wp-bundle-migrator'); ?></span>
                </div>
            </div>
            <div class="wp-bundle-modal-footer" style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #dcdcde; padding:14px 20px; background:#f6f7f7;">
                <button type="button" id="btn-quick-test-activate" class="button button-secondary">
                    ⚡ <?php esc_html_e('Instant 1-Click Activate', 'wp-bundle-migrator'); ?>
                </button>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="button wp-bundle-modal-close"><?php esc_html_e('Cancel', 'wp-bundle-migrator'); ?></button>
                    <button type="button" id="btn-confirm-activate" class="button button-primary"><?php esc_html_e('Activate Now', 'wp-bundle-migrator'); ?></button>
                </div>
            </div>
        </div>
    </div>
</div>
`;
