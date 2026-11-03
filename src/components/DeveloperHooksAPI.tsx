import React, { useState } from 'react';
import { 
  FileCode2, 
  Search, 
  Copy, 
  Check, 
  Filter, 
  Terminal, 
  Zap, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  Code
} from 'lucide-react';
import { WORDPRESS_HOOKS_REFERENCE } from '../data/phase6HardeningData';
import { WordPressHookRef } from '../types';

export const DeveloperHooksAPI: React.FC = () => {
  const [selectedHook, setSelectedHook] = useState<WordPressHookRef>(WORDPRESS_HOOKS_REFERENCE[0]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'action' | 'filter'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recipe generator
  const [selectedRecipe, setSelectedRecipe] = useState<string>('slack-alert');

  const filteredHooks = WORDPRESS_HOOKS_REFERENCE.filter(h => {
    if (typeFilter !== 'all' && h.type !== typeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.useCase.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const recipes: Record<string, { title: string; desc: string; hook: string; code: string }> = {
    'slack-alert': {
      title: 'DevOps Slack / Discord Webhook on Backup Completion',
      desc: 'Send an automated real-time notification to your team channel whenever an export or restore completes.',
      hook: 'wp_bundle_migrator_completed',
      code: `/**
 * Send Slack alert upon successful WordPress migration.
 */
add_action('wp_bundle_migrator_completed', function(array $summary) {
    $webhookUrl = 'https://hooks.slack.com/services/T00/B00/X000000000000000000000';
    $payload = array(
        'text' => sprintf(
            ':white_check_mark: *WordPress Migration Succeeded!*\\n• *Site:* %s\\n• *Total Size:* %s MB\\n• *Duration:* %s sec\\n• *Checksum:* \`%s\`',
            get_bloginfo('name'),
            number_format($summary['total_bytes'] / (1024 * 1024), 2),
            $summary['elapsed_sec'] ?? '0',
            substr($summary['sha256'] ?? '', 0, 16) . '...'
        )
    );
    
    wp_remote_post($webhookUrl, array(
        'headers' => array('Content-Type' => 'application/json'),
        'body'    => wp_json_encode($payload),
        'timeout' => 15,
    ));
}, 10, 1);`
    },
    'exclude-logs': {
      title: 'Prune Bloated Security Logs & Transients',
      desc: 'Exclude Wordfence logs and action scheduler tables to reduce archive size by up to 80%.',
      hook: 'wp_bundle_migrator_excluded_tables',
      code: `/**
 * Exclude bloated log tables from the migration archive.
 */
add_filter('wp_bundle_migrator_excluded_tables', function(array $excluded, array $allTables) {
    // Append transient or high-volume log tables
    $excluded[] = 'wp_wflogs';
    $excluded[] = 'wp_wfhits';
    $excluded[] = 'wp_actionscheduler_logs';
    $excluded[] = 'wp_woocommerce_sessions';
    
    return array_unique($excluded);
}, 10, 2);`
    },
    'cloudflare-tune': {
      title: 'Dynamic Chunk Slicing for Cloudflare Gateways',
      desc: 'Clamp chunk size to 10MB when requests arrive via Cloudflare to prevent HTTP 413 Payload Too Large.',
      hook: 'wp_bundle_migrator_chunk_size',
      code: `/**
 * Adapt chunk size dynamically based on reverse proxy gateway.
 */
add_filter('wp_bundle_migrator_chunk_size', function(int $defaultBytes, array $env) {
    // Detect Cloudflare reverse proxy
    if (!empty($_SERVER['HTTP_CF_RAY'])) {
        return 10 * 1024 * 1024; // Clamp to 10MB slices
    }
    
    // Default standard slice
    return $defaultBytes;
}, 10, 2);`
    },
    'custom-storage': {
      title: 'Register Custom Enterprise Cloud Storage Adapter',
      desc: 'Plug in proprietary company storage or Azure Blob by implementing StorageAdapterInterface.',
      hook: 'wp_bundle_migrator_storage_adapters',
      code: `/**
 * Register custom company object storage adapter.
 */
add_filter('wp_bundle_migrator_storage_adapters', function(array $adapters) {
    // Maps unique adapter slug to fully qualified PHP class name
    $adapters['enterprise_blob'] = \\MyCompany\\Migration\\AzureBlobStorageAdapter::class;
    return $adapters;
});`
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <FileCode2 className="w-4 h-4" />
              <span>Developer Reference &amp; Extensibility</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              WordPress Actions &amp; Filters API Reference
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Clean, non-invasive WordPress hooks enabling third-party developers, hosting providers, and agencies to customize migration pipelines.
            </p>
          </div>

          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start md:self-auto">
            <Zap className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>8 Public Hooks &amp; Filters (@since 1.0.0)</span>
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hooks by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
            />
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400 mr-2 text-[11px]">Type:</span>
            {[
              { id: 'all', label: 'All Hooks' },
              { id: 'action', label: 'Actions only' },
              { id: 'filter', label: 'Filters only' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  typeFilter === t.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Hook Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hook List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Available Hooks ({filteredHooks.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Namespace: wp_bundle_migrator_*
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px]">
            {filteredHooks.map((hook) => {
              const isSelected = selectedHook.id === hook.id;
              const isFilter = hook.type === 'filter';

              return (
                <div
                  key={hook.id}
                  onClick={() => setSelectedHook(hook)}
                  className={`p-4 cursor-pointer transition-colors space-y-1.5 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isFilter ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {hook.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      @since {hook.since}
                    </span>
                  </div>

                  <h4 className="text-xs font-mono font-bold text-slate-900 truncate">
                    {hook.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {hook.description}
                  </p>

                  <div className="text-[10px] text-slate-400 pt-0.5 truncate">
                    <span className="font-semibold text-slate-600">Use case:</span> {hook.useCase}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hook Details and Code Snippet */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    selectedHook.type === 'filter' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {selectedHook.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    WordPress API Hook (@since {selectedHook.since})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-2 break-all">
                  {selectedHook.name}
                </h3>
              </div>

              <button
                onClick={() => handleCopy(selectedHook.sampleCode, selectedHook.id)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
              >
                {copiedId === selectedHook.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Hook Description
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedHook.description}
              </p>
            </div>

            {/* Parameters Table */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Parameters ({selectedHook.parameters.length})
              </span>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono text-[11px]">
                    {selectedHook.parameters.map((param, pIdx) => (
                      <tr key={pIdx}>
                        <td className="p-2.5 font-bold text-indigo-700">{param.name}</td>
                        <td className="p-2.5 text-slate-500">{param.type}</td>
                        <td className="p-2.5 text-slate-700 font-sans">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Implementation Example */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Example Implementation (functions.php / mu-plugins)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Priority: 10
                </span>
              </div>
              <pre className="bg-slate-950 text-emerald-300 p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
                {selectedHook.sampleCode}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Recipe Playground */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Production Developer Recipes</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ready-to-Use Hook Integrations
            </h3>
            <p className="text-xs text-slate-600">
              Select a production use case to preview and copy complete code snippets.
            </p>
          </div>
        </div>

        {/* Recipe Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {Object.entries(recipes).map(([k, r]) => (
            <button
              key={k}
              onClick={() => setSelectedRecipe(k)}
              className={`p-3 rounded-lg text-left transition-all border ${
                selectedRecipe === k 
                  ? 'bg-indigo-50/80 border-indigo-300 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 block truncate">
                {r.title}
              </span>
              <span className="text-[10px] font-mono text-indigo-600 mt-1 block">
                Hook: {r.hook}
              </span>
            </button>
          ))}
        </div>

        {/* Recipe Code Box */}
        <div className="bg-slate-950 text-slate-100 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-indigo-300">
                {recipes[selectedRecipe].title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {recipes[selectedRecipe].desc}
              </p>
            </div>
            <button
              onClick={() => handleCopy(recipes[selectedRecipe].code, 'recipe')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
            >
              {copiedId === 'recipe' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-emerald-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-72">
            {recipes[selectedRecipe].code}
          </pre>
        </div>
      </div>
    </div>
  );
};
