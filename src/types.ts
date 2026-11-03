export type ActiveTab = 
  | 'phase6-hardening'
  | 'security-audit-report'
  | 'static-analysis-wpcs'
  | 'developer-hooks-api'
  | 'production-release-builder'
  | 'phase5-benchmarks'
  | 'automated-test-runner'
  | 'site-benchmark-lab'
  | 'fuzzing-security-lab'
  | 'phase4-extensions'
  | 'cloud-storage-hub'
  | 'automation-retention'
  | 'cli-multisite'
  | 'phase3-mvp'
  | 'php-codebase'
  | 'chunk-upload-tester'
  | 'phase2-architecture'
  | 'class-diagram'
  | 'directory-tree'
  | 'data-flow'
  | 'rest-api'
  | 'research' 
  | 'comparison' 
  | 'features' 
  | 'hosting-limits'
  | 'security' 
  | 'serialization-lab' 
  | 'state-machine' 
  | 'package-spec' 
  | 'roadmap';

export interface CloudStorageProvider {
  id: string;
  name: string;
  type: 'byos' | 'managed';
  isPaidService: boolean;
  category: string;
  description: string;
  iconName: string;
  fields: { name: string; label: string; placeholder: string; isSecret?: boolean }[];
  endpointTemplate?: string;
  docsUrl: string;
}

export interface RetentionPolicyConfig {
  dailyRetention: number;
  weeklyRetention: number;
  monthlyRetention: number;
  maxStorageQuotaGb: number;
  offPeakTime: string;
  autoPruneEnabled: boolean;
  notifyOnFailureEmail: string;
}

export interface CliCommandDef {
  command: string;
  description: string;
  synopsis: string;
  options: { name: string; desc: string; type: string; default?: string }[];
  example: string;
}

export interface BackupItem {
  id: string;
  filename: string;
  sizeBytes: number;
  wpVersion: string;
  phpVersion: string;
  checksum: string;
  createdAt: string;
  components: string[];
}

export interface PhpSourceFile {
  name: string;
  path: string;
  namespace: string;
  category: 'Core' | 'Database' | 'Archive' | 'Files' | 'Storage' | 'Security' | 'Testing';
  description: string;
  code: string;
}

export interface ClassDefinition {
  name: string;
  namespace: string;
  type: 'interface' | 'abstract' | 'class';
  implementsOrExtends?: string;
  description: string;
  responsibilities: string[];
  keyMethods: { signature: string; returnType: string; description: string }[];
  codeSnippet?: string;
}

export interface DirectoryNode {
  name: string;
  type: 'folder' | 'file';
  path: string;
  description?: string;
  psr4Class?: string;
  children?: DirectoryNode[];
  preview?: string;
}

export interface RestEndpoint {
  method: 'GET' | 'POST' | 'DELETE';
  route: string;
  capability: string;
  description: string;
  requestBodyExample?: string;
  responseExample: string;
}

export interface CompetitorComparison {
  name: string;
  architecture: string;
  archiveFormat: string;
  chunkingMethod: string;
  strengths: string[];
  weaknesses: string[];
  securityConcerns: string[];
  monetizationBoundary: string;
}

export interface FeatureClassification {
  id: string;
  name: string;
  category: 'Core Free MVP' | 'Optional Add-on Module' | 'Cloud/External Service' | 'Banned Anti-Pattern';
  rationale: string;
  technicalComplexity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Phase 1 Research' | 'Phase 2 Architecture' | 'Phase 3 MVP' | 'Phase 4 Advanced' | 'Rejected';
}

export interface SharedHostingConstraint {
  parameter: string;
  typicalValue: string;
  worstCaseValue: string;
  impactOnMigration: string;
  architecturalMitigation: string;
}

export interface SecurityVulnerabilityVector {
  cwe: string;
  vector: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  mitigationStrategy: string;
}

export interface MigrationStateStep {
  id: string;
  label: string;
  phase: 'export' | 'import' | 'verification';
  description: string;
  typicalDurationSec: number;
  memoryRisk: 'Low' | 'Medium' | 'High';
  resumableKey: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  suite: 'Serialization' | 'ZipSlip' | 'DatabaseCursor' | 'HostConstraints' | 'Crypto' | 'ChunkIntegrity';
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  assertionsCount: number;
  memoryUsageKb: number;
  description: string;
  codeSnippet?: string;
  failureMessage?: string;
  diff?: { expected: string; actual: string };
}

export interface BenchmarkScaleScenario {
  id: string;
  label: string;
  siteType: string;
  totalSizeBytes: number;
  dbSizeBytes: number;
  mediaSizeBytes: number;
  tableCount: number;
  fileCount: number;
  postsOrOrdersCount: number;
  recommendedChunkSizeMb: number;
  description: string;
}

export interface HostConstraintProfile {
  id: string;
  name: string;
  badge: string;
  ramLimitMb: number;
  executionTimeoutSec: number;
  mysqlPacketMb: number;
  iopsThrottle: 'Normal' | 'Heavy Throttling' | 'Extreme Throttling';
  description: string;
}

export interface FuzzingPayloadItem {
  id: string;
  name: string;
  category: 'Zip Slip' | 'Unicode Boundary' | 'Object Injection' | 'Crypto Tampering' | 'Directory Traversal' | 'Cursor Exhaustion';
  riskLevel: 'Critical' | 'High' | 'Medium';
  attackVector: string;
  payloadSample: string;
  expectedDefense: string;
  defenseInterceptLayer: string;
}

export interface SecurityThreatItem {
  id: string;
  cwe: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvssScore: number;
  attackScenario: string;
  remediationCode: string;
  testVerification: string;
  complianceStatus: 'Verified Remediated' | 'Zero Vulnerability';
  layer: string;
}

export interface StaticAnalysisRule {
  id: string;
  tool: 'PHPStan Level 8' | 'WordPress Coding Standards (WPCS)' | 'Psalm';
  ruleName: string;
  category: 'Type Safety' | 'Sanitization' | 'Cross-Site Scripting' | 'Memory / Resource' | 'DocBlocks';
  severity: 'error' | 'warning';
  status: 'Passed (0 Errors)';
  description: string;
  codeSample: string;
  standardsDoc: string;
}

export interface WordPressHookRef {
  id: string;
  name: string;
  type: 'action' | 'filter';
  parameters: { name: string; type: string; description: string }[];
  since: string;
  description: string;
  sampleCode: string;
  useCase: string;
}

export interface ReleaseFileManifestItem {
  path: string;
  type: 'file' | 'directory';
  sizeBytes: number;
  sha256: string;
  isExcludedInRelease: boolean;
  exclusionReason?: string;
  purpose: string;
}


