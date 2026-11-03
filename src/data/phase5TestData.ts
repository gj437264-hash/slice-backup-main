import { TestCaseResult, BenchmarkScaleScenario, HostConstraintProfile, FuzzingPayloadItem } from '../types';

export const TEST_SUITE_RESULTS: TestCaseResult[] = [
  {
    id: 'tc-01',
    name: 'testComplexNestedSerializedArraysWithUrlReplacement',
    suite: 'Serialization',
    status: 'passed',
    durationMs: 4.2,
    assertionsCount: 14,
    memoryUsageKb: 142,
    description: 'Verifies recursive serialization URL replacement with multi-byte UTF-8 emojis (🚀, こんにちは) and recalculated string lengths.',
    codeSnippet: `$input = serialize([
    'siteurl' => 'http://dev.local/🚀',
    'nested'  => ['guid' => 'http://dev.local/posts/42']
]);
$replacer = new SerializationSafeReplacer('http://dev.local', 'https://production.com');
$result = $replacer->replace($input);
$this->assertSame(25, strlen(unserialize($result)['siteurl']));`
  },
  {
    id: 'tc-02',
    name: 'testProtectedAndPrivateObjectPropertyPreservation',
    suite: 'Serialization',
    status: 'passed',
    durationMs: 3.8,
    assertionsCount: 8,
    memoryUsageKb: 180,
    description: 'Ensures protected and private properties with null byte prefixes (\\0*\\0, \\0ClassName\\0) are cleanly preserved without deserialization execution.',
    codeSnippet: `$serialized = 'O:8:"MyPlugin":2:{s:10:"\\0*\\0api_key";s:16:"secret_live_key";s:8:"endpoint";s:20:"https://api.site.com";}';
$replaced = $replacer->replaceStringValues($serialized);
$this->assertStringContainsString('\\0*\\0api_key', $replaced);`
  },
  {
    id: 'tc-03',
    name: 'testMalformedSerializedStringGracefulFallback',
    suite: 'Serialization',
    status: 'passed',
    durationMs: 2.1,
    assertionsCount: 6,
    memoryUsageKb: 95,
    description: 'Validates that corrupted serialization strings (e.g. truncated length headers) log a warning rather than causing fatal PHP error 500.',
    codeSnippet: `$corrupted = 'a:2:{s:4:"name";s:10:"short";}'; // length mismatch
$res = $replacer->safeTokenize($corrupted);
$this->assertTrue($res->hasWarning());
$this->assertFalse($res->isFatal());`
  },
  {
    id: 'tc-04',
    name: 'testZipSlipPathTraversalRejection',
    suite: 'ZipSlip',
    status: 'passed',
    durationMs: 1.9,
    assertionsCount: 12,
    memoryUsageKb: 110,
    description: 'Verifies that archive entries containing directory traversal sequences (../../wp-config.php) are intercepted and rejected.',
    codeSnippet: `$maliciousEntry = '../../../../var/www/html/wp-config.php';
$this->expectException(SecurityException::class);
$this->expectExceptionMessage('Zip Slip path traversal blocked');
$extractor->assertPathWithinRoot($maliciousEntry, '/var/www/html/wp-content');`
  },
  {
    id: 'tc-05',
    name: 'testNullBytePoisoningRejection',
    suite: 'ZipSlip',
    status: 'passed',
    durationMs: 1.4,
    assertionsCount: 5,
    memoryUsageKb: 88,
    description: 'Rejects filenames with null-byte string termination attempts (e.g. image.jpg\\0.php).',
    codeSnippet: `$poisonedPath = 'uploads/2026/09/avatar.png' . chr(0) . '.php';
$this->expectException(SecurityException::class);
$extractor->validateFilename($poisonedPath);`
  },
  {
    id: 'tc-06',
    name: 'testAbsoluteSymlinkEscapeDetection',
    suite: 'ZipSlip',
    status: 'passed',
    durationMs: 2.6,
    assertionsCount: 7,
    memoryUsageKb: 130,
    description: 'Detects symlinks within archives pointing to absolute targets outside the WordPress web root (/etc/passwd, /root/.ssh).',
    codeSnippet: `$tarHeader = ['typeflag' => '2', 'linkname' => '/etc/shadow'];
$this->assertFalse($validator->isSafeSymlink($tarHeader, '/var/www/html'));`
  },
  {
    id: 'tc-07',
    name: 'testDatabaseCursorPaginationContinuity',
    suite: 'DatabaseCursor',
    status: 'passed',
    durationMs: 18.4,
    assertionsCount: 22,
    memoryUsageKb: 340,
    description: 'Tests primary key indexed cursor pagination (WHERE id > ? ORDER BY id ASC LIMIT 2000) across 50,000 synthetic rows with zero row loss.',
    codeSnippet: `$reader = new DatabaseCursorReader($wpdb, chunkSize: 2000);
$exportedRows = 0;
while ($chunk = $reader->fetchNextChunk('wp_posts', $lastId)) {
    $exportedRows += count($chunk->rows);
    $lastId = $chunk->lastPrimaryKey;
}
$this->assertSame(50000, $exportedRows);`
  },
  {
    id: 'tc-08',
    name: 'testDatabaseBinaryBlobPreservation',
    suite: 'DatabaseCursor',
    status: 'passed',
    durationMs: 6.5,
    assertionsCount: 9,
    memoryUsageKb: 512,
    description: 'Ensures raw binary images, encrypted session blobs, and hex payloads in MySQL columns remain uncorrupted during export/import.',
    codeSnippet: `$binaryData = random_bytes(1024 * 64); // 64KB raw bytes
$hexDump = $reader->formatSqlLiteral($binaryData, 'BLOB');
$this->assertStringStartsWith('0x', $hexDump);
$this->assertSame(bin2hex($binaryData), substr($hexDump, 2));`
  },
  {
    id: 'tc-09',
    name: 'testLiteSpeed15SecondTimeoutInterruptionAndResume',
    suite: 'HostConstraints',
    status: 'passed',
    durationMs: 8.9,
    assertionsCount: 11,
    memoryUsageKb: 210,
    description: 'Simulates a forced process kill at 14.8 seconds. State checkpoint is persisted; resumption seamlessly continues from exact offset.',
    codeSnippet: `$manager->setSyntheticTimeLimit(14.8);
$status = $manager->runBatchStep('export_files', $state);
$this->assertSame('interrupted_resumable', $status->code);
$this->assertGreaterThan(0, $status->checkpointOffset);`
  },
  {
    id: 'tc-10',
    name: 'testMemoryLimit32MbPeakRssRemainsConstant',
    suite: 'HostConstraints',
    status: 'passed',
    durationMs: 28.3,
    assertionsCount: 16,
    memoryUsageKb: 185,
    description: 'Streams a 500MB synthetic dataset under a forced 32MB php.ini ceiling. Peak RSS memory stays under 12.4MB throughout.',
    codeSnippet: `ini_set('memory_limit', '32M');
$peakMemory = 0;
$streamer->processLargeArchive('/tmp/synthetic_500mb.wpbundle', function() use (&$peakMemory) {
    $peakMemory = max($peakMemory, memory_get_peak_usage(true));
});
$this->assertLessThan(14 * 1024 * 1024, $peakMemory);`
  },
  {
    id: 'tc-11',
    name: 'testAes256GcmTamperedCiphertextThrowsAuthenticationException',
    suite: 'Crypto',
    status: 'passed',
    durationMs: 5.1,
    assertionsCount: 8,
    memoryUsageKb: 160,
    description: 'Flips a single bit in an encrypted .wpbundle archive. AEAD tag validation rejects execution BEFORE any archive extraction starts.',
    codeSnippet: `$encrypted = $cipher->encryptStream($sourceFh, $destFh, 'MasterPass123!');
// Flip single bit in encrypted payload block
$tamperedFh = $this->flipBitInFile($destFh, byteOffset: 256);
$this->expectException(CryptoAuthenticationException::class);
$cipher->decryptStream($tamperedFh, $outFh, 'MasterPass123!');`
  },
  {
    id: 'tc-12',
    name: 'testPbkdf2KeyDerivation100kIterations',
    suite: 'Crypto',
    status: 'passed',
    durationMs: 14.7,
    assertionsCount: 6,
    memoryUsageKb: 90,
    description: 'Validates 100,000 iterations PBKDF2-SHA256 key derivation consistency with 16-byte cryptographically secure salt.',
    codeSnippet: `$key1 = hash_pbkdf2('sha256', 'Pass', $salt, 100000, 32, true);
$key2 = hash_pbkdf2('sha256', 'Pass', $salt, 100000, 32, true);
$this->assertSame(32, strlen($key1));
$this->assertSame($key1, $key2);`
  },
  {
    id: 'tc-13',
    name: 'testChunkSha256SliceIntegrityVerification',
    suite: 'ChunkIntegrity',
    status: 'passed',
    durationMs: 9.4,
    assertionsCount: 15,
    memoryUsageKb: 280,
    description: 'Verifies rolling SHA-256 chunk hashes during multi-part streaming uploads. Corrupted chunk is detected and re-requested.',
    codeSnippet: `$chunk = new UploadChunk(sliceIndex: 3, rawBytes: $data, clientHash: $clientSha);
$serverSha = hash('sha256', $data);
$this->assertSame($clientSha, $serverSha);
$this->assertTrue($chunk->verifyIntegrity());`
  },
  {
    id: 'tc-14',
    name: 'testDroppedChunkNetworkRetryMechanism',
    suite: 'ChunkIntegrity',
    status: 'passed',
    durationMs: 11.2,
    assertionsCount: 10,
    memoryUsageKb: 190,
    description: 'Simulates network socket disconnect on chunk #8. Client initiates exponential backoff (500ms, 1500ms) and recovers cleanly.',
    codeSnippet: `$uploader->setMockNetworkFailureAt(chunkIndex: 8, failCount: 2);
$result = $uploader->uploadWithRetry('/tmp/archive.wpbundle');
$this->assertTrue($result->isSuccess());
$this->assertSame(2, $result->totalRetries);`
  },
  {
    id: 'tc-15',
    name: 'testMultisiteSubsitePrefixRemapping',
    suite: 'DatabaseCursor',
    status: 'passed',
    durationMs: 12.0,
    assertionsCount: 18,
    memoryUsageKb: 310,
    description: 'Tests extraction of subsite ID 3: wp_3_posts -> wp_posts, wp_3_options -> wp_options, and isolates wp_3_capabilities.',
    codeSnippet: `$extractor = new MultisiteSubsiteExtractor($wpdb, blogId: 3);
$sqlStatements = $extractor->generateStandaloneTableSql();
$this->assertStringContainsString('CREATE TABLE \`wp_posts\`', $sqlStatements);
$this->assertStringNotContainsString('CREATE TABLE \`wp_3_posts\`', $sqlStatements);`
  },
  {
    id: 'tc-16',
    name: 'testCorruptedZipTrailerRecovery',
    suite: 'ChunkIntegrity',
    status: 'passed',
    durationMs: 7.6,
    assertionsCount: 8,
    memoryUsageKb: 220,
    description: 'Validates that truncated archive trailers trigger clean exception handlers with precise recovery suggestions.',
    codeSnippet: `$corruptedArchive = $this->createTruncatedBundle(removeBytes: 512);
$this->expectException(CorruptArchiveException::class);
$this->expectExceptionMessage('Invalid bundle footer signature');
$reader->validateBundleStructure($corruptedArchive);`
  }
];

export const BENCHMARK_SCALE_SCENARIOS: BenchmarkScaleScenario[] = [
  {
    id: 'scale-100mb',
    label: '100 MB',
    siteType: 'Starter Blog / Portfolio',
    totalSizeBytes: 104857600,
    dbSizeBytes: 15728640, // 15MB
    mediaSizeBytes: 89128960, // 85MB
    tableCount: 28,
    fileCount: 2450,
    postsOrOrdersCount: 2100,
    recommendedChunkSizeMb: 5,
    description: 'Standard informational site with basic plugins, Contact Form 7, and ~2k media uploads.'
  },
  {
    id: 'scale-1gb',
    label: '1 GB',
    siteType: 'WooCommerce Boutique Store',
    totalSizeBytes: 1073741824,
    dbSizeBytes: 146800640, // 140MB
    mediaSizeBytes: 926941184, // 884MB
    tableCount: 74,
    fileCount: 14200,
    postsOrOrdersCount: 18500,
    recommendedChunkSizeMb: 8,
    description: 'Active online store with WooCommerce orders, customer metadata, variations, and catalog images.'
  },
  {
    id: 'scale-5gb',
    label: '5 GB',
    siteType: 'High-Traffic Publisher / Media Magazine',
    totalSizeBytes: 5368709120,
    dbSizeBytes: 629145600, // 600MB
    mediaSizeBytes: 4739563520, // 4.4GB
    tableCount: 112,
    fileCount: 48900,
    postsOrOrdersCount: 85000,
    recommendedChunkSizeMb: 10,
    description: 'Editorial magazine with tens of thousands of articles, Yoast SEO indices, comments, and CDN thumbnails.'
  },
  {
    id: 'scale-25gb',
    label: '25 GB',
    siteType: 'Enterprise B2B / High-Volume eCommerce',
    totalSizeBytes: 26843545600,
    dbSizeBytes: 3435973836, // 3.2GB
    mediaSizeBytes: 23407571764, // 21.8GB
    tableCount: 185,
    fileCount: 185000,
    postsOrOrdersCount: 420000,
    recommendedChunkSizeMb: 15,
    description: 'Massive enterprise catalog with custom post types, subscriptions, order line items, and audit logs.'
  },
  {
    id: 'scale-100gb',
    label: '100 GB+',
    siteType: 'Digital Agency Multisite Network / Video Vault',
    totalSizeBytes: 107374182400,
    dbSizeBytes: 12884901888, // 12GB
    mediaSizeBytes: 94489280512, // 88GB
    tableCount: 450,
    fileCount: 780000,
    postsOrOrdersCount: 1650000,
    recommendedChunkSizeMb: 20,
    description: 'Extreme scale test: 50+ network subsites, multi-gigabyte media libraries, and huge database indices.'
  }
];

export const HOST_CONSTRAINT_PROFILES: HostConstraintProfile[] = [
  {
    id: 'shared-cpanel',
    name: 'Shared cPanel (GoDaddy / Bluehost)',
    badge: 'Worst Case',
    ramLimitMb: 32,
    executionTimeoutSec: 30,
    mysqlPacketMb: 4,
    iopsThrottle: 'Heavy Throttling',
    description: 'Severe RAM constraints (32MB ceiling) and restrictive 4MB MySQL packet limit with disk I/O throttling.'
  },
  {
    id: 'litespeed-hostinger',
    name: 'LiteSpeed Enterprise (Hostinger / Namecheap)',
    badge: 'Aggressive Timeout',
    ramLimitMb: 64,
    executionTimeoutSec: 15,
    mysqlPacketMb: 16,
    iopsThrottle: 'Heavy Throttling',
    description: 'Aggressive 15-second server-level connection termination. Requires rapid 6-second micro-batching.'
  },
  {
    id: 'cloudflare-edge',
    name: 'Cloudflare Pro / Business Reverse Proxy',
    badge: 'Edge 524 Limit',
    ramLimitMb: 128,
    executionTimeoutSec: 100,
    mysqlPacketMb: 32,
    iopsThrottle: 'Normal',
    description: 'Hard 100-second HTTP 524 Gateway Timeout limit on upstream connections. Chunk streaming prevents edge timeouts.'
  },
  {
    id: 'managed-vps',
    name: 'Managed VPS / Cloud (DigitalOcean / SpinupWP)',
    badge: 'Ideal Spec',
    ramLimitMb: 512,
    executionTimeoutSec: 300,
    mysqlPacketMb: 64,
    iopsThrottle: 'Normal',
    description: 'Modern NVMe SSD cloud environment with generous RAM and high bandwidth pipe.'
  }
];

export const FUZZING_PAYLOAD_ITEMS: FuzzingPayloadItem[] = [
  {
    id: 'fuzz-01',
    name: 'Classic Zip Slip Relative Path Traversal',
    category: 'Zip Slip',
    riskLevel: 'Critical',
    attackVector: 'Arbitrary File Overwrite / Remote Code Execution',
    payloadSample: '../../../../../../var/www/html/wp-config.php',
    expectedDefense: 'Path resolution comparison verifies canonical path strictly starts with target directory root.',
    defenseInterceptLayer: 'StreamExtractor::assertSafePath()'
  },
  {
    id: 'fuzz-02',
    name: 'Unicode Null-Byte Extension Masquerade',
    category: 'Directory Traversal',
    riskLevel: 'Critical',
    attackVector: 'Bypass extension whitelist to execute PHP',
    payloadSample: 'wp-content/uploads/exploit.jpg%00.php',
    expectedDefense: 'Rejects strings containing chr(0) or decoded null-byte characters prior to filesystem operations.',
    defenseInterceptLayer: 'SecurityValidator::sanitizeRelativePath()'
  },
  {
    id: 'fuzz-03',
    name: 'Serialized PHP Object Injection (POP Chain CWE-502)',
    category: 'Object Injection',
    riskLevel: 'Critical',
    attackVector: 'Execution of __destruct() / __wakeup() magic methods in installed plugins',
    payloadSample: 'O:21:"GuzzleHttp\\Psr7\\FnStream":2:{s:33:"\\0GuzzleHttp\\Psr7\\FnStream\\0methods";a:1:{s:5:"close";s:10:"phpinfo();"}}',
    expectedDefense: 'Pure string token parser processes values without calling PHP unserialize(), completely neutralizing POP gadget chains.',
    defenseInterceptLayer: 'SerializationSafeReplacer::replaceStringValues()'
  },
  {
    id: 'fuzz-04',
    name: 'Multi-byte UTF-8 Emoji Truncation Desync',
    category: 'Unicode Boundary',
    riskLevel: 'High',
    attackVector: 'Corrupting serialized array string byte counts to trigger site-wide fatal errors',
    payloadSample: 's:4:"🔥"; replaced with "https://prod.com/🎉"',
    expectedDefense: 'Uses mb_strlen($str, "8bit") to compute exact raw byte lengths rather than character counts.',
    defenseInterceptLayer: 'SerializationSafeReplacer::calculateByteLength()'
  },
  {
    id: 'fuzz-05',
    name: 'Ciphertext Single-Bit Flip Attack',
    category: 'Crypto Tampering',
    riskLevel: 'Critical',
    attackVector: 'Archive payload alteration or MITM transit injection',
    payloadSample: 'Injected 0xFF into byte offset 0x008E of AES-256-GCM stream',
    expectedDefense: 'AEAD 16-byte Poly1305/GCM authentication tag mismatch aborts execution immediately before file extraction.',
    defenseInterceptLayer: 'Aes256GcmEngine::decryptStream()'
  },
  {
    id: 'fuzz-06',
    name: 'Symlink Escape to /etc/passwd',
    category: 'Directory Traversal',
    riskLevel: 'High',
    attackVector: 'Arbitrary file disclosure via unprivileged archive upload',
    payloadSample: 'Tar header typeflag=2 (SYMTYPE) pointing to /etc/passwd',
    expectedDefense: 'All symlinks within archives are resolved using realpath(); any pointing outside destination root are discarded.',
    defenseInterceptLayer: 'TarReader::extractEntry()'
  },
  {
    id: 'fuzz-07',
    name: 'Database Non-Indexed Cursor Infinite Loop Injection',
    category: 'Cursor Exhaustion',
    riskLevel: 'Medium',
    attackVector: 'Denial of Service via database export memory runaway',
    payloadSample: 'Table with NULL primary keys or composite key non-monotonic sequence',
    expectedDefense: 'Cursor engine checks for primary key index; if absent, falls back to LIMIT offset batching with safety iteration counter.',
    defenseInterceptLayer: 'DatabaseCursorReader::resolvePrimaryKey()'
  },
  {
    id: 'fuzz-08',
    name: 'Malformed ZIP Central Directory Bomb',
    category: 'Zip Slip',
    riskLevel: 'High',
    attackVector: 'Archive bomb resulting in disk exhaustion (42.zip pattern)',
    payloadSample: 'Central directory entry claiming 1KB compressed expands to 500GB',
    expectedDefense: 'Enforces maximum uncompressed ratio (max 20x) and tracks cumulative extracted bytes against quota.',
    defenseInterceptLayer: 'ArchiveDecompressor::validateCompressionRatio()'
  }
];
