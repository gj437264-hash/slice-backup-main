import React, { useState } from 'react';
import { 
  Terminal, 
  Network, 
  Play, 
  Copy, 
  Check, 
  Server, 
  Database, 
  FolderTree, 
  ArrowRight, 
  CheckCircle2, 
  GitFork,
  Layers,
  Sparkles
} from 'lucide-react';
import { CLI_COMMAND_CATALOG } from '../data/phase4Data';

export const CliMultisiteView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'cli' | 'multisite'>('cli');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState<number>(0);
  const [cliInput, setCliInput] = useState<string>(CLI_COMMAND_CATALOG[0].example);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Multisite state
  const [selectedBlogId, setSelectedBlogId] = useState<number>(2);
  const [targetStandaloneUrl, setTargetStandaloneUrl] = useState<string>('https://mystore-standalone.com');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractComplete, setExtractComplete] = useState<boolean>(false);

  const selectedCommand = CLI_COMMAND_CATALOG[selectedCommandIndex];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunCommand = () => {
    setIsRunning(true);
    setTerminalOutput(null);

    setTimeout(() => {
      setIsRunning(false);
      if (cliInput.includes('export')) {
        setTerminalOutput(`Success: Export job initiated (ID: job_exp_cli_9472)
[==================================================>] 100%
+---------------------+-------------------------------+
| Metric              | Value                         |
+---------------------+-------------------------------+
| Database Dump       | 18 tables (44,210 rows)       |
| Files Packaged      | 3,842 files (412.8 MB)        |
| Compression         | POSIX ustar + gzip            |
| Encryption          | AES-256-GCM (PBKDF2-100k)     |
| Target Destination  | cloudflare-r2:wp-backups/     |
| Memory Peak         | 12.84 MB                      |
| Elapsed Time        | 7.42s                         |
| SHA-256 Checksum    | e3b0c44298fc1c149afbf4c8996fb |
+---------------------+-------------------------------+
Success: Archive successfully written to cloudflare-r2 storage vault.`);
      } else if (cliInput.includes('import')) {
        setTerminalOutput(`Warning: You are about to overwrite current database and uploads.
Starting restore from /backups/site.wpbundle...
Unpacking archive manifest... OK
Validating SHA-256 signature... VALID (verified)
Importing database tables... (18/18 tables restored)
Running SerializationReplacer:
  - Searched:  "http://old.dev"
  - Replaced:  "https://prod.com"
  - Rows fixed: 384 serialized options & postmeta strings
Updating GUIDs and permalink cache...
Cleaning up staging files...
Success: WordPress site successfully restored! Total time: 5.12s.`);
      } else if (cliInput.includes('multisite')) {
        setTerminalOutput(`Analyzing Multisite Network (ID: 1)...
Targeting Subsite ID: ${selectedBlogId} (Title: "E-Commerce Store")
Filtering tables matching prefix: wp_${selectedBlogId}_*
  - wp_${selectedBlogId}_posts -> wp_posts (1,840 rows)
  - wp_${selectedBlogId}_postmeta -> wp_postmeta (14,200 rows)
  - wp_${selectedBlogId}_options -> wp_options (392 rows)
Extracting assigned users with wp_${selectedBlogId}_capabilities... 8 users isolated
Rewriting media path: /wp-content/uploads/sites/${selectedBlogId}/ -> /wp-content/uploads/
Packing standalone .wpbundle archive...
Success: Single-site package created at /wp-content/uploads/wp-bundle-backups/subsite_${selectedBlogId}_standalone.wpbundle`);
      } else {
        setTerminalOutput(`+-------------------+-------------+-----------+---------------------+
| Backup ID         | Type        | Size      | Created At          |
+-------------------+-------------+-----------+---------------------+
| wpb_snap_20260910 | Full Site   | 428.4 MB  | 2026-09-10 03:00:12 |
| wpb_snap_20260903 | Full Site   | 426.1 MB  | 2026-09-03 03:00:08 |
| wpb_snap_20260827 | Full Site   | 422.9 MB  | 2026-08-27 03:00:14 |
| wpb_snap_20260801 | Milestone   | 418.0 MB  | 2026-08-01 03:00:05 |
+-------------------+-------------+-----------+---------------------+
Total storage in use: 1.69 GB across 4 verified snapshots.`);
      }
    }, 900);
  };

  const handleSimulateMultisite = () => {
    setIsExtracting(true);
    setExtractComplete(false);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractComplete(true);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Subtab Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Developer Automation &amp; Enterprise Tooling
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 4 Extensions: Headless WP-CLI Terminal Operations and WordPress Multisite Network Extractor.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('cli')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'cli' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>WP-CLI Suite</span>
          </button>
          <button
            onClick={() => setActiveSubTab('multisite')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'multisite' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multisite Extractor</span>
          </button>
        </div>
      </div>

      {/* WP-CLI View */}
      {activeSubTab === 'cli' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Command Catalog Selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Available Commands</span>
                <span className="text-[11px] font-mono text-slate-400">WP_CLI_Command</span>
              </div>

              <div className="space-y-1.5">
                {CLI_COMMAND_CATALOG.map((cmd, idx) => (
                  <button
                    key={cmd.command}
                    onClick={() => {
                      setSelectedCommandIndex(idx);
                      setCliInput(cmd.example);
                      setTerminalOutput(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                      selectedCommandIndex === idx
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <div className="font-mono text-xs">{cmd.command}</div>
                    <div className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                      {cmd.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Emulator */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-lg overflow-hidden font-mono text-xs">
                {/* Terminal Header Bar */}
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-slate-400 text-[11px] ml-2">bash - wp-cli session</span>
                  </div>
                  <button
                    onClick={() => handleCopy(cliInput, 'cli-command')}
                    className="text-slate-400 hover:text-white text-[11px] flex items-center space-x-1"
                  >
                    {copiedKey === 'cli-command' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'cli-command' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Command Input Area */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-200">
                    <span className="text-emerald-400 font-bold">$</span>
                    <input
                      type="text"
                      value={cliInput}
                      onChange={e => setCliInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-hidden text-slate-100 font-mono text-xs focus:ring-0"
                      placeholder="Type wp command..."
                    />
                    <button
                      onClick={handleRunCommand}
                      disabled={isRunning}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isRunning ? 'Running...' : 'Execute'}</span>
                    </button>
                  </div>

                  {/* Terminal Output */}
                  {terminalOutput && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-200">
                      {terminalOutput}
                    </div>
                  )}

                  {!terminalOutput && !isRunning && (
                    <div className="text-slate-600 text-[11px]">
                      Press "Execute" or hit Return to run this WP-CLI command in headless mode.
                    </div>
                  )}
                </div>
              </div>

              {/* Command Flags & Parameter Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Parameters for `{selectedCommand.command}`
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-2 px-3">Option</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Default</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedCommand.options.map(opt => (
                        <tr key={opt.name}>
                          <td className="py-2 px-3 font-semibold text-indigo-700">{opt.name}</td>
                          <td className="py-2 px-3 text-slate-500">{opt.type}</td>
                          <td className="py-2 px-3 text-slate-400">{opt.default || '-'}</td>
                          <td className="py-2 px-3 font-sans text-slate-600">{opt.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multisite Subsite Extraction Engine View */}
      {activeSubTab === 'multisite' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Network className="w-5 h-5 text-indigo-600" />
                  <span>WordPress Multisite Single-Subsite Extraction Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isolates a single subsite from a WordPress Network and packages it as an independent standalone site.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-xs">
                  <label className="block text-slate-500 font-semibold mb-0.5">Subsite to Extract</label>
                  <select
                    value={selectedBlogId}
                    onChange={e => setSelectedBlogId(parseInt(e.target.value))}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value={2}>Blog #2: Store / Shop (sub.network.com)</option>
                    <option value={3}>Blog #3: Documentation (docs.network.com)</option>
                    <option value={4}>Blog #4: Regional Blog (es.network.com)</option>
                  </select>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-500 font-semibold mb-0.5">Target Standalone URL</label>
                  <input
                    type="text"
                    value={targetStandaloneUrl}
                    onChange={e => setTargetStandaloneUrl(e.target.value)}
                    className="text-xs font-mono px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Architecture Isolation Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>1. Table Prefix Remapping</span>
                </div>
                <div className="text-slate-600 leading-relaxed">
                  Automatically extracts tables prefixed with <code className="font-mono bg-white px-1 py-0.5 rounded border">wp_{selectedBlogId}_*</code> and re-indexes them to the canonical standalone prefix <code className="font-mono bg-white px-1 py-0.5 rounded border">wp_*</code>.
                </div>
                <div className="font-mono text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                  wp_{selectedBlogId}_posts → wp_posts<br />
                  wp_{selectedBlogId}_options → wp_options<br />
                  wp_{selectedBlogId}_postmeta → wp_postmeta
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <FolderTree className="w-4 h-4 text-blue-600" />
                  <span>2. Uploads Directory Flattening</span>
                </div>
                <div className="text-slate-600 leading-relaxed">
                  In a Multisite network, subsite media lives under <code className="font-mono bg-white px-1 py-0.5 rounded border">/uploads/sites/{selectedBlogId}/</code>. The extractor flattens this directly into root <code className="font-mono bg-white px-1 py-0.5 rounded border">/uploads/</code>.
                </div>
                <div className="font-mono text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                  /sites/{selectedBlogId}/2026/08/hero.jpg<br />
                  ↓<br />
                  /uploads/2026/08/hero.jpg
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <GitFork className="w-4 h-4 text-emerald-600" />
                  <span>3. User &amp; Capability Isolation</span>
                </div>
                <div className="text-slate-600 leading-relaxed">
                  Network global users are filtered: only users possessing valid role capabilities in <code className="font-mono bg-white px-1 py-0.5 rounded border">wp_{selectedBlogId}_capabilities</code> are ported to the standalone archive.
                </div>
                <div className="font-mono text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                  wp_usermeta key: wp_{selectedBlogId}_capabilities<br />
                  ↓ mapped to:<br />
                  wp_capabilities = "administrator"
                </div>
              </div>
            </div>

            {/* Action & Extraction Status */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleSimulateMultisite}
                disabled={isExtracting}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExtracting ? 'Extracting Subsite...' : `Extract Subsite #${selectedBlogId} to Standalone .wpbundle`}</span>
              </button>

              {extractComplete && (
                <div className="text-xs text-emerald-700 font-semibold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Extraction complete! Ready to import on any standard WordPress site.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
