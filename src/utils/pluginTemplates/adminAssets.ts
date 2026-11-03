/**
 * WordPress Admin CSS and JS assets (assets/css/admin.css, assets/js/migrator.min.js)
 * Supports full WordPress files (Core, Root, wp-config, mu-plugins, languages) & WordPress Multisite networks.
 * Modernized UI: zero static candy pills, clean unboxed metadata with separators, tabular figures, accessible contrast.
 */
export const adminCss = `/**
 * WP Bundle Migrator Admin UI Styles - Modern Design System
 */
.wp-bundle-wrap {
    max-width: 1240px;
    margin: 24px 20px 48px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
}

/* Header */
.wp-bundle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.wp-bundle-brand {
    display: flex;
    align-items: center;
    gap: 16px;
}

.wp-bundle-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: #0f172a;
    color: #ffffff;
    border-radius: 10px;
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
    letter-spacing: -0.02em;
}

.wp-bundle-brand h1 {
    font-size: 19px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
    padding: 0;
    line-height: 1.2;
    letter-spacing: -0.01em;
}

.wp-bundle-brand-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    margin: 0;
}

.wp-bundle-header-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
}

.wp-bundle-status-active {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: #059669;
}

.wp-bundle-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #10b981;
    display: inline-block;
}

/* Multisite Banner */
.wp-bundle-network-banner {
    display: flex;
    gap: 14px;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 20px;
    margin-bottom: 24px;
}

.wp-bundle-network-icon {
    font-size: 24px;
    flex-shrink: 0;
    color: #4f46e5;
}

.wp-bundle-network-body strong {
    color: #0f172a;
    font-size: 13.5px;
    display: block;
    margin-bottom: 2px;
}

.wp-bundle-network-body p {
    margin: 0;
    color: #475569;
    font-size: 12.5px;
}

/* Modern Segmented Navigation Tabs */
.wp-bundle-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 24px;
    overflow-x: auto;
}

.wp-bundle-tabs .nav-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    background: transparent;
    border: none;
    border-radius: 8px;
    margin: 0;
    white-space: nowrap;
    text-decoration: none;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
}

.wp-bundle-tabs .nav-tab .dashicons {
    font-size: 16px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    color: inherit;
}

.wp-bundle-tabs .nav-tab:hover {
    color: #0f172a;
    background: rgba(255, 255, 255, 0.7);
}

.wp-bundle-tabs .nav-tab.nav-tab-active {
    color: #0f172a;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.wp-bundle-tab-pane {
    display: none;
}

.wp-bundle-tab-pane.wp-bundle-tab-active {
    display: block;
}

/* Grid & Layout */
.wp-bundle-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
    align-items: start;
}

@media (max-width: 980px) {
    .wp-bundle-grid {
        grid-template-columns: 1fr;
    }
}

/* Cards & Sections */
.wp-bundle-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.wp-bundle-card-main h2 {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 6px;
    letter-spacing: -0.01em;
}

.wp-bundle-card-main p {
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 20px;
}

.wp-bundle-section {
    border-top: 1px solid #f1f5f9;
    padding-top: 20px;
    margin-top: 20px;
}

.wp-bundle-section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
}

.wp-bundle-section h3 {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #334155;
    margin: 0 0 4px 0;
}

.wp-bundle-section p.description {
    font-size: 12.5px;
    color: #64748b;
    margin: 0;
}

/* Quick Actions */
.wp-bundle-quick-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.wp-bundle-quick-actions .button {
    font-size: 11.5px !important;
    padding: 3px 10px !important;
    height: auto !important;
    line-height: 1.6 !important;
    border-radius: 6px !important;
    border-color: #e2e8f0 !important;
    color: #475569 !important;
    background: #f8fafc !important;
}

.wp-bundle-quick-actions .button:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border-color: #cbd5e1 !important;
}

/* Radio Cards (Presets) */
.wp-bundle-radio-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.wp-bundle-radio-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.wp-bundle-radio-card:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
}

.wp-bundle-radio-card.selected {
    border-color: #4f46e5;
    background: #f8faff;
    box-shadow: 0 0 0 1px #4f46e5;
}

.wp-bundle-radio-card input[type="radio"] {
    margin-top: 2px;
}

.wp-bundle-radio-content {
    flex: 1;
}

.wp-bundle-radio-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 3px;
}

.wp-bundle-radio-title strong {
    color: #0f172a;
    font-size: 13.5px;
    font-weight: 600;
}

.wp-bundle-radio-meta {
    font-size: 11.5px;
    color: #64748b;
    font-weight: 500;
}

.wp-bundle-radio-desc {
    display: block;
    color: #64748b;
    font-size: 12.5px;
    line-height: 1.45;
}

/* Checkbox Grid (Granular Components) */
.wp-bundle-checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
}

.wp-bundle-checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.wp-bundle-checkbox-item:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
}

.wp-bundle-checkbox-item.checked {
    border-color: #cbd5e1;
    background: #f8fafc;
}

.wp-bundle-checkbox-lead {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 1px;
}

.wp-bundle-checkbox-lead input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
}

.wp-bundle-icon-chip {
    font-size: 15px;
    line-height: 1;
}

.wp-bundle-checkbox-body {
    flex: 1;
}

.wp-bundle-checkbox-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 2px;
}

.wp-bundle-checkbox-body strong {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
}

.wp-bundle-size-chip {
    font-size: 11px;
    color: #64748b;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-variant-numeric: tabular-nums;
}

.wp-bundle-checkbox-body small {
    display: block;
    color: #64748b;
    font-size: 11.5px;
    line-height: 1.4;
}

/* Sticky Blueprint Sidebar */
.wp-bundle-sidebar {
    position: sticky;
    top: 32px;
}

.wp-bundle-blueprint-card h3 {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 14px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
}

.wp-bundle-metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 12.5px;
    border-bottom: 1px solid #f8fafc;
}

.wp-bundle-metric-row .metric-label {
    color: #64748b;
}

.wp-bundle-metric-row .metric-value {
    font-weight: 600;
    color: #0f172a;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-variant-numeric: tabular-nums;
}

.wp-bundle-metric-row.highlight .metric-value {
    color: #4f46e5;
    font-weight: 700;
    font-size: 13.5px;
}

.wp-bundle-blueprint-composition {
    margin: 14px 0;
}

.wp-bundle-blueprint-composition .comp-label {
    display: block;
    font-size: 11.5px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
}

.wp-bundle-tag-cloud {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
}

.wp-bundle-tag {
    font-size: 11.5px;
    color: #334155;
}

.wp-bundle-tag.inactive {
    color: #94a3b8;
    text-decoration: line-through;
    opacity: 0.6;
}

.wp-bundle-tag-separator {
    color: #cbd5e1;
    user-select: none;
}

/* Primary Action Button */
.button.button-hero-bundle {
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
    text-align: center !important;
    height: 42px !important;
    line-height: 40px !important;
    padding: 0 20px !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    background: #0f172a !important;
    color: #ffffff !important;
    border: 1px solid #0f172a !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.15s ease-in-out !important;
    cursor: pointer !important;
    margin-top: 16px !important;
}

.button.button-hero-bundle:hover:not(:disabled) {
    background: #1e293b !important;
    border-color: #1e293b !important;
    color: #ffffff !important;
}

.button.button-hero-bundle:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
}

/* Alert Boxes */
.wp-bundle-alert {
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.45;
    margin-top: 14px;
}

.wp-bundle-alert-warning {
    background: #fffbeb;
    border: 1px solid #fef3c7;
    color: #92400e;
}

.wp-bundle-alert-info {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
}

/* Progress Container */
.wp-bundle-progress-box {
    margin-top: 20px;
    padding: 18px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
}

.wp-bundle-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12.5px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 8px;
}

.wp-bundle-progress-bar-bg {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 8px;
}

.wp-bundle-progress-bar-fill {
    height: 100%;
    background: #4f46e5;
    border-radius: 999px;
    transition: width 0.3s ease;
}

.wp-bundle-progress-status {
    font-size: 12px;
    color: #64748b;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Result Card */
.wp-bundle-result-card {
    margin-top: 20px;
    padding: 18px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    color: #14532d;
}

.wp-bundle-result-card h3 {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 700;
    color: #166534;
}

.wp-bundle-result-card p {
    margin: 0 0 14px 0;
    font-size: 12.5px;
    color: #15803d;
}

/* Drag & Drop Zone */
.wp-bundle-dropzone {
    position: relative;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 32px 20px;
    text-align: center;
    background: #f8fafc;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}

.wp-bundle-dropzone:hover,
.wp-bundle-dropzone.dragover {
    border-color: #4f46e5;
    background: #f8faff;
}

.wp-bundle-dropzone input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.dropzone-icon {
    font-size: 32px;
    width: 32px;
    height: 32px;
    color: #64748b;
    margin-bottom: 8px;
}

.dropzone-prompt strong {
    color: #0f172a;
}

.dropzone-prompt {
    font-size: 13px;
    color: #475569;
    margin: 0 0 4px 0;
}

.dropzone-sub {
    font-size: 11.5px;
    color: #94a3b8;
}

/* Backups Vault Table */
.wp-bundle-vault-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
}

.wp-bundle-search-box {
    position: relative;
    width: 320px;
    max-width: 100%;
}

.wp-bundle-search-box input {
    width: 100%;
    padding: 6px 12px 6px 30px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    font-size: 12.5px !important;
    box-shadow: none !important;
}

.wp-bundle-search-box .dashicons {
    position: absolute;
    left: 8px;
    top: 8px;
    color: #94a3b8;
    font-size: 16px;
    width: 16px;
    height: 16px;
}

.wp-bundle-filter-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
}

.wp-bundle-filter-btn {
    padding: 4px 10px !important;
    font-size: 12px !important;
    border-radius: 6px !important;
    border: 1px solid #e2e8f0 !important;
    background: #f8fafc !important;
    color: #475569 !important;
    cursor: pointer !important;
}

.wp-bundle-filter-btn:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
}

.wp-bundle-filter-btn.active {
    background: #0f172a !important;
    color: #ffffff !important;
    border-color: #0f172a !important;
}

.wp-bundle-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
}

.wp-bundle-table th {
    background: #f8fafc;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.wp-bundle-table td {
    padding: 12px 14px;
    font-size: 12.5px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
}

.wp-bundle-table tr:last-child td {
    border-bottom: none;
}

.wp-bundle-table tr:hover td {
    background: #f8fafc;
}

.wp-bundle-filename {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 600;
    color: #0f172a;
}

.wp-bundle-table .tabular-num {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-variant-numeric: tabular-nums;
}

/* Modal Dialog */
.wp-bundle-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.wp-bundle-modal-box {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.wp-bundle-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
}

.wp-bundle-modal-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
}

.wp-bundle-modal-body {
    padding: 20px;
    font-size: 13px;
    color: #475569;
    line-height: 1.5;
}

.wp-bundle-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 20px;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
}

/* Empty State */
.wp-bundle-empty-state {
    text-align: center;
    padding: 48px 20px;
    color: #64748b;
}

.wp-bundle-empty-icon {
    font-size: 40px;
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
    color: #94a3b8;
}

.wp-bundle-empty-state h4 {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
}

.wp-bundle-empty-state p {
    margin: 0;
    font-size: 12.5px;
}
`;

export const adminJs = `/**
 * WP Bundle Migrator Admin JavaScript Orchestrator
 * Supports full WordPress core files, multisite networks & 1-click in-app extensions.
 * Fixes preset & granular checkbox 2-way synchronization, dynamic blueprint, and vault filters.
 */
(function($) {
    'use strict';

    var settings = window.wpBundleMigratorSettings || {};
    var apiRoot = settings.root || '/wp-json/wp-bundle-migrator/v1/';
    var ajaxUrl = settings.ajaxUrl || window.ajaxurl || '/wp-admin/admin-ajax.php';
    var nonce = settings.nonce || '';
    var restNonce = settings.restNonce || '';
    var selectedImportFile = null;
    var cachedBackups = [];

    $(document).ready(function() {
        initTabs();
        initMultisiteToggles();
        initExport();
        initImport();
        initVault();
        initSettings();
        initExtensions();
    });

    // 1. Tab Management
    function initTabs() {
        $('.wp-bundle-tabs a.nav-tab').on('click', function(e) {
            e.preventDefault();
            var targetTab = $(this).data('tab');
            
            $('.wp-bundle-tabs a.nav-tab').removeClass('nav-tab-active');
            $(this).addClass('nav-tab-active');
            
            $('.wp-bundle-tab-pane').removeClass('wp-bundle-tab-active');
            $('#tab-' + targetTab).addClass('wp-bundle-tab-active');

            if (targetTab === 'backups') {
                loadBackupsList();
            }
        });

        // Component definitions with estimated uncompressed bytes
        var COMPONENT_METRICS = [
            { name: 'include_db', label: 'Database', bytes: 24000000 },
            { name: 'include_uploads', label: 'Media', bytes: 125000000 },
            { name: 'include_plugins', label: 'Plugins', bytes: 42000000 },
            { name: 'include_themes', label: 'Themes', bytes: 18000000 },
            { name: 'include_mu_plugins', label: 'Mu-Plugins', bytes: 1200000 },
            { name: 'include_languages', label: 'Languages', bytes: 4500000 },
            { name: 'include_root_files', label: 'Root Config', bytes: 80000 },
            { name: 'include_wp_core', label: 'Core Files', bytes: 48000000 }
        ];

        var isInternalSync = false;

        function formatBytes(bytes) {
            if (bytes <= 0) return '0 B';
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
            return (bytes / 1073741824).toFixed(2) + ' GB';
        }

        // Live Blueprint & Estimator Calculator
        function syncBlueprintEstimator() {
            var activeCount = 0;
            var totalBytes = 0;
            var activeList = [];

            COMPONENT_METRICS.forEach(function(comp) {
                var $chk = $('input[name="' + comp.name + '"]');
                var isChecked = $chk.is(':checked');
                
                $chk.closest('.wp-bundle-checkbox-item').toggleClass('checked', isChecked);

                if (isChecked) {
                    activeCount++;
                    totalBytes += comp.bytes;
                    activeList.push(comp.label);
                }
            });

            // Update DOM metrics
            $('#blueprint-component-count').text(activeCount + ' of ' + COMPONENT_METRICS.length);
            $('#blueprint-raw-size').text('~' + formatBytes(totalBytes));

            // Estimated zip compression: ~35% for mixed DB/media/PHP
            var compressedBytes = Math.round(totalBytes * 0.365);
            $('#blueprint-compressed-size').text(activeCount > 0 ? ('~' + formatBytes(compressedBytes)) : '0 B');
            
            // Clean unboxed text composition with subtle separators
            if (activeList.length === 0) {
                $('#blueprint-active-tags').html('<span style="color:#e11d48;font-style:italic;">None selected</span>');
            } else {
                $('#blueprint-active-tags').text(activeList.join(' · '));
            }

            // Active preset label & badge
            var currentPreset = $('input[name="export_type"]:checked').val() || 'custom';
            var presetLabels = {
                'full': 'Standard Migration',
                'turnkey_full': 'Complete Turnkey',
                'db_only': 'Database Only',
                'media_only': 'Media Only',
                'custom': 'Custom Granular'
            };
            var presetLabel = presetLabels[currentPreset] || 'Custom Granular';
            $('#blueprint-scope-badge').text(presetLabel);
            $('#active-preset-tag').text('Scope: ' + presetLabel);

            // Safety guard: zero selection warning & disable export button
            var $zeroWarning = $('#export-zero-selection-warning');
            var $exportBtn = $('#btn-start-export');
            if (activeCount === 0) {
                $zeroWarning.slideDown(150);
                $exportBtn.prop('disabled', true);
            } else {
                $zeroWarning.slideUp(150);
                $exportBtn.prop('disabled', false);
            }
        }

        // Detect preset matching current checkbox configuration
        function detectPresetFromCheckboxes() {
            var db = $('input[name="include_db"]').is(':checked');
            var uploads = $('input[name="include_uploads"]').is(':checked');
            var plugins = $('input[name="include_plugins"]').is(':checked');
            var themes = $('input[name="include_themes"]').is(':checked');
            var mu = $('input[name="include_mu_plugins"]').is(':checked');
            var lang = $('input[name="include_languages"]').is(':checked');
            var root = $('input[name="include_root_files"]').is(':checked');
            var core = $('input[name="include_wp_core"]').is(':checked');

            if (db && uploads && plugins && themes && mu && lang && root && core) {
                return 'turnkey_full';
            }
            if (db && uploads && plugins && themes && mu && lang && root && !core) {
                return 'full';
            }
            if (db && !uploads && !plugins && !themes && !mu && !lang && !root && !core) {
                return 'db_only';
            }
            if (!db && uploads && !plugins && !themes && !mu && !lang && !root && !core) {
                return 'media_only';
            }
            return 'custom';
        }

        // 1. Radio preset selection handler
        $('.wp-bundle-radio-card input[type="radio"]').on('change', function() {
            var name = $(this).attr('name');
            $('input[name="' + name + '"]').closest('.wp-bundle-radio-card').removeClass('selected');
            $(this).closest('.wp-bundle-radio-card').addClass('selected');

            if (name === 'export_type' && !isInternalSync) {
                var val = $(this).val();
                isInternalSync = true;

                if (val === 'turnkey_full') {
                    // Turnkey: check everything
                    $('input[name="include_db"], input[name="include_uploads"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"], input[name="include_wp_core"]').prop('checked', true);
                } else if (val === 'full') {
                    // Standard: everything except core
                    $('input[name="include_db"], input[name="include_uploads"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"]').prop('checked', true);
                    $('input[name="include_wp_core"]').prop('checked', false);
                } else if (val === 'db_only') {
                    $('input[name="include_db"]').prop('checked', true);
                    $('input[name="include_uploads"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"], input[name="include_wp_core"]').prop('checked', false);
                } else if (val === 'media_only') {
                    $('input[name="include_db"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"], input[name="include_wp_core"]').prop('checked', false);
                    $('input[name="include_uploads"]').prop('checked', true);
                }

                isInternalSync = false;
                syncBlueprintEstimator();
            }
        });

        // 2. Granular checkbox toggle handler -> dynamically updates preset
        $('#export-components-section input[type="checkbox"]').on('change', function() {
            if (isInternalSync) return;

            var matchingPreset = detectPresetFromCheckboxes();
            isInternalSync = true;

            var $radio = $('input[name="export_type"][value="' + matchingPreset + '"]');
            $radio.prop('checked', true);
            $('input[name="export_type"]').closest('.wp-bundle-radio-card').removeClass('selected');
            $radio.closest('.wp-bundle-radio-card').addClass('selected');

            isInternalSync = false;
            syncBlueprintEstimator();
        });

        // 3. Quick Action Buttons
        $('#btn-select-all-components').on('click', function() {
            isInternalSync = true;
            $('input[name="include_db"], input[name="include_uploads"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"], input[name="include_wp_core"]').prop('checked', true);
            var $radio = $('input[name="export_type"][value="turnkey_full"]');
            $radio.prop('checked', true);
            $('input[name="export_type"]').closest('.wp-bundle-radio-card').removeClass('selected');
            $radio.closest('.wp-bundle-radio-card').addClass('selected');
            isInternalSync = false;
            syncBlueprintEstimator();
        });

        $('#btn-reset-recommended').on('click', function() {
            isInternalSync = true;
            $('input[name="include_db"], input[name="include_uploads"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"]').prop('checked', true);
            $('input[name="include_wp_core"]').prop('checked', false);
            var $radio = $('input[name="export_type"][value="full"]');
            $radio.prop('checked', true);
            $('input[name="export_type"]').closest('.wp-bundle-radio-card').removeClass('selected');
            $radio.closest('.wp-bundle-radio-card').addClass('selected');
            isInternalSync = false;
            syncBlueprintEstimator();
        });

        $('#btn-deselect-all-components').on('click', function() {
            isInternalSync = true;
            $('input[name="include_db"], input[name="include_uploads"], input[name="include_plugins"], input[name="include_themes"], input[name="include_mu_plugins"], input[name="include_languages"], input[name="include_root_files"], input[name="include_wp_core"]').prop('checked', false);
            var $radio = $('input[name="export_type"][value="custom"]');
            $radio.prop('checked', true);
            $('input[name="export_type"]').closest('.wp-bundle-radio-card').removeClass('selected');
            $radio.closest('.wp-bundle-radio-card').addClass('selected');
            isInternalSync = false;
            syncBlueprintEstimator();
        });

        // Initial sync on document ready
        syncBlueprintEstimator();
    }

    // Multisite Selector Toggles
    function initMultisiteToggles() {
        $('input[name="multisite_mode"]').on('change', function() {
            if ($(this).val() === 'subsite') {
                $('#multisite-subsite-picker').slideDown(200);
            } else {
                $('#multisite-subsite-picker').slideUp(200);
            }
        });
    }

    function showNotice(message, isError) {
        var $notice = $('#wp-bundle-global-notice');
        $notice.removeClass('notice-success notice-error')
            .addClass(isError ? 'notice-error' : 'notice-success')
            .html('<p>' + escapeHtml(message) + '</p>')
            .slideDown();

        $('html, body').animate({ scrollTop: 0 }, 200);
    }

    function escapeHtml(str) {
        return $('<div>').text(str).html();
    }

    function extractErrorMessage(err) {
        if (!err) return 'Unknown server error.';
        if (typeof err === 'string') return err;

        // 1. JSON payload responses from wp_send_json_error()
        if (err.responseJSON) {
            var rj = err.responseJSON;
            if (rj.data) {
                if (typeof rj.data === 'string') return rj.data;
                if (typeof rj.data.error === 'string') return rj.data.error;
                if (typeof rj.data.message === 'string') return rj.data.message;
            }
            if (typeof rj.error === 'string') return rj.error;
            if (typeof rj.message === 'string') return rj.message;
        }

        // 2. Direct data payloads
        if (err.data) {
            if (typeof err.data === 'string') return err.data;
            if (typeof err.data.error === 'string') return err.data.error;
            if (typeof err.data.message === 'string') return err.data.message;
        }

        // 3. String properties only (CRITICAL: NEVER return functions like jqXHR.error)
        if (typeof err.error === 'string' && err.error.trim()) return err.error;
        if (typeof err.message === 'string' && err.message.trim()) return err.message;

        // 4. Inspect responseText for PHP errors, wp_die HTML, or JSON with warnings
        if (typeof err.responseText === 'string' && err.responseText.trim()) {
            var raw = err.responseText.trim();
            // Try to extract JSON if surrounded by PHP notices or output
            var jsonStart = raw.indexOf('{"');
            if (jsonStart !== -1) {
                try {
                    var parsed = JSON.parse(raw.substring(jsonStart));
                    if (parsed.data && typeof parsed.data.error === 'string') return parsed.data.error;
                    if (typeof parsed.error === 'string') return parsed.error;
                    if (typeof parsed.message === 'string') return parsed.message;
                } catch(pe) {}
            }

            // Extract plain text from HTML response (e.g. wp_die error screen or PHP fatal error)
            var cleanText = raw.replace(new RegExp('<style[^>]*>[\\s\\S]*?<\\/style>', 'gi'), '')
                               .replace(new RegExp('<script[^>]*>[\\s\\S]*?<\\/script>', 'gi'), '')
                               .replace(/<[^>]+>/g, ' ')
                               .replace(/\\s+/g, ' ')
                               .trim();
            if (cleanText.length > 0) {
                return cleanText.length > 250 ? (cleanText.substring(0, 250) + '...') : cleanText;
            }
        }

        // 5. HTTP status code fallbacks
        if (err.status) {
            if (err.status === 413) return 'Upload failed (HTTP 413): File exceeds server post_max_size / upload_max_filesize limit. Place large archives in wp-content/uploads/wp-bundle-migrator-temp/ to restore directly from Backups Vault.';
            if (err.status === 504 || err.status === 502) return 'Gateway Timeout (HTTP ' + err.status + '): Server exceeded max execution time during operation.';
            if (err.statusText && err.statusText !== 'error') return 'HTTP ' + err.status + ': ' + err.statusText;
            return 'Server returned HTTP ' + err.status + ' error.';
        }

        return 'Server error occurred during request.';
    }

    function sendApiRequest(action, data, successCb, errorCb) {
        var ajaxActions = {
            'export': 'wp_bundle_export',
            'restore': 'wp_bundle_restore',
            'backups': 'wp_bundle_backups',
            'delete_backup': 'wp_bundle_delete_backup',
            'settings': 'wp_bundle_settings',
            'test_cloud': 'wp_bundle_test_cloud',
            'status': 'wp_bundle_status',
            'upload': 'wp_bundle_upload'
        };

        var postData = $.extend({}, data, {
            action: ajaxActions[action] || ('wp_bundle_' + action),
            _wpnonce: nonce
        });

        $.ajax({
            url: ajaxUrl,
            method: 'POST',
            data: postData,
            success: function(res) {
                if (res && res.success !== undefined) {
                    if (res.success) {
                        successCb(res.data);
                    } else {
                        if (errorCb) errorCb(res.data || res);
                        else showNotice(extractErrorMessage(res), true);
                    }
                } else {
                    successCb(res);
                }
            },
            error: function(xhr) {
                if (errorCb) errorCb(xhr);
                else showNotice(extractErrorMessage(xhr), true);
            }
        });
    }

    // 2. Export Handler
    function initExport() {
        $('#wp-bundle-export-form').on('submit', function(e) {
            e.preventDefault();
            var $btn = $('#btn-start-export');
            var $progressBox = $('#export-progress-container');
            var $progressBar = $('#export-progress-bar');
            var $progressPercent = $('#export-percent-label');
            var $progressStatus = $('#export-status-label');
            var $resultCard = $('#export-result-card');

            var db = $('input[name="include_db"]').is(':checked') ? 1 : 0;
            var uploads = $('input[name="include_uploads"]').is(':checked') ? 1 : 0;
            var plugins = $('input[name="include_plugins"]').is(':checked') ? 1 : 0;
            var themes = $('input[name="include_themes"]').is(':checked') ? 1 : 0;
            var mu = $('input[name="include_mu_plugins"]').is(':checked') ? 1 : 0;
            var lang = $('input[name="include_languages"]').is(':checked') ? 1 : 0;
            var root = $('input[name="include_root_files"]').is(':checked') ? 1 : 0;
            var core = $('input[name="include_wp_core"]').is(':checked') ? 1 : 0;

            if (!db && !uploads && !plugins && !themes && !mu && !lang && !root && !core) {
                showNotice('Export cancelled: No components selected. Please select at least one component to include.', true);
                $('#export-zero-selection-warning').slideDown(150);
                return;
            }

            $('#wp-bundle-global-notice').hide();
            $resultCard.hide();
            $btn.prop('disabled', true).addClass('updating-message');
            $progressBox.slideDown();
            $progressBar.css('width', '15%');
            $progressPercent.text('15%');
            $progressStatus.text('Scanning tables, files, and WordPress environment...');

            var exportPayload = {
                export_type: $('input[name="export_type"]:checked').val() || 'custom',
                multisite_mode: $('input[name="multisite_mode"]:checked').val() || 'entire_network',
                subsite_id: $('#export-subsite-id').val() || '',
                convert_subsite_standalone: $('input[name="convert_subsite_standalone"]').is(':checked') ? 1 : 0,
                include_db: db,
                include_uploads: uploads,
                include_plugins: plugins,
                include_themes: themes,
                include_mu_plugins: mu,
                include_languages: lang,
                include_root_files: root,
                include_wp_core: core,
                exclude_spam: $('input[name="exclude_spam"]').is(':checked') ? 1 : 0,
                exclude_revisions: $('input[name="exclude_revisions"]').is(':checked') ? 1 : 0,
                exclude_transients: $('input[name="exclude_transients"]').is(':checked') ? 1 : 0,
            };

            var progressVal = 15;
            var progressTimer = setInterval(function() {
                if (progressVal < 85) {
                    progressVal += 10;
                    $progressBar.css('width', progressVal + '%');
                    $progressPercent.text(progressVal + '%');
                    if (progressVal === 35) $progressStatus.text('Dumping MySQL tables via cursor seek...');
                    if (progressVal === 65) $progressStatus.text('Streaming selected files & wp-config into zip...');
                    if (progressVal === 85) $progressStatus.text('Writing manifest and closing bundle...');
                }
            }, 600);

            sendApiRequest('export', exportPayload, function(res) {
                clearInterval(progressTimer);
                $progressBar.css('width', '100%');
                $progressPercent.text('100%');
                $progressStatus.text('Export complete!');

                setTimeout(function() {
                    $progressBox.slideUp();
                    $btn.prop('disabled', false).removeClass('updating-message');

                    if (res && (res.bundleFile || res.success)) {
                        var downloadUrl = res.downloadUrl || (ajaxUrl + '?action=wp_bundle_download&file=' + encodeURIComponent(res.bundleFile) + '&_wpnonce=' + nonce);
                        $('#export-download-btn').attr('href', downloadUrl);
                        $('#export-result-details').text('Archive: ' + (res.bundleFile || 'bundle.zip') + ' (' + (res.formattedSize || 'Compressed') + ')');
                        $resultCard.slideDown();
                    } else {
                        showNotice(extractErrorMessage(res), true);
                    }
                }, 500);
            }, function(err) {
                clearInterval(progressTimer);
                $progressBox.slideUp();
                $btn.prop('disabled', false).removeClass('updating-message');
                showNotice('Export Error: ' + extractErrorMessage(err), true);
            });
        });
    }

    // 3. Import Handler
    function initImport() {
        var $dropzone = $('#import-dropzone');
        var $fileInput = $('#import-file-input');

        $dropzone.on('dragover dragenter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $dropzone.addClass('dragover');
        });

        $dropzone.on('dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $dropzone.removeClass('dragover');
        });

        $dropzone.on('drop', function(e) {
            var files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        $fileInput.on('change', function() {
            if (this.files.length > 0) {
                handleFileSelection(this.files[0]);
            }
        });

        function handleFileSelection(file) {
            selectedImportFile = file;
            $('#dropzone-selected-file').show();
            $('#selected-file-name').text(file.name);
            $('#selected-file-size').text('(' + (file.size / (1024 * 1024)).toFixed(1) + ' MB)');
            $('.dropzone-content').hide();
            $('#import-vault-select').val('');
        }

        $('#import-vault-select').on('change', function() {
            if ($(this).val()) {
                selectedImportFile = null;
                $('#dropzone-selected-file').hide();
                $('.dropzone-content').show();
            }
        });

        $('#wp-bundle-import-form').on('submit', function(e) {
            e.preventDefault();
            var $btn = $('#btn-start-import');
            var $progressBox = $('#import-progress-container');
            var $progressBar = $('#import-progress-bar');
            var $progressPercent = $('#import-percent-label');
            var $progressStatus = $('#import-status-label');

            var vaultFile = $('#import-vault-select').val();
            if (!selectedImportFile && !vaultFile) {
                showNotice('Please select an archive package file or choose one from your saved backups vault.', true);
                return;
            }

            var oldUrl = $('#replace-old-url').val();
            var newUrl = $('#replace-new-url').val();
            var oldNetDomain = $('#replace-old-network-domain').val() || '';
            var newNetDomain = $('#replace-new-network-domain').val() || '';

            $('#wp-bundle-global-notice').hide();
            $('#import-result-card').hide();
            $btn.prop('disabled', true).addClass('updating-message');
            $progressBox.slideDown();
            $progressBar.css('width', '20%');
            $progressPercent.text('20%');
            $progressStatus.text('Uploading package and validating manifest...');

            if (selectedImportFile) {
                var formData = new FormData();
                formData.append('action', 'wp_bundle_upload');
                formData.append('bundle_file', selectedImportFile);
                formData.append('_wpnonce', nonce);

                $.ajax({
                    url: ajaxUrl,
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhr: function() {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener('progress', function(evt) {
                            if (evt.lengthComputable) {
                                var percent = Math.round((evt.loaded / evt.total) * 50);
                                $progressBar.css('width', percent + '%');
                                $progressPercent.text(percent + '%');
                            }
                        }, false);
                        return xhr;
                    },
                    success: function(uploadRes) {
                        var fileData = uploadRes && uploadRes.data ? uploadRes.data : uploadRes;
                        if (fileData && fileData.filename) {
                            runRestorationStep(fileData.filename, oldUrl, newUrl, oldNetDomain, newNetDomain);
                        } else {
                            handleImportError(extractErrorMessage(fileData || 'File upload failed'));
                        }
                    },
                    error: function(xhr) {
                        handleImportError(extractErrorMessage(xhr));
                    }
                });
            } else {
                runRestorationStep(vaultFile, oldUrl, newUrl, oldNetDomain, newNetDomain);
            }

            function runRestorationStep(filename, oldUrl, newUrl, oldNetDomain, newNetDomain) {
                $progressStatus.text('Unpacking archive and restoring components...');
                $progressBar.css('width', '75%');
                $progressPercent.text('75%');

                var restorePayload = {
                    filename: filename,
                    old_url: oldUrl,
                    new_url: newUrl,
                    old_network_domain: oldNetDomain,
                    new_network_domain: newNetDomain,
                    restore_db: $('input[name="restore_db"]').is(':checked') ? 1 : 0,
                    restore_uploads: $('input[name="restore_uploads"]').is(':checked') ? 1 : 0,
                    restore_plugins: $('input[name="restore_plugins"]').is(':checked') ? 1 : 0,
                    restore_themes: $('input[name="restore_themes"]').is(':checked') ? 1 : 0,
                    restore_mu_plugins: $('input[name="restore_mu_plugins"]').is(':checked') ? 1 : 0,
                    restore_languages: $('input[name="restore_languages"]').is(':checked') ? 1 : 0,
                    restore_root_files: $('input[name="restore_root_files"]').is(':checked') ? 1 : 0,
                    restore_core: $('input[name="restore_core"]').is(':checked') ? 1 : 0,
                    isolate_conflicts: $('input[name="isolate_conflicts"]').is(':checked') ? 1 : 0,
                    resilient_unpack: $('input[name="resilient_unpack"]').is(':checked') ? 1 : 0,
                };

                sendApiRequest('restore', restorePayload, function(res) {
                    $progressBar.css('width', '100%');
                    $progressPercent.text('100%');
                    $progressStatus.text('Restoration completed successfully!');

                    setTimeout(function() {
                        $progressBox.slideUp();
                        $btn.prop('disabled', false).removeClass('updating-message');

                        if (res && (res.success || res.message)) {
                            $('#import-result-card').slideDown();
                        } else {
                            showNotice(extractErrorMessage(res), true);
                        }
                    }, 500);
                }, function(err) {
                    handleImportError(extractErrorMessage(err));
                });
            }

            function handleImportError(errMsg) {
                $progressBox.slideUp();
                $btn.prop('disabled', false).removeClass('updating-message');
                showNotice('Restoration Error: ' + errMsg, true);
            }
        });
    }

    // 4. Backups Vault Management
    function initVault() {
        $('#btn-refresh-backups').on('click', function() {
            loadBackupsList();
        });

        // Search filtering in vault
        $('#vault-search-input').on('input', function() {
            filterAndRenderBackups();
        });

        // Scope filter buttons in vault
        $('.wp-bundle-filter-btn').on('click', function() {
            $('.wp-bundle-filter-btn').removeClass('active');
            $(this).addClass('active');
            filterAndRenderBackups();
        });
    }

    function loadBackupsList() {
        var $loading = $('#backups-loading');
        var $table = $('#backups-table');
        var $empty = $('#backups-empty');
        var $vaultSelect = $('#import-vault-select');

        $loading.show();
        $table.hide();
        $empty.hide();

        sendApiRequest('backups', {}, function(res) {
            $loading.hide();
            cachedBackups = (res && res.backups) ? res.backups : (res && res.data && res.data.backups) ? res.data.backups : [];
            
            $vaultSelect.find('option:not(:first)').remove();
            cachedBackups.forEach(function(b) {
                $vaultSelect.append(
                    $('<option>').val(b.filename).text(b.filename + ' (' + b.formattedSize + ')')
                );
            });

            filterAndRenderBackups();
        }, function() {
            $loading.hide();
            $empty.show();
        });
    }

    function filterAndRenderBackups() {
        var $table = $('#backups-table');
        var $tbody = $('#backups-list-body');
        var $empty = $('#backups-empty');

        var query = ($('#vault-search-input').val() || '').toLowerCase();
        var scopeFilter = $('.wp-bundle-filter-btn.active').data('scope') || 'all';

        var filtered = cachedBackups.filter(function(b) {
            var matchesQuery = !query || b.filename.toLowerCase().indexOf(query) !== -1 || (b.createdDate && b.createdDate.indexOf(query) !== -1);
            if (!matchesQuery) return false;

            if (scopeFilter === 'turnkey') return b.filename.indexOf('turnkey') !== -1;
            if (scopeFilter === 'db') return b.filename.indexOf('db') !== -1;
            if (scopeFilter === 'media') return b.filename.indexOf('media') !== -1;
            return true;
        });

        if (filtered.length > 0) {
            $tbody.empty();
            filtered.forEach(function(b) {
                var downloadUrl = b.downloadUrl || (ajaxUrl + '?action=wp_bundle_download&file=' + encodeURIComponent(b.filename) + '&_wpnonce=' + nonce);
                var tr = $('<tr>')
                    .append('<td><strong class="wp-bundle-filename">' + escapeHtml(b.filename) + '</strong></td>')
                    .append('<td class="tabular-num">' + escapeHtml(b.formattedSize) + '</td>')
                    .append('<td class="tabular-num">' + escapeHtml(b.createdDate) + '</td>')
                    .append(
                        $('<td style="text-align:right;">')
                            .append('<a href="' + downloadUrl + '" class="button button-small" target="_blank">Download</a> ')
                            .append($('<button type="button" class="button button-small btn-restore-vault">Restore</button>').data('file', b.filename))
                            .append(' ')
                            .append($('<button type="button" class="button button-small button-link-delete btn-delete-vault">Delete</button>').data('file', b.filename))
                    );
                $tbody.append(tr);
            });

            $('.btn-delete-vault').on('click', function() {
                var file = $(this).data('file');
                showConfirmationModal('Delete Backup Archive', 'Are you sure you want to permanently delete ' + file + '? This action cannot be undone.', function() {
                    sendApiRequest('delete_backup', { file: file }, function(delRes) {
                        if (delRes && (delRes.success || delRes.deleted)) {
                            loadBackupsList();
                        } else {
                            showNotice(extractErrorMessage(delRes), true);
                        }
                    });
                });
            });

            $('.btn-restore-vault').on('click', function() {
                var file = $(this).data('file');
                $('.wp-bundle-tabs a[data-tab="import"]').trigger('click');
                $('#import-vault-select').val(file).trigger('change');
            });

            $empty.hide();
            $table.show();
        } else {
            $table.hide();
            $empty.show();
        }
    }

    function showConfirmationModal(title, message, confirmCb) {
        $('.wp-bundle-modal-backdrop').remove();
        var $modal = $('<div class="wp-bundle-modal-backdrop">')
            .append(
                $('<div class="wp-bundle-modal-box">')
                    .append(
                        $('<div class="wp-bundle-modal-header">')
                            .append('<h3>' + escapeHtml(title) + '</h3>')
                            .append('<button type="button" class="wp-bundle-modal-close" style="background:none;border:none;font-size:18px;cursor:pointer;">&times;</button>')
                    )
                    .append(
                        $('<div class="wp-bundle-modal-body">').text(message)
                    )
                    .append(
                        $('<div class="wp-bundle-modal-footer">')
                            .append('<button type="button" class="button btn-modal-cancel">Cancel</button>')
                            .append('<button type="button" class="button button-primary btn-modal-confirm" style="background:#e11d48;border-color:#e11d48;">Delete</button>')
                    )
            );

        $('body').append($modal);

        $modal.find('.wp-bundle-modal-close, .btn-modal-cancel').on('click', function() {
            $modal.remove();
        });

        $modal.find('.btn-modal-confirm').on('click', function() {
            $modal.remove();
            confirmCb();
        });
    }

    // 5. Settings Save Handler
    function initSettings() {
        $('#btn-test-cloud').on('click', function(e) {
            e.preventDefault();
            var $btn = $(this);
            var $spinner = $('#cloud-test-spinner');
            var $notice = $('#cloud-test-notice');

            $btn.prop('disabled', true);
            $spinner.addClass('is-active');
            $notice.hide().text('');

            var testData = {
                cloud_provider: $('#setting-cloud-provider').val(),
                cloud_s3_key: $('#setting-cloud-key').val(),
                cloud_s3_secret: $('#setting-cloud-secret').val(),
                cloud_s3_bucket: $('#setting-cloud-bucket').val(),
                cloud_s3_region: $('#setting-cloud-region').val(),
                cloud_s3_endpoint: $('#setting-cloud-endpoint').val()
            };

            sendApiRequest('test_cloud', testData, function(res) {
                $btn.prop('disabled', false);
                $spinner.removeClass('is-active');
                $notice.css({ color: '#059669', display: 'inline-block' }).text(res.message || 'Connection verified successfully.');
            }, function(err) {
                $btn.prop('disabled', false);
                $spinner.removeClass('is-active');
                $notice.css({ color: '#e11d48', display: 'inline-block' }).text('Connection failed: ' + extractErrorMessage(err));
            });
        });
    }

    // 6. Extensions Hub
    function initExtensions() {
        // Reserved for in-app extension triggers
    }

})(jQuery);
`;
