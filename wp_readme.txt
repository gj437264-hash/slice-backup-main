=== WP Bundle Migrator – Zero-Memory Streaming Backup & Site Migration Engine ===
Contributors: your_wporg_username
Donate link: https://yourdomain.com/donate
Tags: migration, backup, transfer, clone, restore, multisite, woocommerce
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Enterprise-grade streaming WordPress migration, backup, and restore engine. Zero-memory buffered architecture capable of 100GB+ migrations on shared hosting.

== Description ==

**WP Bundle Migrator** is an open-source, high-assurance WordPress migration and backup plugin engineered to conquer the primary root causes of migration failure: PHP memory exhaustion, HTTP socket timeouts, serialized string corruption, and White Screen of Death (WSOD) caused by PHP version mismatches.

Unlike traditional migration plugins that archive sites by loading multi-gigabyte files into PHP memory buffers or creating massive temporary tarballs that exceed disk quotas, WP Bundle Migrator streams database records and filesystem assets in deterministic, chunked slices with constant O(1) RAM usage (~12MB total).

Whether migrating a personal blog or a 100GB WooCommerce store with millions of records, the process completes reliably without triggering 504 Gateway Timeouts, 500 Internal Server Errors, or out-of-memory crashes.

### Key Features & Architectural Advantages

* **Constant O(1) Memory Footprint:** Streams binary chunks directly to the HTTP socket and disk. RAM stays flat (~11.8MB) on budget shared hosting with 32MB/64MB memory limits as well as enterprise dedicated servers.
* **Non-Executing Serialized URL Replacer:** Safely replaces domain names and paths across serialized options, postmeta, and widget data without invoking PHP `unserialize()`. Completely eliminates PHP Object Injection vulnerabilities (CWE-502) and multi-byte UTF-8 emoji string length errors.
* **Fault-Tolerant Theme & Plugin Compatibility Shield:** Scans imported plugins and themes against the target server's PHP version (PHP 7.4, 8.0, 8.1, 8.2, 8.3, 8.4+). Automatically deactivates incompatible plugins in the database while leaving files 100% intact, preventing White Screen of Death (WSOD) and outputting an actionable conflict audit report.
* **Resilient Archive Recovery:** Tolerates minor archive CRC / file corruption by gracefully bypassing damaged individual entries and restoring all valid assets and the database without aborting the migration.
* **HTTP 206 Partial Content & Chunked Streaming:** Download multi-gigabyte archives (5GB–100GB+) reliably with pause and resume support, 64-bit integer file size precision, and automatic output buffer purging.
* **WordPress Multisite Network Support:** Migrate entire multisite networks (subdomain or subdirectory) or extract individual subsites into standalone single-site installations with automatic table prefix rewriting.
* **Zip Slip (CWE-22) Defense:** Cross-platform canonical path jail guards prevent directory traversal attacks on both Linux and Windows environments.
* **No Artificial Paywalls:** 100% free and open-source under GPLv2. Full database, core, media, plugin, and theme migrations without file size limits.
* **WP-CLI Automation:** Full headless automation (`wp bundle export`, `wp bundle import`) for CI/CD pipelines, staging pushes, and server administrators.

== Installation ==

1. Upload the `wp-bundle-migrator` folder to your `/wp-content/plugins/` directory (or install via the WordPress Plugins screen).
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Navigate to **Tools > WP Bundle Migrator** (or **Network Admin > WP Bundle Migrator** on Multisite) to begin.
4. Select your export scope (Standard Migration, Complete Turnkey Clone, Database Only, Media Only, or Granular Selection) and click **Generate Bundle Archive**.

== Frequently Asked Questions ==

= Does this plugin work on budget shared hosting with 32MB or 64MB RAM limits? =
Yes. WP Bundle Migrator was specifically benchmarked on 32MB PHP memory limits. By reading and writing files and database rows in 2MB chunked streams with cursor pagination, memory usage never scales with site size.

= How does the plugin prevent White Screen of Death (WSOD) on import? =
During restoration, our `CompatibilityInspector` statically analyzes extracted plugins against the target server's active PHP version. If an older plugin contains fatal syntax incompatible with your target PHP runtime, it safely removes that plugin from the database `active_plugins` list while leaving all files intact. The site boots cleanly, and you receive an itemized conflict report.

= How does it handle domain URL replacement without breaking serialized data? =
Legacy tools use `unserialize()`, which can trigger fatal errors or Remote Code Execution (RCE) via PHP object injection. WP Bundle Migrator uses a non-executing recursive tokenizer parser that recalculates exact UTF-8 byte lengths for serialized strings without instantiating PHP objects in memory.

= Can I migrate a single subsite out of a Multisite network? =
Yes. WP Bundle Migrator includes a Subsite Extraction engine that isolates a subsite's specific database tables, rewrites its table prefix (e.g. `wp_3_` to `wp_`), isolates its media files from `blogs.dir` or `uploads/sites/3/`, and packages it into a standard single-site WordPress bundle.

= What happens when I uninstall the plugin? =
In compliance with WordPress.org guidelines, the plugin includes a dedicated `uninstall.php` script that completely removes all settings, options, and temporary migration folders when deleted via the WordPress Admin Plugins screen.

== Screenshots ==

1. Export Dashboard with real-time component selector and live size estimator.
2. Import & Restore interface with drag-and-drop chunked uploader and domain search/replace.
3. Backups Vault with searchable backup records and one-click restore.
4. Engine settings and system diagnostic inspection.

== Changelog ==

= 1.0.0 =
* Initial production release.
* Zero-memory O(1) streaming export and restore engine.
* Cursor-paginated database dumper with primary key seek.
* Non-executing recursive grammar tokenizer for serialized search & replace.
* Pre-flight theme and plugin compatibility inspector with safe deactivation WSOD shield.
* Resilient zip extraction bypassing corrupted entries without halting migration.
* Multisite network export and standalone subsite extraction.
* HTTP 206 Partial Content chunked download streaming for 5GB+ archives.
* Cross-platform Zip Slip path traversal defenses (Linux & Windows).
* WP-CLI command integration (`wp bundle export`, `wp bundle import`).
