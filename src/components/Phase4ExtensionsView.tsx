import React, { useState } from 'react';
import { 
  Cloud, 
  Terminal, 
  Calendar, 
  ShieldCheck, 
  Network, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle,
  Zap,
  Check,
  X,
  Radio,
  FileCode,
  PackageCheck,
  Ban,
  Settings,
  Key,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Server,
  HardDrive
} from 'lucide-react';
import { ActiveTab } from '../types';

interface Phase4ExtensionsViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

interface ExtensionItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge: string;
  description: string;
  features: string[];
  isBuiltIn: boolean;
  targetTab?: ActiveTab;
}

export const Phase4ExtensionsView: React.FC<Phase4ExtensionsViewProps> = ({ onNavigateTab }) => {
  // In-App Extension states (Zero secondary plugins)
  const [activeExtensions, setActiveExtensions] = useState<Record<string, boolean>>({
    cloud_hub: true,
    scheduler: true,
    live_transfer: true,
    aes_encryption: true,
    multisite_pro: true,
  });

  const [activeModalExt, setActiveModalExt] = useState<ExtensionItem | null>(null);
  const [inputLicenseKey, setInputLicenseKey] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [justActivated, setJustActivated] = useState<string | null>(null);

  // Settings Workbench State
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<'cloud' | 'scheduler' | 'encryption' | 'p2p' | 'engine'>('cloud');

  // Cloud Hub Settings
  const [cloudProvider, setCloudProvider] = useState<string>('r2');
  const [cloudKey, setCloudKey] = useState<string>('R2_AKIA_019283746591');
  const [cloudSecret, setCloudSecret] = useState<string>('R2_SECRET_99847162534801928374');
  const [showCloudSecret, setShowCloudSecret] = useState<boolean>(false);
  const [cloudBucket, setCloudBucket] = useState<string>('production-wp-backups');
  const [cloudRegion, setCloudRegion] = useState<string>('auto');
  const [cloudEndpoint, setCloudEndpoint] = useState<string>('https://f7ca9ac8.r2.cloudflarestorage.com');
  const [cloudPath, setCloudPath] = useState<string>('wp-backups/client-site/');
  const [cloudAutoUpload, setCloudAutoUpload] = useState<boolean>(true);
  const [cloudTesting, setCloudTesting] = useState<boolean>(false);
  const [cloudTestResult, setCloudTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Scheduler Settings
  const [schedEnabled, setSchedEnabled] = useState<boolean>(true);
  const [schedFreq, setSchedFreq] = useState<string>('daily');
  const [schedTime, setSchedTime] = useState<string>('02:00');
  const [schedScope, setSchedScope] = useState<string>('turnkey_full');
  const [schedDaily, setSchedDaily] = useState<number>(7);
  const [schedWeekly, setSchedWeekly] = useState<number>(4);
  const [schedMonthly, setSchedMonthly] = useState<number>(12);
  const [schedEmail, setSchedEmail] = useState<string>('sysadmin@client-site.com');
  const [schedWebhook, setSchedWebhook] = useState<string>('https://hooks.slack.com/services/T00/B00/XXXXX');

  // Encryption Settings
  const [encEnabled, setEncEnabled] = useState<boolean>(true);
  const [showEncPass, setShowEncPass] = useState<boolean>(false);

  // P2P Live Tunnel Settings
  const [p2pEnabled, setP2pEnabled] = useState<boolean>(true);
  const [p2pToken, setP2pToken] = useState<string>('9f83ab204c38d176ea392019ff83b241');
  const [p2pRemoteUrl, setP2pRemoteUrl] = useState<string>('https://destination-host.com');
  const [tokenCopied, setTokenCopied] = useState<boolean>(false);

  // Core Engine Settings
  const [chunkSize, setChunkSize] = useState<number>(2500);
  const [memoryLimit, setMemoryLimit] = useState<string>('256M');
  const [maxExecutionTime, setMaxExecutionTime] = useState<number>(300);
  const [retentionCount, setRetentionCount] = useState<number>(5);

  const [settingsSavedNotice, setSettingsSavedNotice] = useState<string | null>(null);

  // Encryption lab state
  const [passphrase, setPassphrase] = useState<string>('MySecretMasterPassphrase2026!');
  const [pbkdf2Iterations, setPbkdf2Iterations] = useState<number>(100000);
  const [tamperedCipher, setTamperedCipher] = useState<boolean>(false);

  const samplePayload = '{"package_id":"wpb_74829","wp_version":"6.7.1","site_url":"https://client.com","db_tables":18}';
  const derivedKeyHex = '9f83ab204c38d176ea392019ff83b2410a8291c948301824ab839120de840182';
  const ivHex = '7a19c40291e843b01938fe20';
  const authTagHex = tamperedCipher ? 'f0000000000000000000000000000000' : '5b2049d8e71920ac39485720184719be';
  const ciphertextHex = tamperedCipher 
    ? '9984ef2a9104829bcdef10293847560192837465...[TAMPERED_BIT_DETECTED]'
    : '4a83e01928bc39485720184719be8392019483019283746583920194...';

  const extensionsList: ExtensionItem[] = [
    {
      id: 'cloud_hub',
      name: 'Pluggable Cloud Storage Hub',
      category: 'Cloud Storage',
      icon: '☁️',
      badge: 'BYOS Free + Managed',
      description: 'Stream backups directly to Amazon S3, Cloudflare R2, Google Cloud, Dropbox, OneDrive, or SFTP using lightweight pure-PHP SigV4 without 30MB AWS SDK bloat.',
      features: [
        'Free BYOS (Bring Your Own Storage) credentials',
        'Optional 1-Click Managed Cloud Vault service',
        'Multipart chunked streaming bypassing RAM limits'
      ],
      isBuiltIn: true,
      targetTab: 'cloud-storage-hub'
    },
    {
      id: 'scheduler',
      name: 'Automated GFS Backup Scheduler',
      category: 'Automation & Pruning',
      icon: '📅',
      badge: 'Zero Cron Overhead',
      description: 'Grandfather-Father-Son automated retention rotation (Daily 7, Weekly 4, Monthly 12) with hard disk quota guardrails to prevent hosting disk bloat.',
      features: [
        'Action Scheduler background daemon integration',
        'Automated local and cloud retention pruning',
        'Webhook alerts for Slack, Discord & Email'
      ],
      isBuiltIn: false,
      targetTab: 'automation-retention'
    },
    {
      id: 'live_transfer',
      name: 'Direct Server-to-Server Push/Pull',
      category: 'Live Migration',
      icon: '🚀',
      badge: 'Zero Local Download',
      description: 'Migrate directly between source and destination servers over an encrypted REST tunnel. Completely eliminates downloading 30GB archives to your laptop.',
      features: [
        'One-time 32-character pairing security token',
        'Direct server-to-server chunk streaming',
        'Automatic domain rewrite during live sync'
      ],
      isBuiltIn: false
    },
    {
      id: 'aes_encryption',
      name: 'AES-256-GCM Military Encryption',
      category: 'Cryptographic Security',
      icon: '🔒',
      badge: 'Included & Active',
      description: 'Encrypt your backups at rest and in transit. Galois/Counter Mode (GCM) with 100,000 PBKDF2 rounds guarantees AEAD integrity against tampering.',
      features: [
        'Native OpenSSL streaming with zero external libs',
        'Immune to bit-flipping and POP gadget chains',
        'Memory overhead stays under 400 KB'
      ],
      isBuiltIn: true
    },
    {
      id: 'multisite_pro',
      name: 'Multisite Network Subsite Isolator',
      category: 'Network Operations',
      icon: '🌐',
      badge: 'Included & Active',
      description: 'Extract any individual subsite from a WordPress Network into a self-contained standalone single-site archive with prefix rewriting and isolated media.',
      features: [
        'Subsite to standalone single-site conversion',
        'Full network backup and turnkey restoration',
        'Subdomain & subdirectory routing support'
      ],
      isBuiltIn: true,
      targetTab: 'cli-multisite'
    }
  ];

  const handleActivateExtension = (ext: ExtensionItem) => {
    setActiveModalExt(ext);
    setInputLicenseKey('');
  };

  const executeActivation = (key: string) => {
    if (!activeModalExt) return;
    setIsActivating(true);
    setTimeout(() => {
      setActiveExtensions(prev => ({
        ...prev,
        [activeModalExt.id]: true
      }));
      setJustActivated(activeModalExt.name);
      setIsActivating(false);
      setActiveModalExt(null);
      setTimeout(() => setJustActivated(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Phase 4: Advanced Features &amp; Extensibility Layer</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white">
            Pluggable Cloud Hub, Automation &amp; Enterprise CLI
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Phase 4 expands the core migration engine into an enterprise-ready automation suite with an <strong className="text-white">anti-clutter architecture</strong>. No secondary plugin ZIPs to download or manage. Every extension is pre-compiled into the core and activated with a few clicks.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('cloud-storage-hub')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Explore Cloud Storage Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('automation-retention')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Smart Retention Engine</span>
            </button>
            <button
              onClick={() => onNavigateTab('cli-multisite')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>WP-CLI &amp; Multisite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Anti-AIO Architecture Callout */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                Core Architectural Philosophy
              </span>
              <span className="text-xs font-semibold text-amber-900">Zero Secondary ZIPs • Anti-AIO Clutter</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Why We Rejected the "Separate Plugin for Every Feature" Model
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              In legacy migration tools like All-in-One WP Migration, unlocking features requires downloading and installing <strong>5 to 10 separate plugin ZIP files</strong> (Unlimited Extension, S3 Extension, Google Drive Extension, Multisite Extension, etc.). This pollutes the WordPress plugins folder, causes version incompatibility conflicts during core updates, and frustrates site owners.
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>WP Bundle Migrator's Solution:</strong> A unified, modular engine. Every capability is pre-built into the core plugin. Activating a feature takes <strong>just 2 clicks</strong> inside the plugin UI—click "Activate", complete subscription/key, and done. <strong>Zero file uploads. Zero plugin clutter.</strong>
            </p>
          </div>

          <div className="bg-white/90 border border-amber-200 rounded-xl p-4 shrink-0 shadow-xs space-y-2 text-xs w-full lg:w-72">
            <div className="font-bold text-slate-900 pb-1 border-b border-amber-100 flex items-center justify-between">
              <span>Architectural Comparison</span>
            </div>
            <div className="flex items-center justify-between text-rose-700">
              <span className="flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> AIO Approach:</span>
              <span className="font-bold">10 Plugins Installed</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 font-bold">
              <span className="flex items-center gap-1.5"><PackageCheck className="w-3.5 h-3.5" /> Our Approach:</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">1 Unified Plugin</span>
            </div>
            <div className="pt-1 text-[11px] text-slate-500 border-t border-amber-100">
              Activation via in-app API handshake with zero server file writes.
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {justActivated && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-bold">✓ Extension Activated Successfully!</strong>
              <span className="block text-xs text-emerald-800 mt-0.5">
                "{justActivated}" is now unlocked and live in your WordPress instance with zero additional plugin downloads.
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const el = document.getElementById('extension-settings-workbench');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Settings Now &rarr;</span>
            </button>
            <button 
              onClick={() => setJustActivated(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Interactive 1-Click In-App Extension Activation Hub */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>In-App Extension Hub</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              Few-Clicks Extension Activation &amp; Management
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "1-Click Activate" on any extension below to test the instant in-app activation workflow.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
              Active Modules: {Object.values(activeExtensions).filter(Boolean).length} / {extensionsList.length}
            </span>
          </div>
        </div>

        {/* Extensions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extensionsList.map((ext) => {
            const isActive = !!activeExtensions[ext.id];
            return (
              <div 
                key={ext.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isActive 
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{ext.icon}</span>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isActive ? 'Active & Configured' : 'Ready to Activate'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{ext.name}</h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {ext.description}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4">
                    {ext.features.map((feat, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {ext.targetTab && (
                    <button
                      onClick={() => onNavigateTab(ext.targetTab!)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Settings</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {isActive ? (
                    <div className="flex items-center space-x-2">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </div>
                      <button
                        onClick={() => {
                          const tabMap: Record<string, 'cloud' | 'scheduler' | 'encryption' | 'p2p' | 'engine'> = {
                            cloud_hub: 'cloud',
                            scheduler: 'scheduler',
                            live_transfer: 'p2p',
                            aes_encryption: 'encryption',
                            multisite_pro: 'engine'
                          };
                          setActiveSettingsSubTab(tabMap[ext.id] || 'engine');
                          const el = document.getElementById('extension-settings-workbench');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-all cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Configure</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActivateExtension(ext)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer ml-auto"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Click Activate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXTENSION SETTINGS & CONFIGURATION WORKBENCH (In-App Settings Simulator) */}
      <div id="extension-settings-workbench" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-6">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Settings className="w-4 h-4" />
                <span>WordPress Plugin Settings Panel (1:1 wp_options Store)</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Extension Configuration &amp; Setup Suite
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure cloud storage credentials, automated backup cadences, AES encryption passphrases, and direct server pairing tokens.
              </p>
            </div>

            {settingsSavedNotice && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{settingsSavedNotice}</span>
              </div>
            )}
          </div>

          {/* Sub-Nav Jump Tabs */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-200/60">
            <button
              onClick={() => setActiveSettingsSubTab('cloud')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSettingsSubTab === 'cloud'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>☁️ Cloud Storage Hub</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSettingsSubTab === 'cloud' ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                R2 Active
              </span>
            </button>

            <button
              onClick={() => setActiveSettingsSubTab('scheduler')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSettingsSubTab === 'scheduler'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>📅 Automated GFS Scheduler</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSettingsSubTab === 'scheduler' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                Daily
              </span>
            </button>

            <button
              onClick={() => setActiveSettingsSubTab('encryption')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSettingsSubTab === 'encryption'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🔒 AES-256-GCM Encryption</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSettingsSubTab === 'encryption' ? 'bg-indigo-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
                AEAD
              </span>
            </button>

            <button
              onClick={() => setActiveSettingsSubTab('p2p')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSettingsSubTab === 'p2p'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🚀 Direct P2P Migration</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSettingsSubTab === 'p2p' ? 'bg-indigo-500 text-white' : 'bg-rose-100 text-rose-800'}`}>
                Token Ready
              </span>
            </button>

            <button
              onClick={() => setActiveSettingsSubTab('engine')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSettingsSubTab === 'engine'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>⚙️ Core Engine</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSettingsSubTab === 'engine' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                2.5k Rows
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Cloud Storage Setup */}
        {activeSettingsSubTab === 'cloud' && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>☁️ Pluggable Cloud Storage Hub Setup</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stream backups directly to S3, Cloudflare R2, Google Cloud, or Wasabi with zero local disk buffering.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                Pure PHP SigV4 Streaming
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cloud Storage Provider</label>
                <select
                  value={cloudProvider}
                  onChange={e => setCloudProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="r2">Cloudflare R2 (Recommended • Zero Egress Fees)</option>
                  <option value="s3">Amazon Web Services (AWS S3)</option>
                  <option value="gcs">Google Cloud Storage (GCS)</option>
                  <option value="wasabi">Wasabi Hot Cloud Storage</option>
                  <option value="b2">Backblaze B2 (S3 Compatible)</option>
                  <option value="spaces">DigitalOcean Spaces</option>
                  <option value="minio">MinIO / Self-Hosted S3</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="sftp">SFTP / SSH Remote Server</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bucket / Storage Container Name</label>
                <input
                  type="text"
                  value={cloudBucket}
                  onChange={e => setCloudBucket(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  placeholder="production-wp-backups"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Key ID / API Token</label>
                <input
                  type="text"
                  value={cloudKey}
                  onChange={e => setCloudKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secret Access Key / Secret Token</label>
                <div className="relative">
                  <input
                    type={showCloudSecret ? 'text' : 'password'}
                    value={cloudSecret}
                    onChange={e => setCloudSecret(e.target.value)}
                    className="w-full pr-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                    placeholder="••••••••••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCloudSecret(!showCloudSecret)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCloudSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Endpoint URL</label>
                <input
                  type="text"
                  value={cloudEndpoint}
                  onChange={e => setCloudEndpoint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  placeholder="https://<account-id>.r2.cloudflarestorage.com"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Required for Cloudflare R2, Wasabi, and MinIO. Leave blank for AWS S3.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Path Prefix</label>
                <input
                  type="text"
                  value={cloudPath}
                  onChange={e => setCloudPath(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  placeholder="wp-backups/client-site/"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloudAutoUpload}
                  onChange={e => setCloudAutoUpload(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Automatically stream new exports directly to this cloud storage bucket</span>
              </label>
            </div>

            {/* Test Connection Button */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCloudTesting(true);
                  setCloudTestResult(null);
                  setTimeout(() => {
                    setCloudTesting(false);
                    setCloudTestResult({
                      success: true,
                      message: `✓ Handshake verified! Successfully authenticated with ${cloudProvider.toUpperCase()} (Bucket: "${cloudBucket}"). Zero-memory chunked streaming pipeline is ready.`
                    });
                  }, 600);
                }}
                disabled={cloudTesting}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudTesting ? 'animate-spin' : ''}`} />
                <span>{cloudTesting ? 'Testing Handshake...' : 'Test Cloud Connection'}</span>
              </button>

              {cloudTestResult && (
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 ${
                  cloudTestResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{cloudTestResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Automated GFS Scheduler Setup */}
        {activeSettingsSubTab === 'scheduler' && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>📅 Automated GFS Backup Scheduler Setup</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set-and-forget background backup daemon with Grandfather-Father-Son rotation to prevent disk bloat.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">
                Action Scheduler Daemon
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center space-x-2.5 text-xs text-slate-800 font-bold cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={schedEnabled}
                  onChange={e => setSchedEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable automated background backup scheduling</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cadence / Frequency</label>
                  <select
                    value={schedFreq}
                    onChange={e => setSchedFreq(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="hourly_6">Every 6 Hours (High-traffic WooCommerce)</option>
                    <option value="daily">Daily at Off-Peak Hours (Recommended)</option>
                    <option value="twicedaily">Twice Daily (Morning &amp; Midnight)</option>
                    <option value="weekly">Weekly (Every Sunday 02:00 UTC)</option>
                    <option value="monthly">Monthly (1st Day of Month)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Execution Time (UTC)</label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={e => setSchedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Backup Scope</label>
                  <select
                    value={schedScope}
                    onChange={e => setSchedScope(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="turnkey_full">Turnkey Full Bundle (Database + Files + Core)</option>
                    <option value="full">Content &amp; Database (wp-content + DB)</option>
                    <option value="db_only">Database Only (Snapshot)</option>
                  </select>
                </div>
              </div>

              {/* GFS Tiers */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block">Grandfather-Father-Son (GFS) Rotation Tiers</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">Keep Daily Backups</label>
                    <input
                      type="number"
                      value={schedDaily}
                      onChange={e => setSchedDaily(parseInt(e.target.value) || 7)}
                      min={1}
                      max={60}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Keep Weekly Backups</label>
                    <input
                      type="number"
                      value={schedWeekly}
                      onChange={e => setSchedWeekly(parseInt(e.target.value) || 4)}
                      min={1}
                      max={24}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Keep Monthly Backups</label>
                    <input
                      type="number"
                      value={schedMonthly}
                      onChange={e => setSchedMonthly(parseInt(e.target.value) || 12)}
                      min={1}
                      max={36}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notification Email</label>
                  <input
                    type="email"
                    value={schedEmail}
                    onChange={e => setSchedEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    placeholder="sysadmin@domain.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Webhook URL (Optional)</label>
                  <input
                    type="url"
                    value={schedWebhook}
                    onChange={e => setSchedWebhook(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Military-Grade AES-256-GCM Encryption Setup */}
        {activeSettingsSubTab === 'encryption' && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>🔒 Military-Grade AES-256-GCM Encryption Setup</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protect database and sensitive wp-config credentials at rest with authenticated AEAD cipher streams.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                100,000 PBKDF2 Rounds
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center space-x-2.5 text-xs text-slate-800 font-bold cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={encEnabled}
                  onChange={e => setEncEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Encrypt all created backup archives with AES-256-GCM by default</span>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Master Backup Passphrase</label>
                <div className="flex items-center gap-2 max-w-xl">
                  <div className="relative flex-1">
                    <input
                      type={showEncPass ? 'text' : 'password'}
                      value={passphrase}
                      onChange={e => setPassphrase(e.target.value)}
                      className="w-full pr-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                      placeholder="Enter strong passphrase"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEncPass(!showEncPass)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showEncPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+';
                      let generated = '';
                      for (let i = 0; i < 32; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setPassphrase(generated);
                      setShowEncPass(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate Strong Key</span>
                  </button>
                </div>
                <p className="text-[11px] text-red-600 font-semibold mt-1.5">
                  ⚠️ Crucial: Save this passphrase securely in your password vault. Encrypted archives cannot be restored without it.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-950 text-xs">
                <strong>🛡️ AEAD Integrity Assurance:</strong> Galois/Counter Mode authenticates ciphertext against bit-flipping and PHP Object Injection. Streaming consumes &lt; 400 KB RAM regardless of file size.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Direct Server-to-Server P2P Migration Setup */}
        {activeSettingsSubTab === 'p2p' && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>🚀 Direct Server-to-Server (Peer-to-Peer) Migration Setup</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Move 100GB+ WordPress sites directly between hosts over an encrypted REST tunnel without downloading archives locally.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold">
                Zero Local Download
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center space-x-2.5 text-xs text-slate-800 font-bold cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={p2pEnabled}
                  onChange={e => setP2pEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Allow incoming/outgoing direct peer-to-peer streaming migration tunnels</span>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">One-Time 32-Character Pairing Token</label>
                <div className="flex items-center gap-2 max-w-xl">
                  <input
                    type="text"
                    value={p2pToken}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-900 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(p2pToken);
                      setTokenCopied(true);
                      setTimeout(() => setTokenCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    {tokenCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{tokenCopied ? 'Copied!' : 'Copy Token'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const hex = '0123456789abcdef';
                      let generated = '';
                      for (let i = 0; i < 32; i++) {
                        generated += hex.charAt(Math.floor(Math.random() * hex.length));
                      }
                      setP2pToken(generated);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Copy and paste this pairing token into the destination server to open the secure tunnel.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remote Destination WordPress Site URL</label>
                <input
                  type="url"
                  value={p2pRemoteUrl}
                  onChange={e => setP2pRemoteUrl(e.target.value)}
                  className="w-full max-w-xl px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  placeholder="https://new-hosting-domain.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Core Performance & Hosting Tuning */}
        {activeSettingsSubTab === 'engine' && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>⚙️ Core Engine &amp; Performance Settings</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shared hosting guardrails and database cursor paging tuning.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                Zero-Memory Cursor
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Database Cursor Chunk Size</label>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={e => setChunkSize(parseInt(e.target.value) || 2500)}
                  min={500}
                  max={10000}
                  step={500}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Rows fetched per query step (WHERE id &gt; ? LIMIT 2500). Prevents MySQL timeouts.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Memory Raise</label>
                <input
                  type="text"
                  value={memoryLimit}
                  onChange={e => setMemoryLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                  placeholder="256M"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Requested memory ceiling during heavy export cycles.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Execution Time (seconds)</label>
                <input
                  type="number"
                  value={maxExecutionTime}
                  onChange={e => setMaxExecutionTime(parseInt(e.target.value) || 300)}
                  min={30}
                  max={1800}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Time requested via set_time_limit(). Heartbeat resets timer per cycle.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Local Vault Retained Backups</label>
                <input
                  type="number"
                  value={retentionCount}
                  onChange={e => setRetentionCount(parseInt(e.target.value) || 5)}
                  min={1}
                  max={50}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Automatic pruning removes older backups once vault exceeds this count.</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>💾 Config stored directly in WordPress table</span>
            <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">wp_options</span>
            <span>with zero secondary plugin dependencies.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSettingsSavedNotice('✓ All core engine & extension settings saved successfully!');
              setTimeout(() => setSettingsSavedNotice(null), 3500);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Engine &amp; Extension Settings</span>
          </button>
        </div>
      </div>

      {/* 1-Click Activation Modal Simulation */}
      {activeModalExt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activeModalExt.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Activate {activeModalExt.name}
                  </h3>
                  <span className="text-xs text-slate-500">In-App Instant Capability Unlock</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveModalExt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 space-y-1">
                <strong className="block font-bold">Zero file downloads or secondary plugins needed!</strong>
                <p className="text-indigo-800">
                  This module is already pre-compiled inside your WP Bundle Migrator core. Completing activation unlocks the feature immediately.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  License Key or Subscription Token
                </label>
                <input
                  type="text"
                  value={inputLicenseKey}
                  onChange={e => setInputLicenseKey(e.target.value)}
                  placeholder={`WPB-PRO-${activeModalExt.id.toUpperCase()}-XXXX-XXXX`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enter your key, or use the instant test button below.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => executeActivation('WPB-PRO-QUICK-TEST-KEY')}
                disabled={isActivating}
                className="px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>⚡ Quick 1-Click Activate</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveModalExt(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeActivation(inputLicenseKey || 'WPB-PRO-VALIDATED')}
                  disabled={isActivating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isActivating ? (
                    <span>Unlocking...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Unlock</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streaming AES-256-GCM Encryption Architecture & Interactive Lab */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Dependency OpenSSL Streaming</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Authenticated AES-256-GCM Archive Encryption Lab
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Protects exported `.wpbundle` packages at rest and in transit. Uses PBKDF2 (100,000 iterations) and Galois/Counter Mode (GCM) for verifiable cryptographic integrity.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-slate-700">Test Integrity:</span>
            <button
              onClick={() => setTamperedCipher(!tamperedCipher)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                tamperedCipher 
                  ? 'bg-red-50 text-red-700 border-red-300' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tamperedCipher ? '⚠️ Simulated Bit-Flip Active' : 'Simulate 1-Bit Tamper'}
            </button>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Passphrase</label>
            <input
              type="text"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">PBKDF2 Key Derivation Iterations</label>
            <input
              type="number"
              value={pbkdf2Iterations}
              onChange={e => setPbkdf2Iterations(parseInt(e.target.value) || 100000)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
            />
          </div>
        </div>

        {/* Crypto Outputs */}
        <div className="bg-slate-900 rounded-xl p-4 text-white font-mono text-xs space-y-3 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
            <span>Cryptographic State (OpenSSL streaming cipher: aes-256-gcm)</span>
            <span className="text-emerald-400">RAM Overhead: &lt; 400 KB</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400">Derived Key (PBKDF2-SHA256, 32 bytes):</span>{' '}
              <span className="text-indigo-300">{derivedKeyHex}</span>
            </div>
            <div>
              <span className="text-slate-400">Initialization Vector (IV, 12 bytes):</span>{' '}
              <span className="text-amber-300">{ivHex}</span>
            </div>
            <div>
              <span className="text-slate-400">Authentication Tag (16 bytes, AEAD check):</span>{' '}
              <span className={tamperedCipher ? 'text-red-400 font-bold' : 'text-emerald-300'}>{authTagHex}</span>
            </div>
            <div>
              <span className="text-slate-400">Encrypted Stream Sample:</span>{' '}
              <span className="text-slate-300 truncate block">{ciphertextHex}</span>
            </div>
          </div>

          {/* Verification Status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {tamperedCipher ? (
              <div className="text-red-400 text-xs font-sans font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Verification FAILED: GCM auth tag mismatch! Archive was tampered with or corrupted. Decryption aborted before execution.</span>
              </div>
            ) : (
              <div className="text-emerald-400 text-xs font-sans font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cryptographic verification PASSED: AEAD tag validated. Zero risk of bit-flipping or deserialization exploits.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commercial Comparison Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Open Source Value Comparison vs Legacy Plugins
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Why our single-plugin unified architecture wins against predatory multi-plugin licensing.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Fair Single-Plugin Model
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Feature / Capability</th>
                <th className="py-3 px-4 bg-emerald-50 text-emerald-950 font-bold border-x border-emerald-100">
                  WP Bundle Migrator (Phase 4)
                </th>
                <th className="py-3 px-4">All-in-One WP Migration</th>
                <th className="py-3 px-4">UpdraftPlus</th>
                <th className="py-3 px-4">Duplicator Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Extension Architecture</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-900 font-bold border-x border-emerald-100">
                  Single Unified Plugin (1-Click)
                </td>
                <td className="py-3 px-4 text-rose-700 font-semibold">10 Separate ZIP Plugins</td>
                <td className="py-3 px-4 text-slate-600">Separate Addon Plugins</td>
                <td className="py-3 px-4 text-slate-600">Requires Pro Upgrade</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Cloud Storage (S3 / R2 / GCS)</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-900 font-bold border-x border-emerald-100">
                  100% Free (BYOS) + Opt. Vault
                </td>
                <td className="py-3 px-4 text-slate-600">$99 / year per provider</td>
                <td className="py-3 px-4 text-slate-600">Requires Premium ($70/yr)</td>
                <td className="py-3 px-4 text-slate-600">Requires Pro ($49+/yr)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">AWS SDK Disk Footprint</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-900 font-bold border-x border-emerald-100">
                  0 MB (Pure-PHP SigV4 Signer)
                </td>
                <td className="py-3 px-4 text-slate-600">28 MB+ bundled vendor</td>
                <td className="py-3 px-4 text-slate-600">32 MB+ bundled vendor</td>
                <td className="py-3 px-4 text-slate-600">24 MB+ bundled vendor</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">WP-CLI Command Automation</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-900 font-bold border-x border-emerald-100">
                  Included in Open Source Core
                </td>
                <td className="py-3 px-4 text-slate-600">Requires $99/yr Extension</td>
                <td className="py-3 px-4 text-slate-600">Requires Premium</td>
                <td className="py-3 px-4 text-slate-600">Requires Pro</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Multisite Subsite Extraction</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-900 font-bold border-x border-emerald-100">
                  Built-in Subsite Isolator
                </td>
                <td className="py-3 px-4 text-slate-600">$199 / year Multisite Extension</td>
                <td className="py-3 px-4 text-slate-600">Network Addon ($30)</td>
                <td className="py-3 px-4 text-slate-600">Requires $149/yr Tier</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Streaming AES-256 Encryption</td>
                <td className="py-3 px-4 bg-emerald-50/50 text-emerald-900 font-bold border-x border-emerald-100">
                  Native AES-256-GCM (AEAD)
                </td>
                <td className="py-3 px-4 text-slate-600">Proprietary format</td>
                <td className="py-3 px-4 text-slate-600">Basic Zip password</td>
                <td className="py-3 px-4 text-slate-600">AES-256 (Pro only)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
