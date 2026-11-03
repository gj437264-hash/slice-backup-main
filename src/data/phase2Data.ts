import { ClassDefinition, DirectoryNode, RestEndpoint } from '../types';

export const SYSTEM_LAYERS = [
  {
    id: 'layer-presentation',
    name: 'Presentation & Interface Layer',
    badge: 'WordPress Admin / REST / CLI',
    color: 'border-indigo-500 bg-indigo-50/50',
    accentColor: 'text-indigo-700 bg-indigo-100',
    description: 'User-facing interfaces providing real-time progress visualization, drag-and-drop slice uploaders, manual trigger buttons, and automated WP-CLI commands.',
    components: [
      { name: 'Admin Dashboard Page', role: 'React-powered single-page admin interface mounted at Tools > WP Bundle Migrator' },
      { name: 'REST API Controllers', role: 'Authenticated endpoints for initiating jobs, polling status, and streaming chunk uploads' },
      { name: 'WP-CLI Command Suite', role: 'Headless automation for terminal administration and CI/CD pipelines (`wp migrate export/import`)' }
    ]
  },
  {
    id: 'layer-controller',
    name: 'Job Engine & State Machine Layer',
    badge: 'Orchestration & Heartbeats',
    color: 'border-blue-500 bg-blue-50/50',
    accentColor: 'text-blue-700 bg-blue-100',
    description: 'Deterministic state machine governing execution phases, step offsets, execution time slicing (6-8s limits), and failure recovery checkpoints.',
    components: [
      { name: 'JobManager', role: 'Coordinates job lifecycles, persists database checkpoints, and tracks progress percentage' },
      { name: 'MigrationStateMachine', role: 'Enforces strict valid transitions between states (CREATED -> EXPORTING_DB -> ...)' },
      { name: 'StepExecutionContext', role: 'Provides execution timeout monitors (micro-chunk budgets) and memory tracking' }
    ]
  },
  {
    id: 'layer-streaming',
    name: 'Streaming IO & Engine Pipeline',
    badge: 'Low-Memory Processing (O(1))',
    color: 'border-emerald-500 bg-emerald-50/50',
    accentColor: 'text-emerald-700 bg-emerald-100',
    description: 'Zero-memory accumulation streaming engines for database dumps, recursive file tree traversal, and serialization-safe string replacements.',
    components: [
      { name: 'DatabaseCursorReader', role: 'Paginates MySQL tables using primary key indexes (WHERE id > last_id LIMIT 2000)' },
      { name: 'DatabaseBatchWriter', role: 'Streams SQL statements in transactional batches with foreign key check disables' },
      { name: 'ArchiveStreamWriter', role: 'Native PHP TAR streaming writer compressing directly to disk without temp file duplication' },
      { name: 'ArchiveStreamReader', role: 'Streaming extractor with Zip Slip boundary validation and file mode preservation' },
      { name: 'SerializationReplacer', role: 'Byte-accurate recursive parser updating s:length byte counts for UTF-8 domains' }
    ]
  },
  {
    id: 'layer-storage',
    name: 'Storage Abstraction Layer',
    badge: 'Pluggable Storage Adapters',
    color: 'border-amber-500 bg-amber-50/50',
    accentColor: 'text-amber-700 bg-amber-100',
    description: 'Unified storage interface shielding core logic from destination specifics (Local protected directory, S3, GCS, Dropbox, SFTP).',
    components: [
      { name: 'StorageAdapterInterface', role: 'Standardized contract for putStream, getStream, listFiles, delete, and getSignedUrl' },
      { name: 'LocalStorageAdapter', role: 'Protected local vault in wp-content/uploads/wpmigrate-[rand32]/ with .htaccess and index.php' },
      { name: 'S3StorageAdapter', role: 'Multipart chunked streaming to AWS S3 / Cloudflare R2 / MinIO' }
    ]
  },
  {
    id: 'layer-security',
    name: 'Security & Isolation Layer',
    badge: 'Zero-Trust Defense-in-Depth',
    color: 'border-rose-500 bg-rose-50/50',
    accentColor: 'text-rose-700 bg-rose-100',
    description: 'Hardened cryptographic verification, capability checks, path sanitization, and safe deserialization boundaries.',
    components: [
      { name: 'SecurityManager', role: 'Validates nonces, capabilities, and HMAC-SHA256 package digital signatures' },
      { name: 'PathCanonicalizer', role: 'Canonicalizes paths with realpath() to prevent CWE-22 Zip Slip directory traversal' },
      { name: 'SafeDeserializer', role: 'Enforces allowed_classes => false on all unserialize operations to stop PHP POP chains' }
    ]
  }
];

export const CLASS_DEFINITIONS: ClassDefinition[] = [
  {
    name: 'JobManager',
    namespace: 'WpBundleMigrator\\Core',
    type: 'class',
    description: 'Orchestrates the lifecycle of all migration jobs, persisting state to wp_migrator_jobs, managing timeouts, and triggering state transitions.',
    responsibilities: [
      'Create new export, import, or backup jobs with unique UUIDs',
      'Manage micro-chunk execution loop within time limits (e.g. 6 seconds)',
      'Record step offsets and byte offsets to resume failed or timed-out jobs',
      'Compute real-time aggregate percentage based on weighted step metrics',
      'Persist structured log entries to wp_migrator_logs'
    ],
    keyMethods: [
      { signature: 'createJob(string $type, array $options): MigrationJob', returnType: 'MigrationJob', description: 'Initializes and persists a new job record with status CREATED' },
      { signature: 'getJob(string $jobId): ?MigrationJob', returnType: '?MigrationJob', description: 'Retrieves job record and initializes execution state' },
      { signature: 'executeNextStep(string $jobId): StepResult', returnType: 'StepResult', description: 'Executes a single timed slice of work and returns current status or yields for next tick' },
      { signature: 'cancelJob(string $jobId): bool', returnType: 'bool', description: 'Aborts job execution and initiates cleanup routines' }
    ],
    codeSnippet: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Core;

use WpBundleMigrator\\Database\\JobRepository;
use WpBundleMigrator\\Security\\SecurityManager;

final class JobManager {
    public function __construct(
        private readonly JobRepository $repository,
        private readonly MigrationStateMachine $stateMachine,
        private readonly SecurityManager $security
    ) {}

    public function createJob(string $type, array $options): MigrationJob {
        $this->security->assertCanManageMigrations();
        
        $jobId = wp_generate_uuid4();
        $job = new MigrationJob(
            id: $jobId,
            type: JobType::from($type),
            status: JobStatus::CREATED,
            progressPercent: 0.0,
            currentStep: 'INITIALIZING',
            stepOffset: 0,
            options: $options
        );

        $this->repository->insert($job);
        return $job;
    }

    public function executeNextStep(string $jobId): StepResult {
        $job = $this->repository->find($jobId);
        if (!$job || $job->isFinished()) {
            throw new \\DomainException("Job is invalid or already finished.");
        }

        $stepContext = new StepExecutionContext(
            maxDurationSeconds: 6, // Stay well below 15s LiteSpeed timeouts
            startMemory: memory_get_usage(true)
        );

        $stepHandler = $this->resolveStepHandler($job->status);
        $result = $stepHandler->process($job, $stepContext);

        if ($result->isStepCompleted()) {
            $nextStatus = $this->stateMachine->getNextStatus($job->status);
            $job->transitionTo($nextStatus);
        } else {
            $job->updateOffset($result->getNextOffset());
        }

        $this->repository->update($job);
        return $result;
    }
}`
  },
  {
    name: 'MigrationStateMachine',
    namespace: 'WpBundleMigrator\\Core',
    type: 'class',
    description: 'Enforces valid state transitions and guarantees migration consistency across network or execution interruptions.',
    responsibilities: [
      'Define strict state transition matrix (no jumping over steps)',
      'Calculate weighted progress percentages across multi-stage processes',
      'Provide rollback transitions if failures occur during restore'
    ],
    keyMethods: [
      { signature: 'canTransition(JobStatus $current, JobStatus $target): bool', returnType: 'bool', description: 'Validates if transition is legally permitted' },
      { signature: 'getNextStatus(JobStatus $current): JobStatus', returnType: 'JobStatus', description: 'Determines the next sequential state in normal pipeline' },
      { signature: 'getFailureRollbackStatus(JobStatus $current): JobStatus', returnType: 'JobStatus', description: 'Determines clean-up or rollback target upon critical failure' }
    ]
  },
  {
    name: 'DatabaseExporterInterface',
    namespace: 'WpBundleMigrator\\Database',
    type: 'interface',
    description: 'Contract for exporting MySQL databases without memory exhaustion or timeouts.',
    responsibilities: [
      'Discover all tables matching WordPress prefix or selected custom tables',
      'Dump table schemas (CREATE TABLE statements, collations, indexes)',
      'Stream table data using primary key cursor pagination in batches',
      'Compress streaming SQL output via Gzip directly into target file handle'
    ],
    keyMethods: [
      { signature: 'getTableList(): array', returnType: 'array<string>', description: 'Returns array of table names to be processed' },
      { signature: 'exportTableSchema(string $table, resource $stream): void', returnType: 'void', description: 'Writes CREATE TABLE DDL to stream' },
      { signature: 'exportTableDataChunk(string $table, int $lastId, int $limit, resource $stream): CursorResult', returnType: 'CursorResult', description: 'Queries and exports a batch using cursor index seek' }
    ],
    codeSnippet: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Database;

interface DatabaseExporterInterface {
    /**
     * @return array<string>
     */
    public function getTableList(): array;

    /**
     * @param resource $stream Destination file or compression handle
     */
    public function exportTableSchema(string $tableName, $stream): void;

    /**
     * @param resource $stream
     */
    public function exportTableDataChunk(
        string $tableName, 
        int $lastPrimaryKey, 
        int $limit, 
        $stream
    ): CursorResult;
}`
  },
  {
    name: 'DatabaseCursorReader',
    namespace: 'WpBundleMigrator\\Database',
    type: 'class',
    implementsOrExtends: 'implements DatabaseExporterInterface',
    description: 'Implements deterministic primary key cursor pagination with O(1) index seeks.',
    responsibilities: [
      'Inspect table primary keys via information_schema or SHOW COLUMNS',
      'Query rows using WHERE primary_key > ? ORDER BY primary_key ASC LIMIT ?',
      'Escape binary and string data with $wpdb->_real_escape',
      'Generate multi-row INSERT INTO statement chunks'
    ],
    keyMethods: [
      { signature: 'getPrimaryKey(string $table): ?string', returnType: '?string', description: 'Resolves primary key column name' },
      { signature: 'exportTableDataChunk(...): CursorResult', returnType: 'CursorResult', description: 'Fetches chunk and writes formatted SQL statements' }
    ]
  },
  {
    name: 'SerializationReplacer',
    namespace: 'WpBundleMigrator\\Database',
    type: 'class',
    description: 'Performs byte-accurate search and replace on strings, arrays, objects, and serialized PHP tokens.',
    responsibilities: [
      'Recursively traverse arrays and objects without modifying class structures',
      'Safely unpack serialized strings using allowed_classes => false to stop POP exploits',
      'Calculate raw 8-bit byte length deltas for UTF-8 domain replacements',
      'Re-serialize repaired data structures back into valid PHP format'
    ],
    keyMethods: [
      { signature: 'replace(mixed $data, string $search, string $replace): mixed', returnType: 'mixed', description: 'Recursively replaces string and repairs serialization tokens' },
      { signature: 'replaceInSerializedString(string $data, string $search, string $replace): string', returnType: 'string', description: 'Token-level regex replacement with byte-offset recomputation' }
    ],
    codeSnippet: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Database;

final class SerializationReplacer {
    public function replace(mixed $data, string $search, string $replace): mixed {
        if ($search === $replace || empty($search)) {
            return $data;
        }

        if (is_string($data)) {
            // Check if string is serialized PHP data
            if ($this->isSerialized($data)) {
                return $this->replaceInSerializedString($data, $search, $replace);
            }
            return str_replace($search, $replace, $data);
        }

        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $newKey = is_string($key) ? str_replace($search, $replace, $key) : $key;
                $result[$newKey] = $this->replace($value, $search, $replace);
            }
            return $result;
        }

        return $data;
    }

    private function replaceInSerializedString(string $serialized, string $search, string $replace): string {
        // Safe deserialization without instantiating arbitrary classes (CWE-502 mitigation)
        $unserialized = @unserialize($serialized, ['allowed_classes' => false]);
        if ($unserialized !== false || $serialized === 'b:0;') {
            $replaced = $this->replace($unserialized, $search, $replace);
            return serialize($replaced);
        }

        // Fallback: Regex token parser for corrupted or partial serialized tokens
        return preg_replace_callback(
            '/s:(\\d+):"(.*?)";/s',
            function (array $matches) use ($search, $replace): string {
                $str = $matches[2];
                if (str_contains($str, $search)) {
                    $newStr = str_replace($search, $replace, $str);
                    $newByteLen = strlen($newStr); // Raw 8-bit byte length
                    return "s:{$newByteLen}:\"{$newStr}\";";
                }
                return $matches[0];
            },
            $serialized
        ) ?? $serialized;
    }

    private function isSerialized(string $string): bool {
        $trimmed = trim($string);
        if ($trimmed === 'N;') return true;
        if (strlen($trimmed) < 4 || $trimmed[1] !== ':') return false;
        return in_array($trimmed[0], ['s', 'a', 'O', 'i', 'd', 'b'], true);
    }
}`
  },
  {
    name: 'ArchiveWriterInterface',
    namespace: 'WpBundleMigrator\\Archive',
    type: 'interface',
    description: 'Contract for creating streaming .wpbundle packages with zero temporary storage duplication.',
    responsibilities: [
      'Initialize container header and manifest metadata',
      'Append files and stream contents directly into the archive without buffering full file into RAM',
      'Calculate streaming SHA256 checksums on the fly',
      'Finalize archive with security signature'
    ],
    keyMethods: [
      { signature: 'open(string $destinationPath): void', returnType: 'void', description: 'Opens destination file handle' },
      { signature: 'addFileFromPath(string $sourcePath, string $archivePath): void', returnType: 'void', description: 'Streams a physical file into archive' },
      { signature: 'addFileFromStream(string $archivePath, $stream, int $size): void', returnType: 'void', description: 'Streams dynamic content (e.g. SQL dump) into archive' },
      { signature: 'close(): ArchiveManifest', returnType: 'ArchiveManifest', description: 'Writes central directory, manifest, and closes file handle' }
    ]
  },
  {
    name: 'ArchiveStreamReader',
    namespace: 'WpBundleMigrator\\Archive',
    type: 'class',
    description: 'Streaming extractor for .wpbundle containers with path traversal protection and chunked extraction.',
    responsibilities: [
      'Validate magic bytes and container signature before extraction',
      'Extract files entry by entry with canonical path verification (Zip Slip defense)',
      'Pause and persist read-offset after reaching execution time limit'
    ],
    keyMethods: [
      { signature: 'verifySignature(string $packagePath): bool', returnType: 'bool', description: 'Verifies HMAC-SHA256 signature against local site key' },
      { signature: 'extractNextChunk(string $destinationDir, int $maxDurationSeconds): ExtractionResult', returnType: 'ExtractionResult', description: 'Extracts batch of files within time budget' }
    ]
  },
  {
    name: 'StorageAdapterInterface',
    namespace: 'WpBundleMigrator\\Storage',
    type: 'interface',
    description: 'Pluggable storage interface for local files and third-party cloud object storage providers.',
    responsibilities: [
      'Abstract write and read stream operations',
      'Manage backup retention and lifecycle cleanup policies',
      'Generate secure pre-signed download URLs for administrative retrieval'
    ],
    keyMethods: [
      { signature: 'putStream(string $path, $stream): bool', returnType: 'bool', description: 'Uploads stream directly to destination' },
      { signature: 'getStream(string $path)', returnType: 'resource', description: 'Opens readable stream for download or restore' },
      { signature: 'delete(string $path): bool', returnType: 'bool', description: 'Removes archive from storage' },
      { signature: 'listFiles(string $prefix = ""): array', returnType: 'array<StorageFile>', description: 'Lists stored backup archives with metadata' }
    ]
  },
  {
    name: 'SecurityManager',
    namespace: 'WpBundleMigrator\\Security',
    type: 'class',
    description: 'Guarantees authorization, validates CSRF nonces, verifies file signatures, and isolates storage vaults.',
    responsibilities: [
      'Assert user possesses manage_options / export capabilities',
      'Create and verify WordPress REST nonces and job authentication tokens',
      'Create secure private storage directory with .htaccess and empty index.html',
      'Generate and verify HMAC-SHA256 signatures using secret site auth key'
    ],
    keyMethods: [
      { signature: 'assertCanManageMigrations(): void', returnType: 'void', description: 'Throws authorization exception if current user lacks capability' },
      { signature: 'getVaultPath(): string', returnType: 'string', description: 'Returns protected storage directory path' },
      { signature: 'signPackage(string $filePath): string', returnType: 'string', description: 'Generates HMAC-SHA256 signature for archive' },
      { signature: 'verifyPackageSignature(string $filePath, string $sig): bool', returnType: 'bool', description: 'Constant-time verification of signature' }
    ]
  }
];

export const DIRECTORY_STRUCTURE: DirectoryNode = {
  name: 'wp-bundle-migrator',
  type: 'folder',
  path: '/wp-content/plugins/wp-bundle-migrator',
  description: 'Root plugin directory conforming to WordPress standards and PSR-4 namespace mappings.',
  children: [
    {
      name: 'wp-bundle-migrator.php',
      type: 'file',
      path: '/wp-content/plugins/wp-bundle-migrator/wp-bundle-migrator.php',
      description: 'Main plugin bootstrap file with header declaration, autoloader registration, and activation hooks.',
      preview: `<?php
/**
 * Plugin Name: WP Bundle Migrator
 * Plugin URI:  https://github.com/example/wp-bundle-migrator
 * Description: Production-grade, low-memory streaming migration engine for WordPress 6.7+.
 * Version:      1.0.0
 * Requires PHP: 8.1
 * Requires at least: 6.7
 * Author:       WP Migration Architect
 * License:      GPL-2.0-or-later
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('WPB_MIGRATOR_VERSION', '1.0.0');
define('WPB_MIGRATOR_PATH', plugin_dir_path(__FILE__));
define('WPB_MIGRATOR_URL', plugin_dir_url(__FILE__));

// PSR-4 Autoloader
spl_autoload_register(static function (string $class): void {
    $prefix = 'WpBundleMigrator\\\\';
    $baseDir = WPB_MIGRATOR_PATH . 'src/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\\\', '/', $relativeClass) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});

// Boot plugin instance on plugins_loaded
add_action('plugins_loaded', static function (): void {
    \\WpBundleMigrator\\Core\\Plugin::getInstance()->boot();
});

register_activation_hook(__FILE__, static function (): void {
    \\WpBundleMigrator\\Core\\Installer::activate();
});

register_deactivation_hook(__FILE__, static function (): void {
    \\WpBundleMigrator\\Core\\Installer::deactivate();
});`
    },
    {
      name: 'uninstall.php',
      type: 'file',
      path: '/wp-content/plugins/wp-bundle-migrator/uninstall.php',
      description: 'Clean uninstall script that drops custom tables, removes storage vaults, and deletes options.',
      preview: `<?php
/**
 * Triggered only when plugin is uninstalled via WordPress Admin.
 */
declare(strict_types=1);

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Drop custom migration tables
$tables = [
    $wpdb->prefix . 'migrator_jobs',
    $wpdb->prefix . 'migrator_backups',
    $wpdb->prefix . 'migrator_logs'
];

foreach ($tables as $table) {
    $wpdb->query("DROP TABLE IF EXISTS {$table}");
}

// Delete all plugin options
delete_option('wpb_migrator_settings');
delete_option('wpb_migrator_vault_key');
delete_option('wpb_migrator_db_version');

// Clean up vault directory if configured
$uploadDir = wp_upload_dir();
$vaultPath = get_option('wpb_migrator_vault_path');
if ($vaultPath && is_dir($vaultPath) && str_starts_with($vaultPath, $uploadDir['basedir'])) {
    \\WpBundleMigrator\\Files\\FileTraverser::deleteDirectoryRecursive($vaultPath);
}`
    },
    {
      name: 'src',
      type: 'folder',
      path: '/wp-content/plugins/wp-bundle-migrator/src',
      description: 'PSR-4 root namespace directory mapped to WpBundleMigrator\\',
      children: [
        {
          name: 'Core',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Core',
          description: 'Core plugin container, state machine, job manager, and installer.',
          children: [
            { name: 'Plugin.php', type: 'file', path: 'src/Core/Plugin.php', psr4Class: 'WpBundleMigrator\\Core\\Plugin' },
            { name: 'Installer.php', type: 'file', path: 'src/Core/Installer.php', psr4Class: 'WpBundleMigrator\\Core\\Installer' },
            { name: 'JobManager.php', type: 'file', path: 'src/Core/JobManager.php', psr4Class: 'WpBundleMigrator\\Core\\JobManager' },
            { name: 'MigrationStateMachine.php', type: 'file', path: 'src/Core/MigrationStateMachine.php', psr4Class: 'WpBundleMigrator\\Core\\MigrationStateMachine' },
            { name: 'StepExecutionContext.php', type: 'file', path: 'src/Core/StepExecutionContext.php', psr4Class: 'WpBundleMigrator\\Core\\StepExecutionContext' },
            { name: 'JobStatus.php', type: 'file', path: 'src/Core/JobStatus.php', psr4Class: 'WpBundleMigrator\\Core\\JobStatus' }
          ]
        },
        {
          name: 'Database',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Database',
          description: 'Database streaming exporters, batch importers, and serialization replacers.',
          children: [
            { name: 'DatabaseExporterInterface.php', type: 'file', path: 'src/Database/DatabaseExporterInterface.php', psr4Class: 'WpBundleMigrator\\Database\\DatabaseExporterInterface' },
            { name: 'DatabaseCursorReader.php', type: 'file', path: 'src/Database/DatabaseCursorReader.php', psr4Class: 'WpBundleMigrator\\Database\\DatabaseCursorReader' },
            { name: 'DatabaseBatchWriter.php', type: 'file', path: 'src/Database/DatabaseBatchWriter.php', psr4Class: 'WpBundleMigrator\\Database\\DatabaseBatchWriter' },
            { name: 'SerializationReplacer.php', type: 'file', path: 'src/Database/SerializationReplacer.php', psr4Class: 'WpBundleMigrator\\Database\\SerializationReplacer' },
            { name: 'JobRepository.php', type: 'file', path: 'src/Database/JobRepository.php', psr4Class: 'WpBundleMigrator\\Database\\JobRepository' }
          ]
        },
        {
          name: 'Archive',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Archive',
          description: 'Package format writers, streaming extractors, and manifest generators.',
          children: [
            { name: 'ArchiveWriterInterface.php', type: 'file', path: 'src/Archive/ArchiveWriterInterface.php', psr4Class: 'WpBundleMigrator\\Archive\\ArchiveWriterInterface' },
            { name: 'ArchiveStreamWriter.php', type: 'file', path: 'src/Archive/ArchiveStreamWriter.php', psr4Class: 'WpBundleMigrator\\Archive\\ArchiveStreamWriter' },
            { name: 'ArchiveStreamReader.php', type: 'file', path: 'src/Archive/ArchiveStreamReader.php', psr4Class: 'WpBundleMigrator\\Archive\\ArchiveStreamReader' },
            { name: 'ManifestBuilder.php', type: 'file', path: 'src/Archive/ManifestBuilder.php', psr4Class: 'WpBundleMigrator\\Archive\\ManifestBuilder' }
          ]
        },
        {
          name: 'Files',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Files',
          description: 'Filesystem traversers, chunk slice assemblers, and path canonicalizers.',
          children: [
            { name: 'FileTraverser.php', type: 'file', path: 'src/Files/FileTraverser.php', psr4Class: 'WpBundleMigrator\\Files\\FileTraverser' },
            { name: 'ChunkAssembler.php', type: 'file', path: 'src/Files/ChunkAssembler.php', psr4Class: 'WpBundleMigrator\\Files\\ChunkAssembler' },
            { name: 'PathCanonicalizer.php', type: 'file', path: 'src/Files/PathCanonicalizer.php', psr4Class: 'WpBundleMigrator\\Files\\PathCanonicalizer' }
          ]
        },
        {
          name: 'Storage',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Storage',
          description: 'Storage abstraction interface and local/remote adapter implementations.',
          children: [
            { name: 'StorageAdapterInterface.php', type: 'file', path: 'src/Storage/StorageAdapterInterface.php', psr4Class: 'WpBundleMigrator\\Storage\\StorageAdapterInterface' },
            { name: 'LocalStorageAdapter.php', type: 'file', path: 'src/Storage/LocalStorageAdapter.php', psr4Class: 'WpBundleMigrator\\Storage\\LocalStorageAdapter' },
            { name: 'StorageManager.php', type: 'file', path: 'src/Storage/StorageManager.php', psr4Class: 'WpBundleMigrator\\Storage\\StorageManager' }
          ]
        },
        {
          name: 'Security',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Security',
          description: 'Authentication guards, HMAC signatures, and safe deserialization routines.',
          children: [
            { name: 'SecurityManager.php', type: 'file', path: 'src/Security/SecurityManager.php', psr4Class: 'WpBundleMigrator\\Security\\SecurityManager' },
            { name: 'SafeDeserializer.php', type: 'file', path: 'src/Security/SafeDeserializer.php', psr4Class: 'WpBundleMigrator\\Security\\SafeDeserializer' }
          ]
        },
        {
          name: 'Http',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Http',
          description: 'WordPress REST API endpoints and admin page rendering controllers.',
          children: [
            { name: 'JobsController.php', type: 'file', path: 'src/Http/JobsController.php', psr4Class: 'WpBundleMigrator\\Http\\JobsController' },
            { name: 'UploadController.php', type: 'file', path: 'src/Http/UploadController.php', psr4Class: 'WpBundleMigrator\\Http\\UploadController' },
            { name: 'AdminPageController.php', type: 'file', path: 'src/Http/AdminPageController.php', psr4Class: 'WpBundleMigrator\\Http\\AdminPageController' }
          ]
        },
        {
          name: 'Cli',
          type: 'folder',
          path: '/wp-content/plugins/wp-bundle-migrator/src/Cli',
          description: 'WP-CLI terminal commands for headless backups and automated migrations.',
          children: [
            { name: 'MigrateCommand.php', type: 'file', path: 'src/Cli/MigrateCommand.php', psr4Class: 'WpBundleMigrator\\Cli\\MigrateCommand' }
          ]
        }
      ]
    },
    {
      name: 'templates',
      type: 'folder',
      path: '/wp-content/plugins/wp-bundle-migrator/templates',
      description: 'Server-side admin view templates and React mount entrypoint.',
      children: [
        { name: 'admin-app.php', type: 'file', path: 'templates/admin-app.php', description: 'Mount markup for React admin workspace' }
      ]
    },
    {
      name: 'assets',
      type: 'folder',
      path: '/wp-content/plugins/wp-bundle-migrator/assets',
      description: 'Compiled production scripts and styles for WordPress admin UI.',
      children: [
        { name: 'admin.js', type: 'file', path: 'assets/admin.js' },
        { name: 'admin.css', type: 'file', path: 'assets/admin.css' }
      ]
    }
  ]
};

export const REST_ENDPOINTS: RestEndpoint[] = [
  {
    method: 'POST',
    route: '/wp-json/wp-bundle-migrator/v1/jobs',
    capability: 'manage_options',
    description: 'Creates a new migration job (export, backup, or import setup) with client options.',
    requestBodyExample: `{
  "type": "export",
  "components": ["database", "plugins", "themes", "uploads"],
  "excludeTables": ["wp_actionscheduler_logs"]
}`,
    responseExample: `{
  "jobId": "8f3b6c2a-9e1d-4f8a-b5c3-1a2b3c4d5e6f",
  "status": "CREATED",
  "currentStep": "INITIALIZING",
  "progress": 0,
  "createdAt": "2026-09-11T00:40:00Z"
}`
  },
  {
    method: 'POST',
    route: '/wp-json/wp-bundle-migrator/v1/jobs/{jobId}/tick',
    capability: 'manage_options',
    description: 'Main heartbeat endpoint. Executes one micro-chunk time slice (6s max) and returns current progress and status.',
    requestBodyExample: `{
  "clientToken": "wpm_sess_8f3b6c2a..."
}`,
    responseExample: `{
  "jobId": "8f3b6c2a-9e1d-4f8a-b5c3-1a2b3c4d5e6f",
  "status": "EXPORTING_DB",
  "currentStep": "Dumping table: wp_posts",
  "progress": 42.5,
  "isFinished": false,
  "memoryUsedMb": 14.8,
  "nextStepOffset": 24000
}`
  },
  {
    method: 'GET',
    route: '/wp-json/wp-bundle-migrator/v1/jobs/{jobId}',
    capability: 'manage_options',
    description: 'Retrieves current status, metrics, step offsets, and any diagnostic error logs for a specific job.',
    responseExample: `{
  "jobId": "8f3b6c2a-9e1d-4f8a-b5c3-1a2b3c4d5e6f",
  "status": "PACKAGING",
  "progress": 78.0,
  "packageSizeMb": 245.8,
  "downloadUrl": "/wp-json/wp-bundle-migrator/v1/jobs/8f3b6c2a.../download?nonce=..."
}`
  },
  {
    method: 'POST',
    route: '/wp-json/wp-bundle-migrator/v1/upload/chunk',
    capability: 'manage_options',
    description: 'Receives a 1MB-2MB file slice from the frontend uploader and appends it to the staging file.',
    requestBodyExample: `FormData {
  chunkIndex: 14,
  totalChunks: 80,
  uploadId: "upl_9a8b7c6d",
  fileSlice: [Binary Blob 2MB]
}`,
    responseExample: `{
  "uploadId": "upl_9a8b7c6d",
  "receivedChunks": 15,
  "totalChunks": 80,
  "isComplete": false
}`
  },
  {
    method: 'GET',
    route: '/wp-json/wp-bundle-migrator/v1/backups',
    capability: 'manage_options',
    description: 'Lists all available backup archives in local and cloud storage with integrity checksums.',
    responseExample: `[
  {
    "id": "bak_2026_09_11_full",
    "filename": "backup-2026-09-11-full.wpbundle",
    "filesizeBytes": 257723910,
    "wpVersion": "6.7.1",
    "phpVersion": "8.2.14",
    "checksumSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "createdAt": "2026-09-11T00:30:00Z"
  }
]`
  }
];

export const DATA_FLOW_STAGES = {
  export: [
    {
      step: 1,
      title: 'Pre-flight Validation & Initialization',
      state: 'VALIDATING',
      detail: 'Checks write permissions on vault directory, calculates estimated database and wp-content sizes, verifies PHP memory ceiling, and generates job record.',
      bufferStrategy: 'Zero disk allocation; read-only diagnostics.'
    },
    {
      step: 2,
      title: 'Database Streaming Dump (Cursor Pagination)',
      state: 'EXPORTING_DB',
      detail: 'Iterates through all discovered tables. Queries rows in indexed batches (WHERE id > ? LIMIT 2000), compresses SQL output with Gzip, and streams into database/data.sql.gz.',
      bufferStrategy: 'Fixed 2MB write stream buffer; RAM flat at ~12MB.'
    },
    {
      step: 3,
      title: 'File System Recursive Index & Stream',
      state: 'EXPORTING_FILES',
      detail: 'Traverses wp-content (plugins, themes, uploads). Files are added sequentially to the streaming TAR archive, pausing at time slice limit.',
      bufferStrategy: 'Native fopen/fread/fwrite stream loops; no zip uncompressed temporary directory required.'
    },
    {
      step: 4,
      title: 'Manifest & Checksum Packaging',
      state: 'PACKAGING',
      detail: 'Generates manifest.json (versions, prefixes, table schema map), computes SHA256 checksums, signs with HMAC key, and appends to .wpbundle.',
      bufferStrategy: 'Streams central directory metadata directly to archive tail.'
    },
    {
      step: 5,
      title: 'Completion & Download Handshake',
      state: 'COMPLETED',
      detail: 'Finalizes file permissions (0600), records entry in wp_migrator_backups, generates temporary signed download token, and notifies UI.',
      bufferStrategy: 'Ready for one-click admin download or remote cloud upload.'
    }
  ],
  import: [
    {
      step: 1,
      title: 'Chunked Upload & Verification',
      state: 'IMPORTING',
      detail: 'Client splits .wpbundle into 1MB-2MB slices via FileReader and streams sequentially. Server verifies magic bytes and HMAC signature.',
      bufferStrategy: 'Direct byte append into staging file; memory stays <4MB per chunk.'
    },
    {
      step: 2,
      title: 'Pre-Restore Safety Checkpoint',
      state: 'PREPARING',
      detail: 'Inspects manifest.json to verify WordPress and PHP compatibility. Generates temporary DB table prefix backup if requested for rollback safety.',
      bufferStrategy: 'Validates target disk space vs uncompressed package manifest size.'
    },
    {
      step: 3,
      title: 'Database Streaming Restoration',
      state: 'RESTORING_DB',
      detail: 'Reads database/data.sql.gz via streaming Gzip decompressor, splits on semicolon statement delimiters, and executes in transactional batches.',
      bufferStrategy: 'Disables foreign key checks and autocommit temporarily for 10x insertion throughput.'
    },
    {
      step: 4,
      title: 'Filesystem Safe Extraction',
      state: 'RESTORING_FILES',
      detail: 'Streams files into target directories. Every file path is canonicalized via realpath() to guarantee it sits within ABSPATH/wp-content (Zip Slip defense).',
      bufferStrategy: 'Atomic file write (write to .tmp then rename) prevents partial file corruption on timeout.'
    },
    {
      step: 5,
      title: 'Serialization-Safe Domain Search & Replace',
      state: 'UPDATING_URLS',
      detail: 'Scans options, post content, and postmeta. Parses serialized PHP strings, updates URL strings, recalculates s:length byte offsets, and saves.',
      bufferStrategy: 'Paginated database cursor batches; recursive array traversal.'
    },
    {
      step: 6,
      title: 'Cache Flush & Finalization',
      state: 'FINALIZING',
      detail: 'Flushes WP object cache, clears rewrite rules (flush_rewrite_rules), deletes staging files, and transitions job to COMPLETED.',
      bufferStrategy: 'Clean exit without residual temporary files left on disk.'
    }
  ]
};
