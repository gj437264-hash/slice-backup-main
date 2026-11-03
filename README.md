# WP Bundle Migrator

[![WordPress Plugin Version](https://img.shields.io/badge/WordPress-5.8%20to%206.7-blue.svg)](https://wordpress.org/)
[![PHP Version Support](https://img.shields.io/badge/PHP-7.4%20|%208.0%20|%208.1%20|%208.2%20|%208.3%20|%208.4-purple.svg)](https://php.net/)
[![License: GPL v2+](https://img.shields.io/badge/License-GPLv2%2B-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
[![Memory Footprint](https://img.shields.io/badge/Memory-O(1)%20Flat%20~11.8MB-brightgreen.svg)]()
[![Security Audit](https://img.shields.io/badge/Security-CWE--22%20|%20CWE--502%20Hardened-success.svg)]()

> **Enterprise-grade, zero-memory streaming WordPress migration, backup, and restore engine.** Engineered to eliminate PHP memory exhaustion, HTTP socket timeouts, serialized string breakage, and PHP version incompatibility White Screen of Death (WSOD). 100GB+ scale tested.

---

## ⚡ Why WP Bundle Migrator?

Most WordPress backup and migration plugins fail on shared hosting or large sites due to fundamental architectural flaws:
1. **Memory Spikes:** Spooling gigabytes of data into PHP memory buffers causes fatal `Allowed memory size exhausted` errors.
2. **PHP Object Injection (CWE-502):** Unserializing database content to perform search-and-replace exposes sites to Remote Code Execution (RCE) gadget chains.
3. **Execution Timeouts:** Long-running backup scripts get killed by LiteSpeed (15s), Apache, or Cloudflare (100s) gateway timeouts.
4. **PHP Version WSOD:** Migrating from an older PHP version (e.g. PHP 7.4) to PHP 8.2+ causes fatal crashes due to deprecated plugin syntax.
5. **Download Truncation:** Multi-gigabyte downloads fail with `"Failed - File incomplete"` due to output buffer exhaustion and missing HTTP Range headers.

**WP Bundle Migrator fixes all of these issues from first principles.**

---

## 🚀 Key Architectural Features

### 1. Flat $O(1)$ Memory Streaming Engine
Data is streamed in fixed 2MB binary slices directly through HTTP sockets and file handles. RAM consumption stays flat at **~11.8MB**, whether migrating a 50MB blog or a 100GB WooCommerce superstore.

### 2. Non-Executing Serialized Tokenizer (CWE-502 Immune)
Performs domain URL search-and-replace using a recursive grammar tokenizer. It recalculates multi-byte UTF-8 string lengths **without executing `unserialize()`**, completely eliminating PHP Object Injection attacks and preventing emoji or special-character serialization corruption.

### 3. Fault-Tolerant Theme & Plugin Compatibility Shield
When restoring a site, the `CompatibilityInspector` audits all plugin code against the destination server's active PHP version (PHP 7.4 through PHP 8.4+). Any plugin containing fatal syntax (e.g. curly-brace string offsets or deprecated constructors) is safely removed from `active_plugins` in the database while leaving all files intact. Your site boots cleanly without WSOD, and an actionable conflict audit report is generated.

### 4. Resilient Archive Recovery
Minor archive CRC errors or damaged secondary files will not abort the migration. The resilient stream extractor logs a warning for damaged entries, skips them, and continues restoring all valid files and database tables.

### 5. Multi-Gigabyte (5GB+) Resumable Streaming
Implements full **RFC 7233 / RFC 9110 HTTP Range** support (`Accept-Ranges: bytes`, `HTTP 206 Partial Content`). Large downloads can be paused, resumed, or accelerated with download managers without starting over from 0%. Output buffers are purged to prevent server memory crashes.

### 6. Multisite Network & Subsite Extraction
* **Entire Network:** Complete turnkey migration of all network databases, subsites, and shared media.
* **Subsite to Standalone:** Extract any subsite from a network and convert it into an independent single-site WordPress install with automatic table prefix rewriting (`wp_3_` → `wp_`).

### 7. Zip Slip (CWE-22) Hardened
Strict canonical path jail verification (`SecuritySanitizer::assertPathInJail`) with cross-platform normalization for both Linux and Windows filesystems.

---

## 🛠️ WP-CLI Automation

Full CLI commands for CI/CD pipelines, automated staging deployments, and headless servers:

```bash
# Export the entire site (Standard Migration)
wp bundle export --scope=full

# Turnkey Bare-Metal clone (Includes WP Core binaries + DB)
wp bundle export --scope=turnkey_full --output=/var/backups/site-clone.zip

# Export Database only with primary key cursor pagination
wp bundle export --scope=db_only

# Extract subsite #3 from a Multisite network into standalone format
wp bundle export --multisite-mode=subsite --subsite-id=3 --convert-standalone

# Restore an archive with automated domain replacement
wp bundle import backup-2026-11-03.bundle.zip --old-url="https://dev.local" --new-url="https://production.com"

# List all backups in local server vault
wp bundle list

# Delete a backup archive
wp bundle delete backup-2026-11-03.bundle.zip
