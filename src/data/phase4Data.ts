import { CloudStorageProvider, CliCommandDef, RetentionPolicyConfig } from '../types';

export const CLOUD_STORAGE_PROVIDERS: CloudStorageProvider[] = [
  {
    id: 'managed-vault',
    name: 'WP Bundle Managed Cloud Vault',
    type: 'managed',
    isPaidService: true,
    category: 'Turnkey Cloud',
    description: 'Official zero-configuration cloud vault. 1-click token connection, triple-geo redundant European & US enterprise storage, automated encryption at rest, and zero IAM/API configuration needed. Includes free 2GB starter quota.',
    iconName: 'Sparkles',
    fields: [
      { name: 'vault_token', label: 'Vault Connection Token', placeholder: 'wpb_live_sec_994a...', isSecret: true },
      { name: 'region', label: 'Storage Region', placeholder: 'us-east (Virginia) or eu-central (Frankfurt)' },
      { name: 'retention_days', label: 'Cloud Retention Window (Days)', placeholder: '30' }
    ],
    docsUrl: 'https://wpbundle.org/docs/managed-vault'
  },
  {
    id: 'aws-s3',
    name: 'Amazon S3 (BYOS)',
    type: 'byos',
    isPaidService: false,
    category: 'S3-Compatible',
    description: 'Connect your own AWS S3 bucket. Zero plugin licensing fees, pure PHP AWS Signature Version 4 stream signer without the 30MB AWS SDK bloat.',
    iconName: 'HardDrive',
    fields: [
      { name: 'bucket', label: 'S3 Bucket Name', placeholder: 'my-site-backups-bucket' },
      { name: 'region', label: 'AWS Region', placeholder: 'us-east-1' },
      { name: 'access_key', label: 'IAM Access Key ID', placeholder: 'AKIAIOSFODNN7EXAMPLE' },
      { name: 'secret_key', label: 'IAM Secret Access Key', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', isSecret: true },
      { name: 'storage_class', label: 'Storage Class', placeholder: 'STANDARD or STANDARD_IA or GLACIER_IR' }
    ],
    docsUrl: 'https://wpbundle.org/docs/storage/aws-s3'
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2 (BYOS)',
    type: 'byos',
    isPaidService: false,
    category: 'S3-Compatible',
    description: 'Zero egress fees S3-compatible cloud storage. Ideal for multi-gigabyte WordPress migrations and regular daily snapshots.',
    iconName: 'Cloud',
    fields: [
      { name: 'bucket', label: 'R2 Bucket Name', placeholder: 'wp-production-backups' },
      { name: 'account_id', label: 'Cloudflare Account ID', placeholder: 'c3b7a5e9f12000000000000000000000' },
      { name: 'access_key', label: 'R2 Access Key ID', placeholder: '89a4cd0f...' },
      { name: 'secret_key', label: 'R2 Secret Access Key', placeholder: '74c93021...', isSecret: true }
    ],
    endpointTemplate: 'https://{account_id}.r2.cloudflarestorage.com',
    docsUrl: 'https://wpbundle.org/docs/storage/cloudflare-r2'
  },
  {
    id: 'google-cloud-storage',
    name: 'Google Cloud Storage (BYOS)',
    type: 'byos',
    isPaidService: false,
    category: 'Object Storage',
    description: 'Direct integration with Google Cloud Storage buckets via interoperability HMAC keys or Service Account JSON tokens.',
    iconName: 'Database',
    fields: [
      { name: 'bucket', label: 'GCS Bucket Name', placeholder: 'my-wp-backups-gcs' },
      { name: 'access_id', label: 'GCS Access Key / Access ID', placeholder: 'GOOG1E...' },
      { name: 'secret', label: 'GCS Secret Key', placeholder: 'wJalrXUt...', isSecret: true }
    ],
    docsUrl: 'https://wpbundle.org/docs/storage/gcs'
  },
  {
    id: 'dropbox',
    name: 'Dropbox (BYOS)',
    type: 'byos',
    isPaidService: false,
    category: 'Consumer Cloud',
    description: 'Authenticate with your personal or team Dropbox account via OAuth2 App Key. Uses chunked upload sessions (/2/files/upload_session).',
    iconName: 'FolderArchive',
    fields: [
      { name: 'app_key', label: 'Dropbox App Key', placeholder: 'dbx_app_...' },
      { name: 'app_secret', label: 'Dropbox App Secret', placeholder: '••••••••', isSecret: true },
      { name: 'refresh_token', label: 'Long-Lived Refresh Token', placeholder: 'sl.u.AF...', isSecret: true },
      { name: 'folder_path', label: 'Target Folder Path', placeholder: '/WordPressBackups' }
    ],
    docsUrl: 'https://wpbundle.org/docs/storage/dropbox'
  },
  {
    id: 'sftp',
    name: 'SFTP / Remote SSH Server (BYOS)',
    type: 'byos',
    isPaidService: false,
    category: 'Server-to-Server',
    description: 'Offsite SSH File Transfer Protocol (SFTP) streaming directly to secondary dedicated servers, NAS devices, or storage VPSs with private key or password authentication.',
    iconName: 'Server',
    fields: [
      { name: 'host', label: 'SFTP Host / IP', placeholder: 'backup.mycompany.net' },
      { name: 'port', label: 'Port', placeholder: '22' },
      { name: 'username', label: 'Username', placeholder: 'deployer' },
      { name: 'password', label: 'Password / Key Passphrase', placeholder: '••••••••', isSecret: true },
      { name: 'private_key', label: 'SSH Private Key (Optional PEM)', placeholder: '-----BEGIN OPENSSH PRIVATE KEY-----...' },
      { name: 'remote_dir', label: 'Remote Target Directory', placeholder: '/var/backups/wp-sites' }
    ],
    docsUrl: 'https://wpbundle.org/docs/storage/sftp'
  },
  {
    id: 'backblaze-b2',
    name: 'Backblaze B2 (BYOS)',
    type: 'byos',
    isPaidService: false,
    category: 'S3-Compatible',
    description: 'Ultra-low-cost cloud storage ($0.006/GB/mo) using native S3-compatible endpoints with automated bucket lifecycle policies.',
    iconName: 'Flame',
    fields: [
      { name: 'bucket', label: 'B2 Bucket Name', placeholder: 'my-backblaze-vault' },
      { name: 'endpoint', label: 'S3 Endpoint URL', placeholder: 's3.us-west-004.backblazeb2.com' },
      { name: 'key_id', label: 'Application Key ID', placeholder: '004e0e...' },
      { name: 'app_key', label: 'Application Key', placeholder: 'K004...', isSecret: true }
    ],
    docsUrl: 'https://wpbundle.org/docs/storage/backblaze-b2'
  }
];

export const CLI_COMMAND_CATALOG: CliCommandDef[] = [
  {
    command: 'wp migrate export',
    description: 'Streams and packages full site or selective components into a .wpbundle file.',
    synopsis: 'wp migrate export [--type=<full|db|files>] [--storage=<local|s3|r2|gcs|managed>] [--encrypt] [--password=<pass>] [--exclude-uploads] [--output=<path>]',
    options: [
      { name: '--type', desc: 'Components to include: full, db, files, themes, plugins', type: 'string', default: 'full' },
      { name: '--storage', desc: 'Target storage adapter (local, s3, r2, gcs, managed)', type: 'string', default: 'local' },
      { name: '--encrypt', desc: 'Enable streaming AES-256-GCM encryption', type: 'flag' },
      { name: '--password', desc: 'Encryption passphrase (or prompted interactively)', type: 'string' },
      { name: '--output', desc: 'Destination absolute path or filename', type: 'path' }
    ],
    example: 'wp migrate export --type=full --storage=r2 --encrypt --password="SecretStrongKey99!"'
  },
  {
    command: 'wp migrate import',
    description: 'Restores a .wpbundle archive with serialization-safe domain and URL replacement.',
    synopsis: 'wp migrate import <file> [--search=<old_url>] [--replace=<new_url>] [--yes] [--skip-db] [--skip-files] [--decrypt-password=<pass>]',
    options: [
      { name: '<file>', desc: 'Path or remote URL to the .wpbundle archive', type: 'positional' },
      { name: '--search', desc: 'Original domain/URL to find in serialized database', type: 'string' },
      { name: '--replace', desc: 'Replacement domain/URL for current site', type: 'string' },
      { name: '--yes', desc: 'Bypass interactive confirmation prompt', type: 'flag' },
      { name: '--decrypt-password', desc: 'Passphrase for encrypted archives', type: 'string' }
    ],
    example: 'wp migrate import /backups/site.wpbundle --search="http://old.dev" --replace="https://prod.com" --yes'
  },
  {
    command: 'wp migrate backup list',
    description: 'Lists all available local and remote cloud backups with SHA256 integrity status.',
    synopsis: 'wp migrate backup list [--storage=<local|cloud|all>] [--format=<table|json|csv|ids>]',
    options: [
      { name: '--storage', desc: 'Filter backups by storage location', type: 'string', default: 'all' },
      { name: '--format', desc: 'Output rendering format', type: 'string', default: 'table' }
    ],
    example: 'wp migrate backup list --storage=s3 --format=table'
  },
  {
    command: 'wp migrate cloud sync',
    description: 'Synchronizes local vault archives with remote cloud storage and executes retention pruning.',
    synopsis: 'wp migrate cloud sync [--provider=<id>] [--prune] [--dry-run]',
    options: [
      { name: '--provider', desc: 'Cloud provider ID (aws-s3, cloudflare-r2, managed-vault)', type: 'string' },
      { name: '--prune', desc: 'Delete remote backups exceeding retention policy window', type: 'flag' },
      { name: '--dry-run', desc: 'Simulate synchronization without altering files', type: 'flag' }
    ],
    example: 'wp migrate cloud sync --provider=cloudflare-r2 --prune'
  },
  {
    command: 'wp migrate multisite extract',
    description: 'Extracts a single subsite from a WordPress Network (Multisite) into an independent standalone site.',
    synopsis: 'wp migrate multisite extract --blog-id=<id> [--output=<path>] [--target-url=<url>]',
    options: [
      { name: '--blog-id', desc: 'Subsite ID inside the Multisite network', type: 'integer' },
      { name: '--target-url', desc: 'Standalone site target URL for serialized replacement', type: 'string' },
      { name: '--output', desc: 'Destination .wpbundle archive path', type: 'path' }
    ],
    example: 'wp migrate multisite extract --blog-id=3 --target-url="https://standalone-client.com"'
  }
];

export const DEFAULT_RETENTION_CONFIG: RetentionPolicyConfig = {
  dailyRetention: 7,
  weeklyRetention: 4,
  monthlyRetention: 12,
  maxStorageQuotaGb: 15,
  offPeakTime: '03:00',
  autoPruneEnabled: true,
  notifyOnFailureEmail: 'admin@example.com'
};
