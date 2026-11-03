import { 
  CompetitorComparison, 
  FeatureClassification, 
  SharedHostingConstraint, 
  SecurityVulnerabilityVector,
  MigrationStateStep 
} from '../types';

export const WP_STANDARDS_INFO = {
  minWordPressVersion: '6.4+',
  recommendedWordPressVersion: '6.7+ (Targeting 6.8 compatibility)',
  minPhpVersion: '8.1',
  recommendedPhpVersion: '8.2 / 8.3 (with 8.4 deprecation safeguards)',
  mysqlVersion: 'MySQL 5.7+ / MariaDB 10.4+',
  standards: [
    {
      title: 'PHP 8.1 - 8.4 Type Safety & Deprecations',
      detail: 'Leverage typed properties, return types, enums, and constructor promotion. Ban dynamic property creation (deprecated in PHP 8.2), implicit nullable parameters (deprecated in PHP 8.4), and ensure mbstring handles multi-byte UTF-8 serialization calculations cleanly.'
    },
    {
      title: 'Database Engine & $wpdb Optimization',
      detail: 'Never load raw tables into memory with SELECT *. Use LIMIT/OFFSET cursor pagination by primary key index (`WHERE id > ? ORDER BY id ASC LIMIT 5000`). Enforce `$wpdb->prepare()`, utf8mb4 collation retention, and strict transaction rollback checks using InnoDB savepoints.'
    },
    {
      title: 'WordPress Filesystem Abstraction (WP_Filesystem)',
      detail: 'Do not invoke raw `unlink`, `rmdir`, or `copy` directly across core directories without fallback checking. Utilize WP_Filesystem Direct and FTPExt credentials when direct write access is restricted by server UID/GID mismatches.'
    },
    {
      title: 'Nonce & Capability Authorization Boundary',
      detail: 'Every migration entrypoint must enforce `current_user_can("manage_options")` or `current_user_can("export")` / `import` (or `manage_network` in Multisite). Combine with `check_admin_referer()` / `wp_verify_nonce()` and custom timing-safe token validation.'
    },
    {
      title: 'Async Chunking vs WP-Cron Pitfalls',
      detail: 'WP-Cron depends on user HTTP traffic; on quiet staging sites, cron-scheduled steps stall indefinitely. The migration runner must utilize client-driven polling loops (Fetch API / REST API) backed by server-side idempotency locks and Action Scheduler integration.'
    }
  ]
};

export const COMPETITOR_ANALYSIS: CompetitorComparison[] = [
  {
    name: 'All-in-One WP Migration (ServMask)',
    architecture: 'Proprietary single-archive stream (.wpress) with custom header offset table and client-driven HTTP chunk polling.',
    archiveFormat: 'Custom `.wpress` binary stream format (blocks of 4377 bytes header + data blocks), avoiding standard zip overhead.',
    chunkingMethod: 'Ajax/REST HTTP multipart chunk upload + byte-range extraction directly reading file offsets in chunks.',
    strengths: [
      'Very clean, friction-free 1-click UI for non-technical users.',
      'Bypasses server zip extraction memory peaks by unpacking custom binary blocks sequentially.',
      'Handles basic serialized string replacements reliably.'
    ],
    weaknesses: [
      'Artificial 512MB free upload limit; aggressive upsell to paid Unlimited extension ($69/yr+).',
      'Proprietary `.wpress` format cannot be opened by standard tools (unzip/7-Zip) without third-party Go/Python extractors.',
      'Cloud storage integrations and Multisite require separate expensive commercial extensions.',
      'Closed ecosystem; difficult to inspect or automate in CI/CD without commercial CLI addon.'
    ],
    securityConcerns: [
      'History of unauthenticated backup file access if `.htaccess` is bypassed on Nginx.',
      'Backup retention files placed in `wp-content/ai1wm-backups` prone to automated directory traversal if web server configuration omits directory deny rules.'
    ],
    monetizationBoundary: 'Free core handles under 512MB local import/export; cloud adapters, multisite, and unlimited sizes are commercial.'
  },
  {
    name: 'Duplicator (Snap Creek / Awesome Motive)',
    architecture: 'Two-part architecture: monolithic archive (.zip or proprietary .daf) paired with standalone `installer.php` bootstrap script.',
    archiveFormat: 'Standard ZIP or custom DupArchive (.daf format designed to process 1 file per request).',
    chunkingMethod: 'DupArchive splits operations into multiple distinct AJAX cycles with micro-state checkpoints.',
    strengths: [
      'Can restore onto completely empty destination server with zero WordPress pre-installed via `installer.php`.',
      'DupArchive engine designed explicitly to evade low execution limits.',
      'Extensive system check pre-flight diagnostics.'
    ],
    weaknesses: [
      'Complex multi-step wizard intimidating for non-technical users.',
      'The `installer.php` workflow requires manual FTP upload or file manager access if migration is not pre-connected.',
      'Leaves temporary files and installation scripts if user fails to run cleanup step.'
    ],
    securityConcerns: [
      'CRITICAL: `installer.php` has suffered severe historical vulnerabilities (CVE-2020-11738 directory traversal, CVE-2021-24785 unauthorized injection), allowing arbitrary file overwrite and database takeover if left on public servers.'
    ],
    monetizationBoundary: 'Free core offers manual install package; Pro adds cloud storage, scheduling, multisite, and branded installer.'
  },
  {
    name: 'Migrate Guru / BlogVault',
    architecture: 'SaaS offload architecture: WordPress plugin connects to external BlogVault cloud servers which clone data directly.',
    archiveFormat: 'Proprietary cloud snapshot hosted in AWS/BlogVault infrastructure.',
    chunkingMethod: 'External cloud workers pull data via streaming HTTPS REST tunnel; zero processing load on local PHP server.',
    strengths: [
      'Zero impact on server memory or CPU limits; easily handles 200GB+ enterprise sites on budget shared hosting.',
      'Completely immune to local PHP execution timeouts and LiteSpeed kills.'
    ],
    weaknesses: [
      'Requires sending entire site database, user hashes, and files to a 3rd-party SaaS server (privacy/GDPR compliance risks).',
      'Cannot function in air-gapped, intranet, or strictly isolated enterprise networks.',
      'Requires destination SFTP/cPanel or target key credentials.'
    ],
    securityConcerns: [
      'Third-party cloud infrastructure has root access to site files and database dumps.',
      'Potential vector for man-in-the-middle or credential compromise if API token is intercepted.'
    ],
    monetizationBoundary: 'Migrate Guru is free loss-leader for BlogVault backup subscriptions.'
  },
  {
    name: 'UpdraftPlus',
    architecture: 'Backup-first modular ZIP split engine with separate zip archives for plugins, themes, uploads, and database.',
    archiveFormat: 'Standard ZIP archives split into configurable increments (e.g. 400MB parts) plus raw SQL/GZ dump.',
    chunkingMethod: 'WP-Cron based background processing running in timed chunks with re-entrant loops.',
    strengths: [
      'Open formats: standard ZIPs that can be extracted with standard system tools.',
      'Component-level restore (e.g., restore only database or only themes).',
      'Huge community trust and wide cloud storage support.'
    ],
    weaknesses: [
      'Heavy reliance on WP-Cron often fails on low-traffic sites or hosts with aggressive request timeouts.',
      'Restoration UI is cluttered and multi-screen; prone to hanging mid-restore if connection drops.',
      'Migration/cloning features locked behind paid Migrator add-on.'
    ],
    securityConcerns: [
      'Past vulnerabilities involving unauthenticated download of backup directories due to predictable backup file names.'
    ],
    monetizationBoundary: 'Free for backup/restore; domain URL replacement and cloning require paid "Migrator" add-on.'
  }
];

export const SHARED_HOSTING_CONSTRAINTS: SharedHostingConstraint[] = [
  {
    parameter: 'max_execution_time',
    typicalValue: '30 seconds',
    worstCaseValue: '10 - 15 seconds (LiteSpeed web server Lsapi / Nginx fastcgi_read_timeout)',
    impactOnMigration: 'Scripts timing out mid-dump or mid-zip, producing corrupt archives or half-imported database tables.',
    architecturalMitigation: 'Chunked execution engine with strict micro-step timeouts (e.g., maximum 8 seconds per slice). State is persisted to disk/DB after every slice.'
  },
  {
    parameter: 'memory_limit',
    typicalValue: '128 MB',
    worstCaseValue: '32 MB - 64 MB (budget cPanel / shared pools)',
    impactOnMigration: 'Fatal error: Allowed memory size exhausted when attempting to read large files or large SQL dump statements.',
    architecturalMitigation: 'Zero-memory streaming. Use fopen/fread stream buffers capped at 2MB chunks. Export database via cursor streaming without caching result sets.'
  },
  {
    parameter: 'upload_max_filesize & post_max_size',
    typicalValue: '8 MB - 32 MB',
    worstCaseValue: '2 MB (standard default PHP config)',
    impactOnMigration: 'Direct upload of any real-world migration package (>50MB) immediately fails with HTTP 413 or empty $_FILES.',
    architecturalMitigation: 'Client-side slice-based chunked uploading via JavaScript FileReader API. Upload files in 1MB - 2MB byte-range slices and assemble on server with strict hash verification.'
  },
  {
    parameter: 'Process Execution (exec, proc_open, shell_exec)',
    typicalValue: 'Disabled via disable_functions',
    worstCaseValue: 'All external system execution binaries blocked',
    impactOnMigration: 'Cannot rely on mysqldump, mysql CLI, tar, or zip CLI utilities.',
    architecturalMitigation: 'Pure PHP fallback implementations: native PHP SQL generator with buffered cursor, and pure PHP tar/archive stream writer with deflate.'
  },
  {
    parameter: 'Disk Space & Inode Quotas',
    typicalValue: '1 GB - 5 GB free',
    worstCaseValue: 'Under 500 MB free or exhausted file inode count',
    impactOnMigration: 'Packaging duplicate copy of site (e.g. 4GB site needing 4GB archive + 2GB uncompressed temp) causes disk full crashes.',
    architecturalMitigation: 'Pre-flight disk space calculation. Direct streaming archive generation without intermediate uncompressed temporary staging when possible. Exclude cache/temp files by default.'
  },
  {
    parameter: 'Reverse Proxy & Cloudflare Limits',
    typicalValue: '100s Cloudflare timeout',
    worstCaseValue: '60s Nginx proxy timeout (504 Gateway Timeout)',
    impactOnMigration: 'Single long-running HTTP request dropped by proxy even if PHP script is still running in background.',
    architecturalMitigation: 'Client-driven polling architecture. Each AJAX/REST request executes for no more than 6-10 seconds, then returns progress status and next offset.'
  }
];

export const SECURITY_VULNERABILITY_VECTORS: SecurityVulnerabilityVector[] = [
  {
    cwe: 'CWE-22',
    vector: 'Path Traversal (Zip Slip / Tar Slip)',
    description: 'Archive contains entries with relative path manipulation (e.g., `../../wp-config.php` or `/etc/passwd`). Extracting writes files outside intended target directory.',
    severity: 'Critical',
    mitigationStrategy: 'Strict canonicalization with `realpath()`. Check `strpos($destination_file, $destination_base_dir) === 0`. Ban absolute paths and path components containing `..` or null bytes.'
  },
  {
    cwe: 'CWE-434',
    vector: 'Unrestricted Upload of Dangerous File Types',
    description: 'Attacker uploads a malicious package containing backdoor PHP shells directly executable in the uploads or plugin directories.',
    severity: 'Critical',
    mitigationStrategy: 'Only users with `manage_options` can initiate. Package must validate magic header bytes, manifest digital signature (HMAC-SHA256), and checksum verification before extraction.'
  },
  {
    cwe: 'CWE-502',
    vector: 'Deserialization of Untrusted Data during URL Replacement',
    description: 'Running `unserialize()` directly on untrusted database data can trigger PHP Object Injection (POP gadget chains) leading to remote code execution.',
    severity: 'Critical',
    mitigationStrategy: 'Use `unserialize($data, ["allowed_classes" => false])` to completely disable object instantiation during search-and-replace, or use a streaming tokenizer that operates on string tokens without invoking full unserialize.'
  },
  {
    cwe: 'CWE-552',
    vector: 'Unauthenticated Backup Archive Download',
    description: 'Backup files stored in `wp-content/uploads/backups/` can be discovered by directory listing or brute-forcing timestamps (e.g., `backup-2026-09-11.zip`).',
    severity: 'Critical',
    mitigationStrategy: 'Store backups in a randomized directory (e.g., `wp-content/uploads/wpmigrate-b7f92a4e/`). Inject `.htaccess` (`Deny from all`), `web.config`, and blank `index.php`. Stream downloads through authenticated PHP proxy with nonce and capability checks.'
  },
  {
    cwe: 'CWE-352',
    vector: 'Cross-Site Request Forgery (CSRF)',
    description: 'Malicious website tricks logged-in admin into triggering an export, backup deletion, or destructive site restore.',
    severity: 'High',
    mitigationStrategy: 'Enforce strict WordPress nonces (`check_admin_referer("wpmigrate_action")`) and custom random session tokens on all REST and AJAX endpoints.'
  },
  {
    cwe: 'CWE-409',
    vector: 'Decompression Bomb (Zip Bomb / Tar Bomb)',
    description: 'A tiny 1MB archive unpacks into 500GB of null bytes, filling disk space and crashing the server or exhausting inodes.',
    severity: 'High',
    mitigationStrategy: 'Pre-inspect archive manifest size records before extracting. Set hard cumulative extraction ceiling based on available disk space; abort if total uncompressed bytes exceed manifest quota.'
  }
];

export const FEATURE_CLASSIFICATIONS: FeatureClassification[] = [
  // Core Free MVP
  {
    id: 'f1',
    name: 'Full Site Export & Import (Database + Files)',
    category: 'Core Free MVP',
    rationale: 'Core value proposition. Must handle complete WordPress installation without artificial size caps.',
    technicalComplexity: 'High',
    status: 'Phase 3 MVP'
  },
  {
    id: 'f2',
    name: 'Chunked Resumable Upload Engine (1MB - 2MB slices)',
    category: 'Core Free MVP',
    rationale: 'Essential for shared hosting where upload limits are as low as 2MB.',
    technicalComplexity: 'High',
    status: 'Phase 3 MVP'
  },
  {
    id: 'f3',
    name: 'Serialization-Safe Domain & URL Replacement',
    category: 'Core Free MVP',
    rationale: 'Fundamental requirement. Standard string replace corrupts serialized PHP options, widgets, and theme settings.',
    technicalComplexity: 'High',
    status: 'Phase 3 MVP'
  },
  {
    id: 'f4',
    name: 'Cursor-Based Database Chunk Exporter & Importer',
    category: 'Core Free MVP',
    rationale: 'Prevents PHP out-of-memory errors by streaming table rows in batches of 2,000.',
    technicalComplexity: 'Medium',
    status: 'Phase 3 MVP'
  },
  {
    id: 'f5',
    name: 'Original Open Binary Archive Format (.wpbundle)',
    category: 'Core Free MVP',
    rationale: 'Avoids proprietary lock-in while maintaining high-speed streaming without ZipArchive memory overhead.',
    technicalComplexity: 'High',
    status: 'Phase 3 MVP'
  },
  {
    id: 'f6',
    name: 'Local Backup Manager (Create, Restore, Download, Delete)',
    category: 'Core Free MVP',
    rationale: 'Allows safety rollbacks prior to importing new data.',
    technicalComplexity: 'Medium',
    status: 'Phase 3 MVP'
  },
  {
    id: 'f7',
    name: 'System Pre-Flight Compatibility Diagnostic',
    category: 'Core Free MVP',
    rationale: 'Detects memory limits, execution time, writable directories, and table prefixes before starting.',
    technicalComplexity: 'Low',
    status: 'Phase 3 MVP'
  },

  // Optional Add-on Modules
  {
    id: 'f8',
    name: 'Remote Site-to-Site Direct Migration (Push / Pull)',
    category: 'Optional Add-on Module',
    rationale: 'Requires secure cryptographic handshake between two live WordPress instances. High security surface area.',
    technicalComplexity: 'Critical',
    status: 'Phase 4 Advanced'
  },
  {
    id: 'f9',
    name: 'Cloud Storage Adapters (S3, GCS, Dropbox, OneDrive, SFTP)',
    category: 'Optional Add-on Module',
    rationale: 'Core engine should not be bloated with vendor SDKs. Provide clean adapter interface for pluggable storage modules.',
    technicalComplexity: 'Medium',
    status: 'Phase 4 Advanced'
  },
  {
    id: 'f10',
    name: 'Automated Scheduled Backups with Retention Policies',
    category: 'Optional Add-on Module',
    rationale: 'Requires Action Scheduler or system cron daemon to be reliable across low-traffic sites.',
    technicalComplexity: 'Medium',
    status: 'Phase 4 Advanced'
  },
  {
    id: 'f11',
    name: 'WordPress Multisite Network & Subsite Extraction',
    category: 'Optional Add-on Module',
    rationale: 'High complexity in isolating shared user tables and blog-specific prefixes without data contamination.',
    technicalComplexity: 'Critical',
    status: 'Phase 4 Advanced'
  },
  {
    id: 'f12',
    name: 'WP-CLI Command Suite',
    category: 'Optional Add-on Module',
    rationale: 'Targeted at DevOps engineers and agency automation pipelines (wp migrate export / import).',
    technicalComplexity: 'Medium',
    status: 'Phase 4 Advanced'
  },

  // Cloud / External Services
  {
    id: 'f13',
    name: 'Offload Compute Worker (Bypass PHP Limits Completely)',
    category: 'Cloud/External Service',
    rationale: 'Like Migrate Guru/BlogVault: if a site is 150GB+, processing via a managed cloud relay is required.',
    technicalComplexity: 'Critical',
    status: 'Phase 4 Advanced'
  },

  // Banned Anti-Patterns
  {
    id: 'f14',
    name: 'Unauthenticated installer.php Standalone Script (Duplicator Style)',
    category: 'Banned Anti-Pattern',
    rationale: 'Unauthenticated standalone PHP files left on server roots are a massive historical security risk (CVE-2020-11738). Must require active WP authentication.',
    technicalComplexity: 'Low',
    status: 'Rejected'
  },
  {
    id: 'f15',
    name: 'Blind preg_replace on Raw Database Dumps',
    category: 'Banned Anti-Pattern',
    rationale: 'Corrupts serialized PHP string length tokens, rendering WP menus, widgets, and plugins unreadable.',
    technicalComplexity: 'Low',
    status: 'Rejected'
  },
  {
    id: 'f16',
    name: 'Single Monolithic Request with set_time_limit(0) Hope-Strategy',
    category: 'Banned Anti-Pattern',
    rationale: 'Fails under Apache fastcgi, LiteSpeed, Nginx timeouts, and Cloudflare 100s reverse-proxy limits.',
    technicalComplexity: 'Low',
    status: 'Rejected'
  }
];

export const MIGRATION_STATE_STEPS: MigrationStateStep[] = [
  {
    id: 'INITIALIZING',
    label: 'Initialization & Pre-Flight Check',
    phase: 'export',
    description: 'Inspects available disk space, verifies temp folder permissions, creates job lock record.',
    typicalDurationSec: 2,
    memoryRisk: 'Low',
    resumableKey: 'step_init'
  },
  {
    id: 'INDEXING_FILES',
    label: 'Filesystem Traversal & Indexing',
    phase: 'export',
    description: 'Recursive directory scanner indexing wp-content, plugins, themes, and uploads. Computes file count and total size.',
    typicalDurationSec: 5,
    memoryRisk: 'Low',
    resumableKey: 'step_file_index'
  },
  {
    id: 'EXPORTING_DATABASE',
    label: 'Streaming Database Export',
    phase: 'export',
    description: 'Cursor-paginated SQL generation table-by-table with Gzip streaming to database.sql.gz.',
    typicalDurationSec: 15,
    memoryRisk: 'Medium',
    resumableKey: 'step_db_export'
  },
  {
    id: 'PACKAGING_FILES',
    label: 'Streaming File Archive (.wpbundle)',
    phase: 'export',
    description: 'Appending indexed files in 5MB batches into .wpbundle container with CRC32 verification.',
    typicalDurationSec: 25,
    memoryRisk: 'Medium',
    resumableKey: 'step_packaging'
  },
  {
    id: 'FINALIZING_PACKAGE',
    label: 'Manifest Creation & SHA256 Signature',
    phase: 'export',
    description: 'Generates manifest.json with WordPress metadata, table prefix, file counts, and archive SHA256 hash.',
    typicalDurationSec: 2,
    memoryRisk: 'Low',
    resumableKey: 'step_finalize'
  },
  {
    id: 'READY_FOR_DOWNLOAD',
    label: 'Export Complete / Package Ready',
    phase: 'export',
    description: 'Lock released, package moved to secured storage, ready for download or automated restore.',
    typicalDurationSec: 1,
    memoryRisk: 'Low',
    resumableKey: 'step_done'
  }
];

export const PACKAGE_SPEC_DEFINITION = {
  extension: '.wpbundle',
  mimeType: 'application/x-wp-bundle',
  structure: `migration-package.wpbundle/
├── manifest.json              # Complete metadata, WP/PHP version, table prefix, checksums
├── database/
│   ├── schema.sql             # Table structures, CREATE TABLE statements, foreign keys
│   └── data.sql.gz            # Chunked INSERT statements with original table prefix
├── files/
│   ├── wp-content/
│   │   ├── plugins/
│   │   ├── themes/
│   │   └── uploads/
│   └── custom-content/        # Additional included directories
├── security/
│   ├── checksums.sha256       # Cryptographic hashes of all constituent files
│   └── signature.sig          # HMAC-SHA256 signature for package integrity validation
└── logs/
    └── export.log             # Structured diagnostic log for audit trail`
};
