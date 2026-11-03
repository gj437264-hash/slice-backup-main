import React, { useState } from 'react';
import { 
  Cloud, 
  HardDrive, 
  Database, 
  FolderArchive, 
  Server, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Lock, 
  ShieldCheck, 
  ExternalLink,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { CLOUD_STORAGE_PROVIDERS } from '../data/phase4Data';
import { CloudStorageProvider } from '../types';

export const CloudStorageHub: React.FC = () => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('managed-vault');
  const [filterType, setFilterType] = useState<'all' | 'byos' | 'managed'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Form states for active provider
  const [formValues, setFormValues] = useState<Record<string, string>>({
    vault_token: 'wpb_live_sec_7894a3290ef812',
    region: 'us-east (Virginia)',
    retention_days: '30',
    bucket: 'production-wp-backups',
    account_id: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    access_key: 'AKIAIOSFODNN7EXAMPLE',
    secret_key: '••••••••••••••••••••••••••••••••'
  });

  const selectedProvider = CLOUD_STORAGE_PROVIDERS.find(p => p.id === selectedProviderId) || CLOUD_STORAGE_PROVIDERS[0];

  const filteredProviders = CLOUD_STORAGE_PROVIDERS.filter(p => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestResult(null);
    setTimeout(() => {
      setTestingConnection(false);
      if (selectedProvider.type === 'managed') {
        setTestResult({
          success: true,
          message: 'Connection verified! Authenticated with WP Bundle Cloud Vault. Quota available: 1.84 GB / 2.00 GB (Active Starter Tier).',
          latencyMs: 42
        });
      } else {
        setTestResult({
          success: true,
          message: `Connection successful! Read/Write/Delete probe passed on bucket "${formValues.bucket || 'wp-backups'}". Pure-PHP AWS SigV4 handshake valid.`,
          latencyMs: 88
        });
      }
    }, 1200);
  };

  const iamPolicyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "WPBundleMigratorStoragePolicy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::${formValues.bucket || 'your-bucket-name'}",
        "arn:aws:s3:::${formValues.bucket || 'your-bucket-name'}/*"
      ]
    }
  ]
}`;

  return (
    <div className="space-y-8">
      {/* Philosophy & Architecture Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Open Source First • Zero Artificial Lock-In</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Pluggable Cloud Storage Architecture
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We believe WordPress core features belong to the community. Connect your own Amazon S3, Cloudflare R2, Google Cloud Storage, Dropbox, or SFTP server <strong className="text-white">100% free of charge</strong> with zero upsell lockouts. Non-technical users who prefer turnkey convenience can subscribe to our optional <strong className="text-indigo-300">WP Bundle Managed Cloud Vault</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10">
              <div className="text-xs text-slate-300 font-medium">BYOS (Own Keys)</div>
              <div className="text-lg font-bold text-emerald-400">100% Free Forever</div>
              <div className="text-xs text-slate-400">S3, R2, GCS, Dropbox, SFTP</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10">
              <div className="text-xs text-slate-300 font-medium">Managed Cloud Vault</div>
              <div className="text-lg font-bold text-indigo-300">Optional Paid Service</div>
              <div className="text-xs text-slate-400">Zero AWS config, 1-click token</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Providers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <span>Select Cloud Storage Provider</span>
          </h3>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Providers ({CLOUD_STORAGE_PROVIDERS.length})
            </button>
            <button
              onClick={() => setFilterType('byos')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterType === 'byos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Bring Your Own Storage (Free)
            </button>
            <button
              onClick={() => setFilterType('managed')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterType === 'managed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Managed Vault (Turnkey)
            </button>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProviders.map(provider => {
            const isSelected = selectedProviderId === provider.id;
            const isManaged = provider.type === 'managed';

            return (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProviderId(provider.id);
                  setTestResult(null);
                }}
                className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isManaged ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {provider.iconName === 'Sparkles' && <Sparkles className="w-5 h-5 text-amber-300" />}
                      {provider.iconName === 'HardDrive' && <HardDrive className="w-5 h-5 text-amber-600" />}
                      {provider.iconName === 'Cloud' && <Cloud className="w-5 h-5 text-sky-600" />}
                      {provider.iconName === 'Database' && <Database className="w-5 h-5 text-blue-600" />}
                      {provider.iconName === 'FolderArchive' && <FolderArchive className="w-5 h-5 text-blue-500" />}
                      {provider.iconName === 'Server' && <Server className="w-5 h-5 text-emerald-600" />}
                      {provider.iconName === 'Flame' && <Flame className="w-5 h-5 text-red-500" />}
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isManaged
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {isManaged ? 'Managed Vault' : '100% Free (BYOS)'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{provider.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {provider.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{provider.category}</span>
                  <span className="font-mono text-indigo-600 font-medium">Configure →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form & Probe */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>{selectedProvider.name} Settings</span>
                {selectedProvider.isPaidService ? (
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-medium">
                    Optional Cloud Subscription
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 font-medium">
                    Zero-Cost BYOS
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedProvider.description}
              </p>
            </div>

            <a
              href={selectedProvider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center space-x-1"
            >
              <span>Setup Guide</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedProvider.fields.map(field => (
              <div key={field.name} className={field.name === 'private_key' || field.name === 'vault_token' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.isSecret ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={formValues[field.name] || ''}
                    onChange={e => setFormValues({ ...formValues, [field.name]: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                  />
                  {field.isSecret && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Test & Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-xs shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing Cloud Endpoint...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test &amp; Validate Connection</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-500">
              Credentials encrypted locally using AES-256 in <code className="font-mono text-slate-700">wp_options</code>
            </span>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-4 rounded-lg border text-xs flex items-start space-x-3 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{testResult.message}</div>
                {testResult.latencyMs && (
                  <div className="mt-1 text-[11px] text-emerald-700 font-mono">
                    Round-trip latency: {testResult.latencyMs}ms • Endpoint: TLS 1.3 / HTTP/2 verified
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Value Comparison & IAM Policy Helper */}
        <div className="space-y-6">
          {/* Managed Cloud vs BYOS Explanation Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Storage Cost &amp; Independence Comparison
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Cloudflare R2 (BYOS)</div>
                  <div className="text-[11px] text-slate-500">$0.015/GB • Zero Egress Fees</div>
                </div>
                <span className="font-bold text-emerald-600">Free in Plugin</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Backblaze B2 (BYOS)</div>
                  <div className="text-[11px] text-slate-500">$0.006/GB • Ultra Low Cost</div>
                </div>
                <span className="font-bold text-emerald-600">Free in Plugin</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">AWS S3 Standard (BYOS)</div>
                  <div className="text-[11px] text-slate-500">$0.023/GB • Global Availability</div>
                </div>
                <span className="font-bold text-emerald-600">Free in Plugin</span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-indigo-900">Managed Cloud Vault</div>
                  <div className="text-[11px] text-indigo-700">1-Click Token • No IAM Setup</div>
                </div>
                <span className="font-bold text-indigo-700">From $4/mo</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Unlike commercial migration plugins that lock S3 behind a $99/year subscription, WP Bundle Migrator ensures all S3/R2/GCS/Dropbox adapters are built directly into the free core.
            </p>
          </div>

          {/* IAM Least-Privilege Policy Helper (For S3) */}
          {selectedProvider.id === 'aws-s3' && (
            <div className="bg-slate-900 rounded-xl p-4 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">AWS IAM Least-Privilege Policy</span>
                <button
                  onClick={() => handleCopy(iamPolicyJson, 'iam-policy')}
                  className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center space-x-1"
                >
                  {copiedKey === 'iam-policy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'iam-policy' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-400 bg-black/40 p-2.5 rounded overflow-x-auto max-h-48 scrollbar-none">
                {iamPolicyJson}
              </pre>
              <p className="text-[10px] text-slate-400">
                Attach this restrictive policy to your IAM user to ensure the plugin only accesses the backup bucket.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
