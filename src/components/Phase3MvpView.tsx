import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Terminal, 
  AlertCircle,
  FileArchive,
  Layers,
  ArrowRight,
  Clock,
  Cpu,
  Trash2,
  Plus,
  Sliders,
  CheckSquare,
  Sparkles,
  Box,
  FileCode,
  Globe,
  Zap,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Copy,
  FolderArchive,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { BackupItem } from '../types';
import { INITIAL_BACKUPS } from '../data/phase3CodeData';

type SubTab = 'export' | 'import' | 'backups' | 'diagnostics';

interface StepProgress {
  currentStep: string;
  table: string;
  rowsDumped: number;
  totalRows: number;
  filesProcessed: number;
  totalFiles: number;
  memoryMb: number;
  elapsedSec: number;
  tickCount: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  log: string[];
}

export type ExportPreset = 'full' | 'turnkey_full' | 'db_only' | 'media_only' | 'custom';

export const Phase3MvpView: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('export');
  
  // Export Preset & Scope
  const [exportPreset, setExportPreset] = useState<ExportPreset>('full');

  // Granular Component Selection
  const [includeDb, setIncludeDb] = useState(true);
  const [includeUploads, setIncludeUploads] = useState(true);
  const [includePlugins, setIncludePlugins] = useState(true);
  const [includeThemes, setIncludeThemes] = useState(true);
  const [includeMuPlugins, setIncludeMuPlugins] = useState(true);
  const [includeLanguages, setIncludeLanguages] = useState(true);
  const [includeRootFiles, setIncludeRootFiles] = useState(true);
  const [includeWpCore, setIncludeWpCore] = useState(false);

  // Optimizations
  const [excludeSpam, setExcludeSpam] = useState(true);
  const [excludeRevisions, setExcludeRevisions] = useState(true);
  const [excludeTransients, setExcludeTransients] = useState(true);

  // Backups Vault filter & search state
  const [backupSearch, setBackupSearch] = useState('');
  const [backupFilter, setBackupFilter] = useState<'all' | 'turnkey' | 'standard' | 'db' | 'media'>('all');
  const [backupToDelete, setBackupToDelete] = useState<BackupItem | null>(null);

  // Two-way synchronization helper: determine preset from checkboxes
  const detectPresetFromFlags = (
    db: boolean,
    uploads: boolean,
    plugins: boolean,
    themes: boolean,
    mu: boolean,
    lang: boolean,
    root: boolean,
    core: boolean
  ): ExportPreset => {
    if (db && uploads && plugins && themes && mu && lang && root && core) {
      return 'turnkey_full';
    }
    if (db && uploads && plugins && themes && mu && lang && root && !core) {
      return 'full';
    }
    if (db && !uploads && !plugins && !themes && !mu && !lang && !root && !core) {
      return 'db_only';
    }
    if (!db && uploads && !plugins && !themes && !mu && !lang && !root && !core) {
      return 'media_only';
    }
    return 'custom';
  };

  // Handler for preset selection -> updates granular checkboxes
  const handleSelectPreset = (preset: ExportPreset) => {
    setExportPreset(preset);
    if (preset === 'turnkey_full') {
      setIncludeDb(true);
      setIncludeUploads(true);
      setIncludePlugins(true);
      setIncludeThemes(true);
      setIncludeMuPlugins(true);
      setIncludeLanguages(true);
      setIncludeRootFiles(true);
      setIncludeWpCore(true);
    } else if (preset === 'full') {
      setIncludeDb(true);
      setIncludeUploads(true);
      setIncludePlugins(true);
      setIncludeThemes(true);
      setIncludeMuPlugins(true);
      setIncludeLanguages(true);
      setIncludeRootFiles(true);
      setIncludeWpCore(false);
    } else if (preset === 'db_only') {
      setIncludeDb(true);
      setIncludeUploads(false);
      setIncludePlugins(false);
      setIncludeThemes(false);
      setIncludeMuPlugins(false);
      setIncludeLanguages(false);
      setIncludeRootFiles(false);
      setIncludeWpCore(false);
    } else if (preset === 'media_only') {
      setIncludeDb(false);
      setIncludeUploads(true);
      setIncludePlugins(false);
      setIncludeThemes(false);
      setIncludeMuPlugins(false);
      setIncludeLanguages(false);
      setIncludeRootFiles(false);
      setIncludeWpCore(false);
    }
  };

  // Handler for granular checkbox changes -> dynamically switches preset to custom or matching preset
  const handleToggleComponent = (
    key: 'db' | 'uploads' | 'plugins' | 'themes' | 'mu' | 'lang' | 'root' | 'core',
    val: boolean
  ) => {
    const nextState = {
      db: key === 'db' ? val : includeDb,
      uploads: key === 'uploads' ? val : includeUploads,
      plugins: key === 'plugins' ? val : includePlugins,
      themes: key === 'themes' ? val : includeThemes,
      mu: key === 'mu' ? val : includeMuPlugins,
      lang: key === 'lang' ? val : includeLanguages,
      root: key === 'root' ? val : includeRootFiles,
      core: key === 'core' ? val : includeWpCore,
    };

    if (key === 'db') setIncludeDb(val);
    if (key === 'uploads') setIncludeUploads(val);
    if (key === 'plugins') setIncludePlugins(val);
    if (key === 'themes') setIncludeThemes(val);
    if (key === 'mu') setIncludeMuPlugins(val);
    if (key === 'lang') setIncludeLanguages(val);
    if (key === 'root') setIncludeRootFiles(val);
    if (key === 'core') setIncludeWpCore(val);

    const detected = detectPresetFromFlags(
      nextState.db,
      nextState.uploads,
      nextState.plugins,
      nextState.themes,
      nextState.mu,
      nextState.lang,
      nextState.root,
      nextState.core
    );
    setExportPreset(detected);
  };

  // Quick Action Buttons
  const handleSelectAll = () => handleSelectPreset('turnkey_full');
  const handleResetRecommended = () => handleSelectPreset('full');
  const handleClearAll = () => {
    setIncludeDb(false);
    setIncludeUploads(false);
    setIncludePlugins(false);
    setIncludeThemes(false);
    setIncludeMuPlugins(false);
    setIncludeLanguages(false);
    setIncludeRootFiles(false);
    setIncludeWpCore(false);
    setExportPreset('custom');
  };

  // Calculate live dynamic size
  const totalComponentsSelected = [
    includeDb,
    includeUploads,
    includePlugins,
    includeThemes,
    includeMuPlugins,
    includeLanguages,
    includeRootFiles,
    includeWpCore,
  ].filter(Boolean).length;

  const estimatedRawBytes =
    (includeDb ? 24000000 : 0) +
    (includeUploads ? 125000000 : 0) +
    (includePlugins ? 42000000 : 0) +
    (includeThemes ? 18000000 : 0) +
    (includeMuPlugins ? 1200000 : 0) +
    (includeLanguages ? 4500000 : 0) +
    (includeRootFiles ? 80000 : 0) +
    (includeWpCore ? 48000000 : 0);

  const estimatedCompressedMb = (estimatedRawBytes * 0.365 / (1024 * 1024)).toFixed(1);

  // Import configuration
  const [sourceUrl, setSourceUrl] = useState('https://staging-client.internal');
  const [targetUrl, setTargetUrl] = useState('https://production-store.com');
  const [selectedFile, setSelectedFile] = useState<string>('backup-2026-09-10-production-full.wpbundle');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Backups list state
  const [backups, setBackups] = useState<BackupItem[]>(INITIAL_BACKUPS);
  const [activeManifestModal, setActiveManifestModal] = useState<BackupItem | null>(null);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Export engine state
  const [exportProgress, setExportProgress] = useState<StepProgress>({
    currentStep: 'Ready',
    table: '',
    rowsDumped: 0,
    totalRows: 34500,
    filesProcessed: 0,
    totalFiles: 1840,
    memoryMb: 8.2,
    elapsedSec: 0,
    tickCount: 0,
    status: 'idle',
    log: []
  });

  // Import engine state
  const [importProgress, setImportProgress] = useState<StepProgress>({
    currentStep: 'Ready',
    table: '',
    rowsDumped: 0,
    totalRows: 34500,
    filesProcessed: 0,
    totalFiles: 1840,
    memoryMb: 9.4,
    elapsedSec: 0,
    tickCount: 0,
    status: 'idle',
    log: []
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Filtered Backups
  const filteredBackups = useMemo(() => {
    return backups.filter(b => {
      const matchesSearch = b.filename.toLowerCase().includes(backupSearch.toLowerCase()) ||
                            b.createdAt.includes(backupSearch);
      if (!matchesSearch) return false;
      if (backupFilter === 'all') return true;
      if (backupFilter === 'turnkey') return b.components.includes('core');
      if (backupFilter === 'standard') return !b.components.includes('core') && b.components.includes('database') && b.components.includes('uploads');
      if (backupFilter === 'db') return b.components.includes('database') && b.components.length === 1;
      if (backupFilter === 'media') return b.components.includes('uploads') && b.components.length === 1;
      return true;
    });
  }, [backups, backupSearch, backupFilter]);

  // Export Simulator respecting EXACT granular selections!
  const startExport = () => {
    if (totalComponentsSelected === 0) {
      return;
    }

    const jobToken = '4b29c01f-' + Math.random().toString(16).substring(2, 10);
    const activeComponentsList: string[] = [];
    if (includeDb) activeComponentsList.push('database');
    if (includeUploads) activeComponentsList.push('uploads');
    if (includePlugins) activeComponentsList.push('plugins');
    if (includeThemes) activeComponentsList.push('themes');
    if (includeMuPlugins) activeComponentsList.push('mu-plugins');
    if (includeLanguages) activeComponentsList.push('languages');
    if (includeRootFiles) activeComponentsList.push('root-files');
    if (includeWpCore) activeComponentsList.push('core');

    const generatedFilename = `backup-${new Date().toISOString().slice(0, 10)}-${exportPreset}.wpbundle`;

    const initialLogs = [
      `[0.00s] Initializing job token: ${jobToken}`,
      `[0.08s] Scope evaluated: ${exportPreset.toUpperCase()} (${totalComponentsSelected}/8 components selected)`,
      `[0.12s] Granular Inclusions: [${activeComponentsList.join(', ')}]`,
      `[0.22s] Storage adapter: LocalStorageAdapter (uploads/wp-bundle-migrator-temp/)`,
      `[0.35s] StepExecutionContext initialized: budget 6.00s, max 24MB RAM`,
    ];

    if (includeDb) {
      initialLogs.push(`[0.45s] DDL schema dump initiated for 24 tables with cursor seek...`);
    } else {
      initialLogs.push(`[0.45s] Database tables EXCLUDED by granular selection: skipping SQL dump.`);
    }

    setExportProgress({
      currentStep: includeDb ? 'VALIDATING_DB' : 'SCANNING_FILES',
      table: includeDb ? 'wp_options' : 'Filesystem',
      rowsDumped: 0,
      totalRows: includeDb ? 34500 : 0,
      filesProcessed: 0,
      totalFiles: includeUploads || includePlugins || includeThemes || includeWpCore ? 1840 : 12,
      memoryMb: 9.1,
      elapsedSec: 0,
      tickCount: 1,
      status: 'running',
      log: initialLogs
    });

    const tables = includeDb ? [
      { name: 'wp_options', rows: 850 },
      { name: 'wp_users', rows: 120 },
      { name: 'wp_posts', rows: 8400 },
      { name: 'wp_postmeta', rows: 21500 },
      { name: 'wp_terms', rows: 630 },
      { name: 'wp_comments', rows: 3000 }
    ] : [];

    let currentTableIndex = 0;
    let accumulatedRows = 0;
    let tickCounter = 1;
    let seconds = 0;

    timerRef.current = setInterval(() => {
      seconds += 0.4;
      tickCounter++;

      if (includeDb && currentTableIndex < tables.length) {
        const cur = tables[currentTableIndex];
        accumulatedRows += Math.min(cur.rows, 1200);

        setExportProgress(prev => ({
          ...prev,
          currentStep: 'EXPORTING_DB',
          table: cur.name,
          rowsDumped: accumulatedRows,
          elapsedSec: Number(seconds.toFixed(1)),
          tickCount: tickCounter,
          memoryMb: Number((11.2 + Math.random() * 2.1).toFixed(1)),
          log: [
            ...prev.log.slice(-12),
            `[${seconds.toFixed(2)}s] Tick #${tickCounter}: Cursor seek slice dumped from ${cur.name} (cursor > ${accumulatedRows})`
          ]
        }));

        if (accumulatedRows >= (currentTableIndex === 0 ? 850 : 15000)) {
          currentTableIndex++;
        }
      } else {
        // Filesystem archiving phase
        const hasFiles = includeUploads || includePlugins || includeThemes || includeWpCore || includeRootFiles || includeMuPlugins || includeLanguages;
        
        if (hasFiles) {
          setExportProgress(prev => {
            const stepIncrement = includeUploads ? 320 : 600;
            const targetFiles = includeUploads ? 1840 : 420;
            const files = Math.min(targetFiles, prev.filesProcessed + stepIncrement);
            const isDone = files >= targetFiles;

            if (isDone) {
              if (timerRef.current) clearInterval(timerRef.current);
              
              // Authoritatively add the exact generated backup to the vault!
              const newBackupItem: BackupItem = {
                id: `bak-${Date.now()}`,
                filename: generatedFilename,
                sizeBytes: Math.round(estimatedRawBytes * 0.365),
                wpVersion: '6.7.1',
                phpVersion: '8.4.1',
                checksum: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                components: activeComponentsList
              };
              setBackups(currentBackups => [newBackupItem, ...currentBackups]);

              return {
                ...prev,
                currentStep: 'COMPLETED',
                filesProcessed: targetFiles,
                status: 'completed',
                elapsedSec: Number(seconds.toFixed(1)),
                log: [
                  ...prev.log.slice(-12),
                  `[${seconds.toFixed(2)}s] Streaming TAR/ZIP container closed with zero memory spikes.`,
                  `[${(seconds + 0.1).toFixed(2)}s] manifest.json generated: ${totalComponentsSelected} components, SHA-256 verified.`,
                  `[${(seconds + 0.2).toFixed(2)}s] Job COMPLETED successfully. Stored in Backups Vault: ${generatedFilename} (~${estimatedCompressedMb} MB).`
                ]
              };
            }

            const activeDir = includeUploads 
              ? `wp-content/uploads/2026/10/photo_${files}.webp`
              : includePlugins 
              ? `wp-content/plugins/plugin_${files}.php` 
              : `wp-content/themes/theme_asset_${files}.css`;

            return {
              ...prev,
              currentStep: 'PACKAGING_FILES',
              table: includeWpCore ? 'Core & Content' : 'Themes & Content',
              filesProcessed: files,
              totalFiles: targetFiles,
              elapsedSec: Number(seconds.toFixed(1)),
              tickCount: tickCounter,
              memoryMb: Number((12.5 + Math.random() * 1.8).toFixed(1)),
              log: [
                ...prev.log.slice(-12),
                `[${seconds.toFixed(2)}s] Streaming file chunk: ${activeDir}`
              ]
            };
          });
        } else {
          // Finished immediately (e.g. DB only)
          if (timerRef.current) clearInterval(timerRef.current);

          const newBackupItem: BackupItem = {
            id: `bak-${Date.now()}`,
            filename: generatedFilename,
            sizeBytes: Math.round(estimatedRawBytes * 0.365),
            wpVersion: '6.7.1',
            phpVersion: '8.4.1',
            checksum: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            components: activeComponentsList
          };
          setBackups(currentBackups => [newBackupItem, ...currentBackups]);

          setExportProgress(prev => ({
            ...prev,
            currentStep: 'COMPLETED',
            status: 'completed',
            elapsedSec: Number(seconds.toFixed(1)),
            log: [
              ...prev.log.slice(-12),
              `[${seconds.toFixed(2)}s] DB-Only export stream finalized. SQL dump size: ~24 MB.`,
              `[${(seconds + 0.1).toFixed(2)}s] manifest.json written with SHA-256 checksum.`,
              `[${(seconds + 0.2).toFixed(2)}s] Export complete! Added to Backups Vault: ${generatedFilename}`
            ]
          }));
        }
      }
    }, 380);
  };

  // Import Simulator
  const startImport = () => {
    setImportProgress({
      currentStep: 'EXTRACTING',
      table: selectedFile || 'package.wpbundle',
      rowsDumped: 0,
      totalRows: 34500,
      filesProcessed: 0,
      totalFiles: 1840,
      memoryMb: 10.4,
      elapsedSec: 0,
      tickCount: 1,
      status: 'running',
      log: [
        '[0.00s] Pre-flight inspection: Verified manifest.json checksum match',
        '[0.15s] Zip Slip Defense: Canonicalizing relative paths against ABSPATH',
        '[0.32s] Beginning streaming extraction of database.sql.gz...'
      ]
    });

    let seconds = 0;
    let tickCounter = 1;
    let step = 0;

    timerRef.current = setInterval(() => {
      seconds += 0.5;
      tickCounter++;
      step++;

      if (step === 2) {
        setImportProgress(prev => ({
          ...prev,
          currentStep: 'RESTORING_DB',
          table: 'wp_posts',
          rowsDumped: 14200,
          elapsedSec: Number(seconds.toFixed(1)),
          tickCount: tickCounter,
          log: [
            ...prev.log.slice(-12),
            `[${seconds.toFixed(2)}s] DatabaseBatchWriter: Executing multi-row batch inserts (SET FOREIGN_KEY_CHECKS=0)`
          ]
        }));
      } else if (step === 4) {
        setImportProgress(prev => ({
          ...prev,
          currentStep: 'UPDATING_URLS',
          table: 'SerializationReplacer',
          rowsDumped: 34500,
          elapsedSec: Number(seconds.toFixed(1)),
          tickCount: tickCounter,
          log: [
            ...prev.log.slice(-12),
            `[${seconds.toFixed(2)}s] SerializationReplacer: Replacing '${sourceUrl}' with '${targetUrl}'`,
            `[${(seconds + 0.1).toFixed(2)}s] Evaluated 1,420 serialized options with raw byte recalculation`
          ]
        }));
      } else if (step >= 6) {
        if (timerRef.current) clearInterval(timerRef.current);
        setImportProgress(prev => ({
          ...prev,
          currentStep: 'COMPLETED',
          status: 'completed',
          elapsedSec: Number(seconds.toFixed(1)),
          log: [
            ...prev.log.slice(-12),
            `[${seconds.toFixed(2)}s] Cache flush: wp_cache_flush() executed`,
            `[${(seconds + 0.1).toFixed(2)}s] Permalinks regenerated: flush_rewrite_rules(false)`,
            `[${(seconds + 0.2).toFixed(2)}s] Migration successfully restored with zero serialized corruption.`
          ]
        }));
      }
    }, 500);
  };

  const handleCreateSnapshot = () => {
    const newBak: BackupItem = {
      id: `bak-${Date.now()}`,
      filename: `backup-${new Date().toISOString().slice(0, 10)}-manual-snapshot.wpbundle`,
      sizeBytes: 89400000,
      wpVersion: '6.7.1',
      phpVersion: '8.4.1',
      checksum: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      components: ['database', 'plugins', 'themes', 'uploads']
    };
    setBackups([newBak, ...backups]);
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
    setBackupToDelete(null);
  };

  const handleTriggerRestoreFromVault = (filename: string) => {
    setSelectedFile(filename);
    setSubTab('import');
  };

  const handleCopyManifest = (bak: BackupItem) => {
    const text = JSON.stringify({
      wpbundle_version: '1.0.0',
      created_at: bak.createdAt,
      generator: 'WP Bundle Migrator v1.0.0',
      environment: {
        wordpress: bak.wpVersion,
        php: bak.phpVersion,
        db_engine: 'MySQL 8.0.36',
        table_prefix: 'wp_'
      },
      checksum_sha256: bak.checksum,
      components: bak.components,
      compression: 'gzip-chunks',
      tar_ustar_compliant: true
    }, null, 2);

    navigator.clipboard.writeText(text);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* WordPress Admin Modern Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs text-lg">
              WP
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>Tools</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-900">WP Bundle Migrator</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-500">v1.0.0</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Migration &amp; Backup Studio
              </h2>
            </div>
          </div>

          {/* Clean Unboxed System Status */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <span className="inline-flex items-center space-x-1.5 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Engine Ready</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>PHP 8.4.1</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>WP 6.7.1</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="tabular-nums font-mono">24MB RAM Cap</span>
          </div>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-6 p-1 bg-slate-100/80 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubTab('export')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'export'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Bundle</span>
          </button>
          <button
            onClick={() => setSubTab('import')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'import'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import &amp; Restore</span>
          </button>
          <button
            onClick={() => setSubTab('backups')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'backups'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Backups Vault ({backups.length})</span>
          </button>
          <button
            onClick={() => setSubTab('diagnostics')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'diagnostics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hosting Diagnostics</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EXPORT BUNDLE */}
      {subTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Export Configuration (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Export WordPress Bundle (.wpbundle)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Package site components into a standalone, portable archive with constant O(1) RAM usage.
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 font-medium">
                  Scope: <span className="font-semibold text-slate-900 capitalize">{exportPreset.replace('_', ' ')}</span>
                </div>
              </div>

              {/* 1. Export Preset & Scope */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>1. Export Preset &amp; Scope</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a preset or customize specific components below. Granular choices dynamically synchronize.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Preset 1: Standard Complete */}
                  <div
                    onClick={() => handleSelectPreset('full')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      exportPreset === 'full'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="preset_radio"
                          checked={exportPreset === 'full'}
                          onChange={() => handleSelectPreset('full')}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs font-bold text-slate-900">Standard Migration</span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700">Recommended</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Database, Uploads, Plugins, Themes, Mu-Plugins, Languages &amp; Configs. Excludes core binaries.
                    </p>
                  </div>

                  {/* Preset 2: Turnkey Clone */}
                  <div
                    onClick={() => handleSelectPreset('turnkey_full')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      exportPreset === 'turnkey_full'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="preset_radio"
                          checked={exportPreset === 'turnkey_full'}
                          onChange={() => handleSelectPreset('turnkey_full')}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs font-bold text-slate-900">Complete Turnkey Clone</span>
                      </div>
                      <span className="text-[11px] font-medium text-amber-700">Bare-Metal</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Includes WordPress Core (wp-admin, wp-includes), root files, and all site databases and media.
                    </p>
                  </div>

                  {/* Preset 3: Database Only */}
                  <div
                    onClick={() => handleSelectPreset('db_only')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      exportPreset === 'db_only'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="preset_radio"
                          checked={exportPreset === 'db_only'}
                          onChange={() => handleSelectPreset('db_only')}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs font-bold text-slate-900">Database Only</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">~24 MB</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      All SQL tables dumped via indexed cursor seek pagination. Very fast and lightweight.
                    </p>
                  </div>

                  {/* Preset 4: Media Only */}
                  <div
                    onClick={() => handleSelectPreset('media_only')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      exportPreset === 'media_only'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="preset_radio"
                          checked={exportPreset === 'media_only'}
                          onChange={() => handleSelectPreset('media_only')}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-xs font-bold text-slate-900">Media Library Only</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">~125 MB</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      All uploads (images, PDFs, media attachments) from wp-content/uploads directory.
                    </p>
                  </div>
                </div>

                {/* Custom Preset Highlight */}
                {exportPreset === 'custom' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-800">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        <strong>Custom Scope Active:</strong> Granular selections below dictate archive contents.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetRecommended}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                    >
                      Reset to Standard
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Granular Component Selection */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>2. Granular Component Selection</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle exact directories and tables. The archive strictly respects your choices.
                    </p>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRecommended}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Recommended
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Component 1: Database */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeDb ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeDb}
                        onChange={e => handleToggleComponent('db', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Database Tables (SQL)</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~24 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">24 tables, ~34,500 rows with seek cursor</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 2: Media Uploads */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeUploads ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeUploads}
                        onChange={e => handleToggleComponent('uploads', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Media Library (/uploads)</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~125 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Images, PDFs, media attachments</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 3: Plugins */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includePlugins ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includePlugins}
                        onChange={e => handleToggleComponent('plugins', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Installed Plugins (/plugins)</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~42 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">All active and inactive plugins</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 4: Themes */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeThemes ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeThemes}
                        onChange={e => handleToggleComponent('themes', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Themes (/themes)</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~18 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Parent and active child themes</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 5: Must-Use Plugins */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeMuPlugins ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeMuPlugins}
                        onChange={e => handleToggleComponent('mu', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Must-Use (/mu-plugins)</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~1.2 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Host drop-ins and automatic loaders</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 6: Languages */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeLanguages ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeLanguages}
                        onChange={e => handleToggleComponent('lang', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Languages (/languages)</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~4.5 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Translation catalogs and PO/MO files</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 7: Root Config Files */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeRootFiles ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeRootFiles}
                        onChange={e => handleToggleComponent('root', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">Root Config Files</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~80 KB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">wp-config.php, .htaccess, robots.txt</p>
                      </div>
                    </div>
                  </label>

                  {/* Component 8: WordPress Core Files */}
                  <label className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    includeWpCore ? 'border-slate-300 bg-slate-50/70 shadow-2xs' : 'border-slate-200 hover:bg-slate-50/50 bg-white opacity-60'
                  }`}>
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={includeWpCore}
                        onChange={e => handleToggleComponent('core', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">WordPress Core Files</p>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">~48 MB</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">wp-admin, wp-includes, and root core files</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Optimizations & Exclusions */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Optimizations &amp; Exclusions</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeSpam}
                      onChange={e => setExcludeSpam(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-slate-800 font-medium">Exclude Spam &amp; Trash</span>
                  </label>
                  <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeRevisions}
                      onChange={e => setExcludeRevisions(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-slate-800 font-medium">Exclude Revisions</span>
                  </label>
                  <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeTransients}
                      onChange={e => setExcludeTransients(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-slate-800 font-medium">Exclude Transients</span>
                  </label>
                </div>
              </div>

              {/* Zero Components Selected Warning */}
              {totalComponentsSelected === 0 && (
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl flex items-start space-x-3 text-amber-900 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-sm">No Components Selected</strong>
                    <span className="mt-0.5 block leading-relaxed">
                      All components have been excluded. An empty bundle archive cannot be generated. Please select at least one component (e.g., Database or Media) to proceed.
                    </span>
                  </div>
                </div>
              )}

              {/* Streaming Guarantee Notice */}
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Zero-Memory Guarantee:</strong> Archives stream directly in 64KB chunks. Flat memory consumption operates within 16–24MB regardless of site size.
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={startExport}
                disabled={exportProgress.status === 'running' || totalComponentsSelected === 0}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {exportProgress.status === 'running'
                    ? 'Export in Progress...'
                    : totalComponentsSelected === 0
                    ? 'Select at Least 1 Component'
                    : `Start Streaming Export (${totalComponentsSelected} of 8 components · ~${estimatedCompressedMb} MB)`}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Blueprint & Execution Monitor (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Blueprint & Size Estimator Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Box className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Bundle Blueprint</h4>
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {totalComponentsSelected} of 8 Selected
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Selected Scope</span>
                  <span className="font-semibold text-slate-900 capitalize">{exportPreset.replace('_', ' ')}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Uncompressed Size</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    ~{(estimatedRawBytes / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-slate-900 font-semibold">Estimated Archive Size</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-700 text-sm">
                    ~{estimatedCompressedMb} MB
                  </span>
                </div>
              </div>

              {/* Composition text with typographic separators */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Included Components:
                </span>
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5 leading-relaxed">
                  {totalComponentsSelected === 0 ? (
                    <span className="text-rose-600 italic">None selected</span>
                  ) : (
                    <>
                      {includeDb && <span>Database</span>}
                      {includeDb && (includeUploads || includePlugins || includeThemes || includeMuPlugins || includeLanguages || includeRootFiles || includeWpCore) && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includeUploads && <span>Media</span>}
                      {includeUploads && (includePlugins || includeThemes || includeMuPlugins || includeLanguages || includeRootFiles || includeWpCore) && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includePlugins && <span>Plugins</span>}
                      {includePlugins && (includeThemes || includeMuPlugins || includeLanguages || includeRootFiles || includeWpCore) && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includeThemes && <span>Themes</span>}
                      {includeThemes && (includeMuPlugins || includeLanguages || includeRootFiles || includeWpCore) && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includeMuPlugins && <span>Mu-Plugins</span>}
                      {includeMuPlugins && (includeLanguages || includeRootFiles || includeWpCore) && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includeLanguages && <span>Languages</span>}
                      {includeLanguages && (includeRootFiles || includeWpCore) && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includeRootFiles && <span>Root Config</span>}
                      {includeRootFiles && includeWpCore && <span aria-hidden="true" className="text-slate-300">·</span>}
                      {includeWpCore && <span>Core Files</span>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Live Metrics Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Streaming Status
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {exportProgress.currentStep}
                  </h4>
                </div>
                <div className="text-right text-xs">
                  {exportProgress.status === 'completed' && (
                    <span className="font-semibold text-emerald-700">Completed</span>
                  )}
                  {exportProgress.status === 'running' && (
                    <span className="font-semibold text-indigo-600">Processing...</span>
                  )}
                  {exportProgress.status === 'idle' && (
                    <span className="text-slate-500">Awaiting Trigger</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    exportProgress.status === 'completed'
                      ? 'bg-emerald-600 w-full'
                      : exportProgress.status === 'running'
                      ? 'bg-indigo-600 w-2/3 animate-pulse'
                      : 'w-0'
                  }`}
                ></div>
              </div>

              {/* Telemetry Figures */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-500">Dumped Rows</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                    {exportProgress.rowsDumped.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-500">Memory Allocation</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                    {exportProgress.memoryMb} MB
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-500">Elapsed Time</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                    {exportProgress.elapsedSec}s
                  </p>
                </div>
              </div>

              {/* Completed Success Callout */}
              {exportProgress.status === 'completed' && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Export Created &amp; Saved to Backups Vault</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Archive contains exactly {totalComponentsSelected} components (~{estimatedCompressedMb} MB) with verified SHA-256 hash.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSubTab('backups')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                    >
                      View in Backups Vault
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostic Log Output */}
            <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Streaming Event Log</span>
                </span>
                <span className="text-[10px] text-slate-500">REST /v1/export</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {exportProgress.log.length === 0 ? (
                  <p className="text-slate-600 italic">No job execution started yet.</p>
                ) : (
                  exportProgress.log.map((entry, idx) => (
                    <p key={idx} className="text-slate-300 hover:text-white transition-colors leading-relaxed">
                      {entry}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: IMPORT & RESTORE */}
      {subTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Restore or Migrate Site</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a <code className="text-slate-800 font-mono">.wpbundle</code> file or select an archive from your local vault.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0].name);
                }
              }}
              className={`p-6 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                isDraggingFile ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                Drag &amp; drop your .wpbundle or .bundle.zip here
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports chunked background upload bypassing server upload limits
              </p>
            </div>

            {/* Existing Vault Archive Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Or Select From Backups Vault:
              </label>
              <select
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-2xs focus:ring-indigo-500 focus:border-indigo-500 p-2.5 bg-white cursor-pointer"
              >
                {backups.map(b => (
                  <option key={b.id} value={b.filename}>
                    {b.filename} ({(b.sizeBytes / (1024 * 1024)).toFixed(1)} MB · {b.createdAt})
                  </option>
                ))}
              </select>
            </div>

            {/* Domain Find & Replace */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Domain Search &amp; Replace
                </label>
                <span className="text-xs text-emerald-700 font-medium">Serialization Safe</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Source URL (in backup)</label>
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={e => setSourceUrl(e.target.value)}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Target URL (current site)</label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    className="w-full text-xs rounded-lg border-slate-300 p-2 font-mono shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3.5 bg-amber-50/70 rounded-xl text-xs text-amber-900 border border-amber-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Restore Safety:</strong> Restoring this archive replaces matching database tables. A pre-restore checkpoint is automatically captured.
              </span>
            </div>

            <button
              onClick={startImport}
              disabled={importProgress.status === 'running'}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{importProgress.status === 'running' ? 'Restoration in Progress...' : 'Begin Site Restoration'}</span>
            </button>
          </div>

          {/* Import Telemetry & Stream Log */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Restore Lifecycle
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    Phase: {importProgress.currentStep}
                  </h4>
                </div>
                <div className="text-right text-xs">
                  {importProgress.status === 'completed' && (
                    <span className="font-semibold text-emerald-700">Restoration Succeeded</span>
                  )}
                  {importProgress.status === 'running' && (
                    <span className="font-semibold text-indigo-600">Executing...</span>
                  )}
                  {importProgress.status === 'idle' && (
                    <span className="text-slate-500">Ready</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    importProgress.status === 'completed'
                      ? 'bg-emerald-600 w-full'
                      : importProgress.status === 'running'
                      ? 'bg-indigo-600 w-3/4 animate-pulse'
                      : 'w-0'
                  }`}
                ></div>
              </div>

              {importProgress.status === 'completed' && (
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Site Restored Successfully</strong>
                    <span className="leading-relaxed text-emerald-800 mt-0.5 block">
                      All tables restored, serialized strings recalculated byte-for-byte, and object caches flushed.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span>Restore Stream Execution</span>
                <span className="text-emerald-400">Zip Slip Shield: Active</span>
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {importProgress.log.length === 0 ? (
                  <p className="text-slate-600 italic">Restoration runner awaiting trigger.</p>
                ) : (
                  importProgress.log.map((entry, idx) => (
                    <p key={idx} className="text-slate-300 hover:text-white leading-relaxed">
                      {entry}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: BACKUPS VAULT */}
      {subTab === 'backups' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Protected Local Backup Vault</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Archives located in <code className="font-mono text-slate-700">uploads/wp-bundle-migrator-temp/</code> with strict .htaccess restrictions.
              </p>
            </div>
            <button
              onClick={handleCreateSnapshot}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Instant Snapshot</span>
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search backups by name or date..."
                value={backupSearch}
                onChange={e => setBackupSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setBackupFilter('all')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  backupFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({backups.length})
              </button>
              <button
                onClick={() => setBackupFilter('turnkey')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  backupFilter === 'turnkey' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Turnkey
              </button>
              <button
                onClick={() => setBackupFilter('standard')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  backupFilter === 'standard' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setBackupFilter('db')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  backupFilter === 'db' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Database
              </button>
              <button
                onClick={() => setBackupFilter('media')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  backupFilter === 'media' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Media
              </button>
            </div>
          </div>

          {/* Backups Table / List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {filteredBackups.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <FolderArchive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No backups found</p>
                <p className="mt-1">Try clearing your search query or start an export from the Export tab.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredBackups.map(bak => (
                  <div
                    key={bak.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start space-x-3.5">
                      <FileArchive className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 font-mono">
                          {bak.filename}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
                          <span className="font-mono tabular-nums font-semibold text-slate-700">
                            {(bak.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>WP {bak.wpVersion}</span>
                          <span aria-hidden="true">·</span>
                          <span>PHP {bak.phpVersion}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{bak.createdAt}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1">
                          <span>Includes:</span>
                          <span className="capitalize text-slate-700 font-medium">{bak.components.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start md:self-auto">
                      <button
                        onClick={() => handleTriggerRestoreFromVault(bak.filename)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => setActiveManifestModal(bak)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Manifest
                      </button>
                      <button
                        onClick={() => setBackupToDelete(bak)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Backup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: DIAGNOSTICS */}
      {subTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">PHP &amp; Shared Hosting Runtime</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">PHP Version</span>
                <span className="font-mono font-semibold text-emerald-700">8.4.1 (Compatible 7.4 - 8.4+)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Configured Memory Limit</span>
                <span className="font-mono text-slate-800">128M (Engine operates in &lt; 24M)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Max Execution Time</span>
                <span className="font-mono text-slate-800">30s (Time-slices capped at 6.0s)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">upload_max_filesize</span>
                <span className="font-mono text-indigo-600">2M (Bypassed via 1MB chunked streams)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">LiteSpeed Web Server</span>
                <span className="font-mono text-emerald-700">Detected &amp; noabort headers active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Security &amp; Integrity Controls</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Zip Slip Defense (CWE-22)</span>
                <span className="font-mono font-semibold text-emerald-700">realpath() Canonicalizer Active</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">POP Gadget Shield (CWE-502)</span>
                <span className="font-mono font-semibold text-emerald-700">allowed_classes=&gt;false Enforced</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">PHP2Shell Sanitizer</span>
                <span className="font-mono font-semibold text-emerald-700">Header Pre-validation Active</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Vault Apache Protection</span>
                <span className="font-mono font-semibold text-emerald-700">Require all denied (.htaccess)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">REST API Permissions</span>
                <span className="font-mono text-slate-800">current_user_can(&apos;manage_options&apos;)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {backupToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Permanent Deletion</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="font-mono text-slate-900">{backupToDelete.filename}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setBackupToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBackup(backupToDelete.id)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Delete Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manifest Modal */}
      {activeManifestModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Archive Manifest Inspector</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{activeManifestModal.filename}</p>
              </div>
              <button
                onClick={() => setActiveManifestModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-950 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>
{JSON.stringify({
  wpbundle_version: '1.0.0',
  created_at: activeManifestModal.createdAt,
  generator: 'WP Bundle Migrator v1.0.0',
  environment: {
    wordpress: activeManifestModal.wpVersion,
    php: activeManifestModal.phpVersion,
    db_engine: 'MySQL 8.0.36',
    table_prefix: 'wp_'
  },
  checksum_sha256: activeManifestModal.checksum,
  components: activeManifestModal.components,
  compression: 'gzip-chunks',
  tar_ustar_compliant: true
}, null, 2)}
              </pre>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleCopyManifest(activeManifestModal)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedManifest ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={() => setActiveManifestModal(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
