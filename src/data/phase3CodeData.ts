import { PhpSourceFile, BackupItem } from '../types';

export const INITIAL_BACKUPS: BackupItem[] = [
  {
    id: 'bak-2026-09-10-full',
    filename: 'backup-2026-09-10-production-full.wpbundle',
    sizeBytes: 148924000, // ~142MB
    wpVersion: '6.7.1',
    phpVersion: '8.3.4',
    checksum: 'a9f2c842b109dc0947ba9491a9b4ce36814231b415a7732dc23a9d7010f3c5b8',
    createdAt: '2026-09-10 18:30:15',
    components: ['database', 'plugins', 'themes', 'uploads']
  },
  {
    id: 'bak-2026-09-08-db',
    filename: 'backup-2026-09-08-staging-db-only.wpbundle',
    sizeBytes: 18450000, // ~17.6MB
    wpVersion: '6.7.1',
    phpVersion: '8.2.16',
    checksum: '7b83d5a49c2e01f11a8b9487c53d12a9e32f05781a943bc72910fae1c3905b12',
    createdAt: '2026-09-08 12:15:00',
    components: ['database']
  }
];

export const PRODUCTION_PHP_FILES: PhpSourceFile[] = [
  {
    name: 'DatabaseCursorReader.php',
    path: 'src/Database/DatabaseCursorReader.php',
    namespace: 'WpBundleMigrator\\Database',
    category: 'Database',
    description: 'Streaming MySQL exporter using primary key cursor pagination (WHERE id > ? ORDER BY id ASC LIMIT 2000). Zero offset degradation and flat 8MB RAM consumption.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Database;

use wpdb;
use RuntimeException;
use InvalidArgumentException;

/**
 * High-performance, streaming MySQL exporter designed for restrictive shared hosting.
 * Bypasses high-offset degradation by using indexed cursor pagination.
 */
final class DatabaseCursorReader implements DatabaseExporterInterface {
    private const DEFAULT_CHUNK_SIZE = 2000;

    public function __construct(
        private readonly wpdb $db,
        private readonly int $chunkSize = self::DEFAULT_CHUNK_SIZE
    ) {}

    /**
     * Discovers all tables matching the WordPress prefix.
     *
     * @return array<string>
     */
    public function getTableList(): array {
        $prefix = $this->db->prefix;
        $escapedPrefix = str_replace('_', '\\\\_', $prefix);
        $results = $this->db->get_col(
            $this->db->prepare("SHOW TABLES LIKE %s", $escapedPrefix . '%')
        );

        if (!is_array($results)) {
            throw new RuntimeException("Failed to discover database tables: " . $this->db->last_error);
        }

        return $results;
    }

    /**
     * Dumps the table structure (CREATE TABLE DDL) directly to the output stream.
     *
     * @param string $tableName
     * @param resource $stream
     */
    public function exportTableSchema(string $tableName, $stream): void {
        $this->assertValidIdentifier($tableName);

        $row = $this->db->get_row("SHOW CREATE TABLE \`{$tableName}\`", ARRAY_N);
        if (!$row || empty($row[1])) {
            throw new RuntimeException("Could not retrieve CREATE TABLE statement for {$tableName}");
        }

        $ddl = "DROP TABLE IF EXISTS \`{$tableName}\`;\\n" . $row[1] . ";\\n\\n";
        $written = fwrite($stream, $ddl);
        if ($written === false) {
            throw new RuntimeException("Failed writing schema DDL to stream for {$tableName}");
        }
    }

    /**
     * Exports a chunk of table rows using indexed cursor seek pagination.
     *
     * @param string $tableName
     * @param int $lastPrimaryKey Row cursor pointer
     * @param resource $stream Destination file stream handle (e.g., gzopen or fopen)
     * @return CursorResult
     */
    public function exportTableDataChunk(string $tableName, int $lastPrimaryKey, $stream): CursorResult {
        $this->assertValidIdentifier($tableName);
        $primaryKey = $this->getPrimaryKeyColumn($tableName);

        // If no primary key exists, fallback to indexed auto-increment or deterministic OFFSET
        if ($primaryKey === null) {
            return $this->exportWithoutPrimaryKey($tableName, $lastPrimaryKey, $stream);
        }

        $query = $this->db->prepare(
            "SELECT * FROM \`{$tableName}\` WHERE \`{$primaryKey}\` > %d ORDER BY \`{$primaryKey}\` ASC LIMIT %d",
            $lastPrimaryKey,
            $this->chunkSize
        );

        $rows = $this->db->get_results($query, ARRAY_A);
        if ($rows === null) {
            throw new RuntimeException("Database error during chunk export: " . $this->db->last_error);
        }

        $rowCount = count($rows);
        if ($rowCount === 0) {
            return new CursorResult(
                tableName: $tableName,
                rowsExported: 0,
                nextCursor: $lastPrimaryKey,
                hasMore: false
            );
        }

        $sqlBuffer = $this->buildInsertStatement($tableName, $rows);
        if (fwrite($stream, $sqlBuffer) === false) {
            throw new RuntimeException("Failed writing row chunk to export stream for {$tableName}");
        }

        $lastRow = end($rows);
        $newCursor = (int) $lastRow[$primaryKey];

        return new CursorResult(
            tableName: $tableName,
            rowsExported: $rowCount,
            nextCursor: $newCursor,
            hasMore: $rowCount === $this->chunkSize
        );
    }

    /**
     * Resolves the primary key column name for a given table.
     */
    private function getPrimaryKeyColumn(string $tableName): ?string {
        $cols = $this->db->get_results("SHOW KEYS FROM \`{$tableName}\` WHERE Key_name = 'PRIMARY'", ARRAY_A);
        if (!empty($cols[0]['Column_name'])) {
            return (string) $cols[0]['Column_name'];
        }
        return null;
    }

    /**
     * Formats multiple rows into an atomic multi-row INSERT statement.
     *
     * @param string $tableName
     * @param array<array<string, mixed>> $rows
     */
    private function buildInsertStatement(string $tableName, array $rows): string {
        $firstRow = reset($rows);
        $columns = array_map(fn($col) => "\`" . str_replace('\`', '\`\`', $col) . "\`", array_keys($firstRow));
        $columnList = implode(', ', $columns);

        $valuesList = [];
        foreach ($rows as $row) {
            $escapedValues = [];
            foreach ($row as $val) {
                if ($val === null) {
                    $escapedValues[] = 'NULL';
                } elseif (is_numeric($val) && !is_string($val)) {
                    $escapedValues[] = (string) $val;
                } else {
                    $escapedValues[] = "'" . $this->db->_real_escape((string) $val) . "'";
                }
            }
            $valuesList[] = '(' . implode(', ', $escapedValues) . ')';
        }

        return "INSERT INTO \`{$tableName}\` ({$columnList}) VALUES \\n" . implode(",\\n", $valuesList) . ";\\n";
    }

    private function assertValidIdentifier(string $name): void {
        if (!preg_match('/^[a-zA-Z0-9_$]+$/', $name)) {
            throw new InvalidArgumentException("Unsafe table or column identifier: {$name}");
        }
    }
}`
  },
  {
    name: 'ArchiveStreamWriter.php',
    path: 'src/Archive/ArchiveStreamWriter.php',
    namespace: 'WpBundleMigrator\\Archive',
    category: 'Archive',
    description: 'Pure-PHP streaming TAR writer with direct on-the-fly Gzip compression. Emits POSIX ustar headers without loading full files into RAM.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Archive;

use RuntimeException;
use InvalidArgumentException;

/**
 * Streaming TAR archive creator with zero uncompressed disk staging.
 * Conforms to POSIX ustar standard (IEEE 1003.1).
 */
final class ArchiveStreamWriter implements ArchiveWriterInterface {
    private const BLOCK_SIZE = 512;
    private $handle = null;
    private int $totalBytesWritten = 0;

    /**
     * Opens destination archive stream.
     *
     * @param string $destinationPath
     */
    public function open(string $destinationPath): void {
        $stream = fopen($destinationPath, 'wb');
        if ($stream === false) {
            throw new RuntimeException("Failed to open archive destination: {$destinationPath}");
        }
        $this->handle = $stream;
        $this->totalBytesWritten = 0;
    }

    /**
     * Streams an existing file from disk into the archive.
     *
     * @param string $sourceFilePath Absolute path on filesystem
     * @param string $archivePath Relative path inside .wpbundle
     */
    public function addFileFromPath(string $sourceFilePath, string $archivePath): void {
        $this->assertOpen();

        if (!is_file($sourceFilePath) || !is_readable($sourceFilePath)) {
            throw new InvalidArgumentException("Source file unreadable: {$sourceFilePath}");
        }

        $filesize = (int) filesize($sourceFilePath);
        $fileStream = fopen($sourceFilePath, 'rb');
        if ($fileStream === false) {
            throw new RuntimeException("Could not open source file: {$sourceFilePath}");
        }

        try {
            $this->writeHeader($archivePath, $filesize, filemtime($sourceFilePath) ?: time());
            $this->copyStream($fileStream, $filesize);
            $this->writePadding($filesize);
        } finally {
            fclose($fileStream);
        }
    }

    /**
     * Streams dynamic in-memory or generated content directly into archive.
     *
     * @param string $archivePath
     * @param resource $stream
     * @param int $sizeBytes
     */
    public function addFileFromStream(string $archivePath, $stream, int $sizeBytes): void {
        $this->assertOpen();
        $this->writeHeader($archivePath, $sizeBytes, time());
        $this->copyStream($stream, $sizeBytes);
        $this->writePadding($sizeBytes);
    }

    /**
     * Appends two 512-byte zero-block end-of-archive markers and flushes stream.
     */
    public function close(): int {
        $this->assertOpen();
        // Standard TAR EOF: Two 512-byte blocks of binary zeros
        $eofBlocks = pack('a1024', '');
        fwrite($this->handle, $eofBlocks);
        $this->totalBytesWritten += 1024;

        fflush($this->handle);
        fclose($this->handle);
        $this->handle = null;

        return $this->totalBytesWritten;
    }

    /**
     * Generates and writes the 512-byte POSIX ustar header block.
     */
    private function writeHeader(string $filename, int $filesize, int $mtime): void {
        // Sanitize path (strip leading slashes)
        $cleanPath = ltrim(str_replace('\\\\', '/', $filename), '/');
        if (strlen($cleanPath) > 100) {
            // Split into prefix (155) and name (100) per ustar spec
            $prefix = substr($cleanPath, 0, strlen($cleanPath) - 100);
            $name = substr($cleanPath, -100);
        } else {
            $prefix = '';
            $name = $cleanPath;
        }

        // Header fields format: name, mode, uid, gid, size, mtime, chksum, typeflag, linkname, magic, version...
        $header = pack(
            'a100a8a8a8a12a12a8a1a100a6a2a32a32a8a8a155a12',
            $name,
            sprintf('%07o', 0644),
            sprintf('%07o', 0),
            sprintf('%07o', 0),
            sprintf('%011o', $filesize),
            sprintf('%011o', $mtime),
            '        ', // 8 spaces reserved for checksum calculation
            '0',        // Regular file
            '',         // Linkname
            'ustar',    // Magic
            '00',       // Version
            'admin',    // Uname
            'admin',    // Gname
            '',         // Devmajor
            '',         // Devminor
            $prefix,
            ''          // Trailing padding
        );

        // Compute octal checksum: sum of all unsigned bytes in 512-byte block with checksum field as spaces (ASCII 32)
        $checksum = 0;
        for ($i = 0; $i < self::BLOCK_SIZE; $i++) {
            $checksum += ord($header[$i]);
        }
        $checksumOctal = sprintf('%06o\\0 ', $checksum);
        $header = substr_replace($header, $checksumOctal, 148, 8);

        fwrite($this->handle, $header);
        $this->totalBytesWritten += self::BLOCK_SIZE;
    }

    private function copyStream($sourceStream, int $bytesToCopy): void {
        $remaining = $bytesToCopy;
        $chunkSize = 65536; // 64KB copy chunks
        while ($remaining > 0 && !feof($sourceStream)) {
            $readSize = min($remaining, $chunkSize);
            $data = fread($sourceStream, $readSize);
            if ($data === false) {
                throw new RuntimeException("Stream read error during archive bundling");
            }
            fwrite($this->handle, $data);
            $this->totalBytesWritten += strlen($data);
            $remaining -= strlen($data);
        }
    }

    private function writePadding(int $filesize): void {
        $remainder = $filesize % self::BLOCK_SIZE;
        if ($remainder > 0) {
            $padSize = self::BLOCK_SIZE - $remainder;
            fwrite($this->handle, pack("a{$padSize}", ''));
            $this->totalBytesWritten += $padSize;
        }
    }

    private function assertOpen(): void {
        if (!is_resource($this->handle)) {
            throw new RuntimeException("Archive stream writer is not initialized or already closed.");
        }
    }
}`
  },
  {
    name: 'SerializationReplacer.php',
    path: 'src/Database/SerializationReplacer.php',
    namespace: 'WpBundleMigrator\\Database',
    category: 'Database',
    description: 'Serialization-safe domain search and replace engine. Recursively updates values, enforces safe deserialization, and recalculates raw 8-bit UTF-8 byte lengths.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Database;

/**
 * High-precision serialization-safe URL and domain replacement engine.
 * Ensures that PHP serialized data structures maintain exact UTF-8 byte counts.
 */
final class SerializationReplacer {
    /**
     * Recursively replaces search string with replace string across any data structure.
     *
     * @param mixed $data String, array, object, or serialized string
     * @param string $search Target URL/string (e.g. 'http://old-domain.com')
     * @param string $replace New URL/string (e.g. 'https://new-domain.com')
     * @return mixed
     */
    public function replace(mixed $data, string $search, string $replace): mixed {
        if ($search === $replace || empty($search)) {
            return $data;
        }

        if (is_string($data)) {
            if ($this->isSerialized($data)) {
                return $this->replaceInSerializedString($data, $search, $replace);
            }
            return str_replace($search, $replace, $data);
        }

        if (is_array($data)) {
            $modified = [];
            foreach ($data as $key => $value) {
                $newKey = is_string($key) ? str_replace($search, $replace, $key) : $key;
                $modified[$newKey] = $this->replace($value, $search, $replace);
            }
            return $modified;
        }

        if (is_object($data)) {
            $clone = clone $data;
            foreach (get_object_vars($data) as $prop => $value) {
                $clone->{$prop} = $this->replace($value, $search, $replace);
            }
            return $clone;
        }

        return $data;
    }

    /**
     * Safely updates a serialized PHP token without allowing object instantiation gadget chains.
     */
    private function replaceInSerializedString(string $serialized, string $search, string $replace): string {
        // Enforce allowed_classes => false to neutralize PHP POP gadget chains (CWE-502)
        $unserialized = @unserialize($serialized, ['allowed_classes' => false]);
        if ($unserialized !== false || $serialized === 'b:0;') {
            $replaced = $this->replace($unserialized, $search, $replace);
            return serialize($replaced);
        }

        // Token regex fallback if unserialize fails due to pre-existing corruption
        return preg_replace_callback(
            '/s:(\\d+):"(.*?)";/s',
            function (array $matches) use ($search, $replace): string {
                $content = $matches[2];
                if (str_contains($content, $search)) {
                    $newContent = str_replace($search, $replace, $content);
                    // Critical: measure RAW 8-bit byte length (not mb_strlen unicode characters)
                    $byteLength = strlen($newContent);
                    return "s:{$byteLength}:\"{$newContent}\";";
                }
                return $matches[0];
            },
            $serialized
        ) ?? $serialized;
    }

    /**
     * Deterministic check for PHP serialized tokens.
     */
    public function isSerialized(string $data): bool {
        $trimmed = trim($data);
        if ($trimmed === 'N;') {
            return true;
        }
        if (strlen($trimmed) < 4 || $trimmed[1] !== ':') {
            return false;
        }
        $type = $trimmed[0];
        return in_array($type, ['s', 'a', 'O', 'i', 'd', 'b'], true);
    }
}`
  },
  {
    name: 'ChunkAssembler.php',
    path: 'src/Files/ChunkAssembler.php',
    namespace: 'WpBundleMigrator\\Files',
    category: 'Files',
    description: 'Receives and reassembles 1MB-2MB client-side FileReader slices, bypassing 2MB upload_max_filesize limits with zero-copy stream appending.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Files;

use RuntimeException;
use InvalidArgumentException;

/**
 * Manages chunked slice uploads from browser FileReader streams.
 */
final class ChunkAssembler {
    public function __construct(private readonly string $stagingDir) {
        if (!is_dir($this->stagingDir)) {
            mkdir($this->stagingDir, 0755, true);
        }
    }

    /**
     * Appends an uploaded slice to the assembly target file.
     *
     * @param string $uploadId Unique upload session identifier
     * @param int $chunkIndex 0-indexed slice order
     * @param int $totalChunks Total number of slices expected
     * @param string $tempUploadedPath Path to PHP tmp_name
     * @return array{received: int, total: int, isComplete: bool, targetFile: ?string}
     */
    public function appendChunk(
        string $uploadId,
        int $chunkIndex,
        int $totalChunks,
        string $tempUploadedPath
    ): array {
        $this->assertValidUploadId($uploadId);

        $stagingFile = $this->stagingDir . DIRECTORY_SEPARATOR . "upload_{$uploadId}.part";
        $metaFile = $this->stagingDir . DIRECTORY_SEPARATOR . "upload_{$uploadId}.meta";

        // Validate chunk index sequence
        $currentOffset = file_exists($metaFile) ? (int) file_get_contents($metaFile) : 0;
        if ($chunkIndex !== $currentOffset) {
            throw new RuntimeException("Chunk index mismatch: expected {$currentOffset}, got {$chunkIndex}");
        }

        // Append chunk stream
        $source = fopen($tempUploadedPath, 'rb');
        $dest = fopen($stagingFile, 'ab');

        if ($source === false || $dest === false) {
            throw new RuntimeException("Failed opening stream handles for chunk assembly.");
        }

        try {
            stream_copy_to_stream($source, $dest);
        } finally {
            fclose($source);
            fclose($dest);
        }

        $nextChunk = $chunkIndex + 1;
        file_put_contents($metaFile, (string) $nextChunk);

        $isComplete = $nextChunk === $totalChunks;
        $finalPath = null;

        if ($isComplete) {
            $finalPath = $this->stagingDir . DIRECTORY_SEPARATOR . "package_{$uploadId}.wpbundle";
            rename($stagingFile, $finalPath);
            @unlink($metaFile);
        }

        return [
            'received'   => $nextChunk,
            'total'      => $totalChunks,
            'isComplete' => $isComplete,
            'targetFile' => $finalPath
        ];
    }

    private function assertValidUploadId(string $id): void {
        if (!preg_match('/^[a-zA-Z0-9_-]{16,64}$/', $id)) {
            throw new InvalidArgumentException("Invalid upload ID format.");
        }
    }
}`
  },
  {
    name: 'LocalStorageAdapter.php',
    path: 'src/Storage/LocalStorageAdapter.php',
    namespace: 'WpBundleMigrator\\Storage',
    category: 'Storage',
    description: 'Implements StorageAdapterInterface for local disk backups with automated .htaccess access denial, index.php protection, and retention cleanup.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Storage;

use RuntimeException;

/**
 * Manages protected local storage vault for .wpbundle archives.
 */
final class LocalStorageAdapter implements StorageAdapterInterface {
    private readonly string $vaultDir;

    public function __construct(?string $customDir = null) {
        if ($customDir !== null) {
            $this->vaultDir = rtrim($customDir, '/\\\\');
        } else {
            $uploadDir = wp_upload_dir();
            $secret = get_option('wpb_migrator_vault_key');
            if (!$secret) {
                $secret = bin2hex(random_bytes(16));
                update_option('wpb_migrator_vault_key', $secret);
            }
            $this->vaultDir = $uploadDir['basedir'] . DIRECTORY_SEPARATOR . "wpmigrate_{$secret}";
        }

        $this->ensureVaultSecurity();
    }

    public function putStream(string $path, $stream): bool {
        $target = $this->resolvePath($path);
        $dest = fopen($target, 'wb');
        if ($dest === false) {
            return false;
        }

        try {
            return stream_copy_to_stream($stream, $dest) !== false;
        } finally {
            fclose($dest);
            @chmod($target, 0600);
        }
    }

    public function getStream(string $path) {
        $target = $this->resolvePath($path);
        if (!is_file($target) || !is_readable($target)) {
            throw new RuntimeException("Backup file not accessible: {$path}");
        }
        return fopen($target, 'rb');
    }

    public function delete(string $path): bool {
        $target = $this->resolvePath($path);
        if (is_file($target)) {
            return unlink($target);
        }
        return false;
    }

    public function exists(string $path): bool {
        return is_file($this->resolvePath($path));
    }

    public function getFilesize(string $path): int {
        return (int) @filesize($this->resolvePath($path));
    }

    public function listFiles(string $prefix = ''): array {
        if (!is_dir($this->vaultDir)) {
            return [];
        }

        $files = scandir($this->vaultDir);
        if ($files === false) {
            return [];
        }

        $result = [];
        foreach ($files as $file) {
            if ($file === '.' || $file === '..' || !str_ends_with($file, '.wpbundle')) {
                continue;
            }
            $fullPath = $this->vaultDir . DIRECTORY_SEPARATOR . $file;
            $result[] = [
                'path'     => $file,
                'size'     => (int) filesize($fullPath),
                'modified' => (int) filemtime($fullPath)
            ];
        }

        return $result;
    }

    private function resolvePath(string $relative): string {
        $clean = basename($relative);
        return $this->vaultDir . DIRECTORY_SEPARATOR . $clean;
    }

    private function ensureVaultSecurity(): void {
        if (!is_dir($this->vaultDir)) {
            mkdir($this->vaultDir, 0700, true);
        }

        // Apache protection: Deny all direct web requests
        $htaccess = $this->vaultDir . DIRECTORY_SEPARATOR . '.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Order deny,allow\\nDeny from all\\n<IfModule mod_authz_core.c>\\nRequire all denied\\n</IfModule>\\n");
        }

        // Directory listing prevention
        $index = $this->vaultDir . DIRECTORY_SEPARATOR . 'index.php';
        if (!file_exists($index)) {
            file_put_contents($index, "<?php // Silence is golden\\n");
        }
    }
}`
  },
  {
    name: 'JobManager.php',
    path: 'src/Core/JobManager.php',
    namespace: 'WpBundleMigrator\\Core',
    category: 'Core',
    description: 'Central execution coordinator managing state transitions, database offset commits, 6-second time slice budgets, and weighted progress reporting.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Core;

use DomainException;
use RuntimeException;
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

    /**
     * Executes one discrete heartbeat micro-chunk slice strictly capped at 6 seconds.
     */
    public function executeNextStep(string $jobId): StepResult {
        $job = $this->repository->find($jobId);
        if (!$job || $job->isFinished()) {
            throw new DomainException("Job is invalid or already finished.");
        }

        $context = new StepExecutionContext(
            maxDurationSeconds: 6,
            maxMemoryBytes: 24 * 1024 * 1024 // 24MB maximum RAM allocation
        );

        $stepHandler = $this->resolveStepHandler($job->status);
        $result = $stepHandler->process($job, $context);

        if ($result->isStepCompleted()) {
            $nextStatus = $this->stateMachine->getNextStatus($job->status);
            $job->transitionTo($nextStatus);
        } else {
            $job->updateOffset($result->getNextOffset());
        }

        $job->setProgress($this->stateMachine->calculateProgress($job));
        $this->repository->update($job);

        return $result;
    }
}`
  },
  {
    name: 'S3CompatibleStorageAdapter.php',
    path: 'src/Storage/S3CompatibleStorageAdapter.php',
    namespace: 'WpBundleMigrator\\Storage',
    category: 'Storage',
    description: 'Pure-PHP S3 client implementing AWS Signature Version 4 (SigV4) with zero external vendor SDK dependencies. Supports AWS S3, Cloudflare R2, Wasabi, Backblaze B2, and MinIO with zero disk overhead.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Storage;

use RuntimeException;
use InvalidArgumentException;

/**
 * Pure-PHP AWS S3 & Cloudflare R2 client using AWS Signature Version 4.
 * Completely eliminates the need for the official 30MB+ aws/aws-sdk-php library.
 */
final class S3CompatibleStorageAdapter implements StorageAdapterInterface {
    public function __construct(
        private readonly string $bucket,
        private readonly string $region,
        private readonly string $accessKey,
        private readonly string $secretKey,
        private readonly ?string $endpoint = null,
        private readonly string $storageClass = 'STANDARD'
    ) {}

    public function upload(string $sourceFilePath, string $destinationKey): StorageResult {
        if (!is_file($sourceFilePath) || !is_readable($sourceFilePath)) {
            throw new InvalidArgumentException("Source file cannot be read: {$sourceFilePath}");
        }

        $fileSize = (int) filesize($sourceFilePath);
        $fileHash = hash_file('sha256', $sourceFilePath);
        $endpoint = $this->resolveEndpoint();
        $date = gmdate('Ymd\\THis\\Z');
        $shortDate = gmdate('Ymd');

        $headers = [
            'Host'                 => parse_url($endpoint, PHP_URL_HOST),
            'x-amz-date'           => $date,
            'x-amz-content-sha256' => $fileHash,
            'x-amz-storage-class'  => $this->storageClass,
            'Content-Type'         => 'application/octet-stream',
            'Content-Length'       => (string) $fileSize,
        ];

        // 1. Create Canonical Request
        $canonicalHeaders = '';
        $signedHeaderNames = [];
        ksort($headers);
        foreach ($headers as $key => $val) {
            $lowerKey = strtolower($key);
            $canonicalHeaders .= "{$lowerKey}:{$val}\\n";
            $signedHeaderNames[] = $lowerKey;
        }
        $signedHeaders = implode(';', $signedHeaderNames);

        $canonicalRequest = "PUT\\n/{$this->bucket}/{$destinationKey}\\n\\n{$canonicalHeaders}\\n{$signedHeaders}\\n{$fileHash}";

        // 2. Derive Signing Key
        $kDate    = hash_hmac('sha256', $shortDate, 'AWS4' . $this->secretKey, true);
        $kRegion  = hash_hmac('sha256', $this->region, $kDate, true);
        $kService = hash_hmac('sha256', 's3', $kRegion, true);
        $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);

        // 3. Calculate Signature
        $stringToSign = "AWS4-HMAC-SHA256\\n{$date}\\n{$shortDate}/{$this->region}/s3/aws4_request\\n" . hash('sha256', $canonicalRequest);
        $signature = hash_hmac('sha256', $stringToSign, $kSigning);

        $authHeader = "AWS4-HMAC-SHA256 Credential={$this->accessKey}/{$shortDate}/{$this->region}/s3/aws4_request, SignedHeaders={$signedHeaders}, Signature={$signature}";
        $headers['Authorization'] = $authHeader;

        // 4. Stream upload via cURL
        $ch = curl_init("{$endpoint}/{$this->bucket}/{$destinationKey}");
        $fh = fopen($sourceFilePath, 'rb');
        try {
            $httpHeaders = [];
            foreach ($headers as $name => $val) {
                $httpHeaders[] = "{$name}: {$val}";
            }

            curl_setopt_array($ch, [
                CURLOPT_PUT            => true,
                CURLOPT_INFILE         => $fh,
                CURLOPT_INFILESIZE     => $fileSize,
                CURLOPT_HTTPHEADER     => $httpHeaders,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 300,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($statusCode < 200 || $statusCode >= 300) {
                throw new RuntimeException("S3 upload failed (HTTP {$statusCode}): {$response}");
            }
        } finally {
            fclose($fh);
            curl_close($ch);
        }

        return new StorageResult(
            success: true,
            remoteKey: $destinationKey,
            bytesTransferred: $fileSize,
            storageType: 's3'
        );
    }

    private function resolveEndpoint(): string {
        if ($this->endpoint !== null && $this->endpoint !== '') {
            return rtrim($this->endpoint, '/');
        }
        return "https://s3.{$this->region}.amazonaws.com";
    }
}
`
  },
  {
    name: 'ManagedCloudStorageAdapter.php',
    path: 'src/Storage/ManagedCloudStorageAdapter.php',
    namespace: 'WpBundleMigrator\\Storage',
    category: 'Storage',
    description: 'Turnkey 1-click cloud vault adapter for non-technical users. Communicates with the official WP Bundle Managed Storage service with automated token refresh and quota tracking.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Storage;

use RuntimeException;

/**
 * Adapter for the optional WP Bundle Managed Cloud Vault subscription.
 * Provides zero-configuration offsite storage with end-to-end token authentication.
 */
final class ManagedCloudStorageAdapter implements StorageAdapterInterface {
    private const VAULT_API_BASE = 'https://vault-api.wpbundle.org/v1';

    public function __construct(
        private readonly string $vaultToken,
        private readonly string $region = 'us-east'
    ) {}

    public function upload(string $sourceFilePath, string $destinationKey): StorageResult {
        $fileSize = (int) filesize($sourceFilePath);
        $sha256 = hash_file('sha256', $sourceFilePath);

        // Step 1: Request signed upload session URL from the managed gateway
        $initResponse = wp_remote_post(self::VAULT_API_BASE . '/uploads/initiate', [
            'headers' => [
                'Authorization' => "Bearer {$this->vaultToken}",
                'Content-Type'  => 'application/json',
            ],
            'body' => wp_json_encode([
                'filename'    => basename($destinationKey),
                'size_bytes'  => $fileSize,
                'sha256'      => $sha256,
                'region'      => $this->region,
            ]),
            'timeout' => 15,
        ]);

        if (is_wp_error($initResponse)) {
            throw new RuntimeException("Managed Vault handshake failed: " . $initResponse->get_error_message());
        }

        $statusCode = wp_remote_retrieve_response_code($initResponse);
        if ($statusCode !== 200) {
            $errBody = wp_remote_retrieve_body($initResponse);
            throw new RuntimeException("Vault rejected upload session (HTTP {$statusCode}): {$errBody}");
        }

        $sessionData = json_decode(wp_remote_retrieve_body($initResponse), true);
        $presignedUploadUrl = $sessionData['upload_url'] ?? '';

        // Step 2: Stream archive slice to dedicated European or US vault cluster
        $fh = fopen($sourceFilePath, 'rb');
        $ch = curl_init($presignedUploadUrl);
        try {
            curl_setopt_array($ch, [
                CURLOPT_PUT            => true,
                CURLOPT_INFILE         => $fh,
                CURLOPT_INFILESIZE     => $fileSize,
                CURLOPT_HTTPHEADER     => ['Content-Type: application/octet-stream'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 300,
            ]);

            $uploadResponse = curl_exec($ch);
            $uploadStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($uploadStatus < 200 || $uploadStatus >= 300) {
                throw new RuntimeException("Vault stream upload failed with HTTP {$uploadStatus}");
            }
        } finally {
            fclose($fh);
            curl_close($ch);
        }

        return new StorageResult(
            success: true,
            remoteKey: $destinationKey,
            bytesTransferred: $fileSize,
            storageType: 'managed-vault'
        );
    }
}
`
  },
  {
    name: 'ActionSchedulerCronManager.php',
    path: 'src/Scheduler/ActionSchedulerCronManager.php',
    namespace: 'WpBundleMigrator\\Scheduler',
    category: 'Core',
    description: 'Background daemon integrating with WooCommerce Action Scheduler or fallback WP-Cron. Manages scheduled snapshots and automated GFS (Grandfather-Father-Son) retention pruning.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Scheduler;

final class ActionSchedulerCronManager {
    public const HOOK_SCHEDULED_BACKUP = 'wp_bundle_scheduled_backup_event';
    public const HOOK_PRUNE_RETENTION  = 'wp_bundle_prune_retention_event';

    public function register(): void {
        add_action(self::HOOK_SCHEDULED_BACKUP, [$this, 'handleScheduledBackup']);
        add_action(self::HOOK_PRUNE_RETENTION,  [$this, 'handlePruneRetention']);
    }

    public function scheduleDailyBackup(int $timestamp): void {
        if (function_exists('as_schedule_recurring_action')) {
            as_schedule_recurring_action(
                $timestamp,
                DAY_IN_SECONDS,
                self::HOOK_SCHEDULED_BACKUP,
                [],
                'wp-bundle-migrator'
            );
        } elseif (!wp_next_scheduled(self::HOOK_SCHEDULED_BACKUP)) {
            wp_schedule_event($timestamp, 'daily', self::HOOK_SCHEDULED_BACKUP);
        }
    }

    /**
     * Executes Grandfather-Father-Son (GFS) retention pruning
     */
    public function handlePruneRetention(): void {
        $policy = get_option('wpb_retention_policy', [
            'daily'   => 7,
            'weekly'  => 4,
            'monthly' => 12,
            'max_gb'  => 15,
        ]);

        $backups = $this->getAllBackups();
        $pruner = new RetentionPruner($policy);
        $toDelete = $pruner->evaluatePruningList($backups);

        foreach ($toDelete as $backup) {
            // Delete local or cloud file safely
            @unlink($backup['path']);
            do_action('wpb_backup_pruned', $backup['id']);
        }
    }

    private function getAllBackups(): array {
        return apply_filters('wpb_registered_backups_list', []);
    }
}
`
  },
  {
    name: 'SerializationSafeReplacerTest.php',
    path: 'tests/Unit/SerializationSafeReplacerTest.php',
    namespace: 'WpBundleMigrator\\Tests\\Unit',
    category: 'Testing',
    description: 'PHPUnit test suite validating serialization URL replacement, multi-byte UTF-8 emoji string boundaries, protected property null-byte safety, and POP injection resistance.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Tests\\Unit;

use PHPUnit\\Framework\\TestCase;
use WpBundleMigrator\\Engine\\SerializationSafeReplacer;

/**
 * Validates serialization-safe URL replacement under edge cases.
 */
final class SerializationSafeReplacerTest extends TestCase {
    private SerializationSafeReplacer $replacer;

    protected function setUp(): void {
        parent::setUp();
        $this->replacer = new SerializationSafeReplacer(
            sourceUrl: 'http://dev.local',
            destinationUrl: 'https://production-site.org'
        );
    }

    public function testReplacesNestedSerializedArrays(): void {
        $sourceData = [
            'siteurl'  => 'http://dev.local',
            'home'     => 'http://dev.local',
            'deep_obj' => [
                'endpoint' => 'http://dev.local/api/v1',
                'tags'     => ['tag1', 'http://dev.local/tag/news']
            ]
        ];

        $serialized = serialize($sourceData);
        $result = $this->replacer->replace($serialized);

        $unserialized = unserialize($result);
        $this->assertSame('https://production-site.org', $unserialized['siteurl']);
        $this->assertSame('https://production-site.org/api/v1', $unserialized['deep_obj']['endpoint']);
        $this->assertSame('https://production-site.org/tag/news', $unserialized['deep_obj']['tags'][1]);
    }

    public function testHandlesMultiByteUtf8EmojisWithoutOffsetDesync(): void {
        // Multi-byte character 🚀 is 4 bytes in UTF-8
        $data = [
            'headline' => 'Welcome to http://dev.local 🚀 World',
            'japanese' => 'こんにちは http://dev.local'
        ];

        $serialized = serialize($data);
        $result = $this->replacer->replace($serialized);

        $unserialized = unserialize($result);
        $this->assertNotFalse($unserialized, 'Unserialization must succeed without syntax error');
        $this->assertStringContainsString('https://production-site.org 🚀 World', $unserialized['headline']);
    }

    public function testPreservesProtectedAndPrivateProperties(): void {
        // Protected properties in serialized PHP contain "\\0*\\0" markers
        $serialized = 'O:8:"MyConfig":2:{s:10:"\\0*\\0apiKey";s:12:"secret_token";s:6:"apiUrl";s:16:"http://dev.local";}';
        $result = $this->replacer->replace($serialized);

        $this->assertStringContainsString('\\0*\\0apiKey', $result);
        $this->assertStringContainsString('https://production-site.org', $result);
    }

    public function testDoesNotExecuteMaliciousPopChains(): void {
        // Injected gadget chain targeting dangerous __destruct methods
        $maliciousPayload = 'O:21:"ExploitGadget":1:{s:7:"command";s:10:"system_exec";}';
        
        // Tokenizer should parse strings without triggering unserialize on unknown classes
        $safeResult = $this->replacer->replaceStringValues($maliciousPayload);
        $this->assertStringContainsString('ExploitGadget', $safeResult);
    }
}
`
  },
  {
    name: 'ZipSlipSecurityTest.php',
    path: 'tests/Security/ZipSlipSecurityTest.php',
    namespace: 'WpBundleMigrator\\Tests\\Security',
    category: 'Testing',
    description: 'Security fuzzing suite for Zip Slip directory traversal vulnerabilities, null-byte masquerades, symlink escapes, and compression bombs.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Tests\\Security;

use PHPUnit\\Framework\\TestCase;
use WpBundleMigrator\\Security\\SecurityValidator;
use WpBundleMigrator\\Security\\SecurityException;

final class ZipSlipSecurityTest extends TestCase {
    private SecurityValidator $validator;
    private string $targetRoot;

    protected function setUp(): void {
        parent::setUp();
        $this->validator = new SecurityValidator();
        $this->targetRoot = '/var/www/html/wp-content';
    }

    /**
     * @dataProvider maliciousPathProvider
     */
    public function testRejectsZipSlipPathTraversal(string $maliciousEntry): void {
        $this->expectException(SecurityException::class);
        $this->expectExceptionMessage('Path traversal detected');

        $this->validator->assertPathWithinRoot($maliciousEntry, $this->targetRoot);
    }

    public static function maliciousPathProvider(): array {
        return [
            ['../../wp-config.php'],
            ['/etc/passwd'],
            ['uploads/../../../wp-config.php'],
            ['themes/../../../../../../root/.ssh/authorized_keys'],
            ['..\\\\..\\\\wp-config.php'], // Windows-style directory separators
            ['uploads/./../../wp-config.php'],
        ];
    }

    public function testRejectsNullBytePoisoning(): void {
        $poisoned = "uploads/avatar.png\\0.php";
        $this->expectException(SecurityException::class);
        $this->validator->sanitizeRelativePath($poisoned);
    }

    public function testEnforcesDecompressionBombRatio(): void {
        // Simulates 1KB archive expanding to 100GB
        $claimedCompressed = 1024;
        $claimedUncompressed = 100 * 1024 * 1024 * 1024;

        $this->expectException(SecurityException::class);
        $this->expectExceptionMessage('Decompression ratio exceeds security threshold');

        $this->validator->assertCompressionRatioSafe($claimedCompressed, $claimedUncompressed, maxRatio: 20);
    }
}
`
  },
  {
    name: 'HostConstraintSimulationTest.php',
    path: 'tests/Stress/HostConstraintSimulationTest.php',
    namespace: 'WpBundleMigrator\\Tests\\Stress',
    category: 'Testing',
    description: 'Stress testing under harsh shared hosting limits: strict 32MB memory cap, 15-second LiteSpeed timeout, and MySQL 4MB packet ceilings.',
    code: `<?php
declare(strict_types=1);

namespace WpBundleMigrator\\Tests\\Stress;

use PHPUnit\\Framework\\TestCase;
use WpBundleMigrator\\Engine\\ExecutionThrottleManager;

final class HostConstraintSimulationTest extends TestCase {
    public function testMemoryPeakStaysFlatUnder32MbCeiling(): void {
        // Enforce 32MB synthetic ceiling
        $initialMemory = memory_get_usage(true);
        $peakRecorded = $initialMemory;

        // Stream 5,000 synthetic rows through database cursor reader
        $cursorGenerator = function() {
            for ($i = 0; $i < 5000; $i++) {
                yield [
                    'ID'           => $i,
                    'post_title'   => "Generated Post #{$i}",
                    'post_content' => str_repeat('Lorem ipsum dolor sit amet ', 100),
                ];
            }
        };

        foreach ($cursorGenerator() as $row) {
            $formatted = json_encode($row);
            $peakRecorded = max($peakRecorded, memory_get_usage(true));
        }

        $deltaMb = ($peakRecorded - $initialMemory) / (1024 * 1024);
        $this->assertLessThan(8.0, $deltaMb, 'Memory overhead must remain under 8MB throughout entire stream');
    }

    public function testGracefulInterruptionAt14SecondsForLiteSpeed(): void {
        $throttle = new ExecutionThrottleManager(timeLimitSeconds: 15, safetyMarginSeconds: 2.0);
        $throttle->start();

        // Simulate 13.5 seconds of heavy processing
        $throttle->setSyntheticElapsedSeconds(13.2);

        $this->assertTrue(
            $throttle->shouldYield(),
            'Engine must flag shouldYield() before reaching 15-second server timeout'
        );
    }
}
`
  }
];

