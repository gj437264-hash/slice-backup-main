import React from 'react';
import { WP_STANDARDS_INFO } from '../data/researchData';
import { CheckCircle2, AlertTriangle, Layers, Shield, Terminal, ArrowRight } from 'lucide-react';

export const ResearchOverview: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Target Baseline Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Phase 1 Deliverable: Research Findings
            </span>
            <h2 className="text-2xl font-bold mt-1 text-white tracking-tight">
              WordPress Ecosystem & Modern Standards Analysis
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Based on comprehensive evaluation of the latest stable WordPress environment (WP 6.7+ targeting 6.8), PHP 8.1–8.4 type-safety rules, and the mechanics of leading migration tools, this analysis establishes our core architectural foundation before code generation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 block">Min WordPress</span>
              <span className="text-base font-bold text-indigo-300">{WP_STANDARDS_INFO.minWordPressVersion}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 block">Target PHP</span>
              <span className="text-base font-bold text-emerald-400">{WP_STANDARDS_INFO.recommendedPhpVersion}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 block">Database</span>
              <span className="text-base font-bold text-amber-300">MySQL 5.7+ / MariaDB</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 block">PHP Execution</span>
              <span className="text-base font-bold text-cyan-300">Zero-CLI Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* WordPress Standards Deep-Dive */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>WordPress Plugin Development Standards & Architecture Rules</span>
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Modern WordPress architectural paradigms adopted for the independent migration engine.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {WP_STANDARDS_INFO.standards.map((std, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-sm font-bold text-slate-900">{std.title}</h4>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{std.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WordPress APIs to Use vs Avoid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved APIs */}
        <div className="bg-white rounded-xl border border-emerald-200 shadow-xs p-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Approved Core WordPress APIs</h3>
          </div>
          <ul className="space-y-3 mt-4 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <span className="font-mono text-emerald-700 font-semibold shrink-0">WP_Filesystem</span>
              <span>Abstracts local filesystem operations; seamlessly handles direct disk access or FTP/SSH credentials when www-data lacks write permissions.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-emerald-700 font-semibold shrink-0">$wpdb-&gt;prepare()</span>
              <span>Required for all dynamic SQL queries. Enforces parameter binding, preventing SQL injection on custom table exports.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-emerald-700 font-semibold shrink-0">REST API (wp-json)</span>
              <span>Authenticated endpoints using cookie nonces (`X-WP-Nonce`) or application passwords for clean asynchronous state polling and resumability.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-emerald-700 font-semibold shrink-0">wp_raise_memory_limit()</span>
              <span>Gracefully requests PHP memory increase during active migration chunks without throwing uncaught errors on restricted hosts.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-emerald-700 font-semibold shrink-0">wp_json_encode()</span>
              <span>Ensures compliant UTF-8 string encoding and flags (JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) for package manifests.</span>
            </li>
          </ul>
        </div>

        {/* Banned / Dangerous APIs */}
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs p-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-rose-100">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Banned Anti-Patterns & Fragile APIs</h3>
          </div>
          <ul className="space-y-3 mt-4 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <span className="font-mono text-rose-700 font-semibold shrink-0">unserialize() direct</span>
              <span><strong>Banned:</strong> Calling raw `unserialize($data)` without `['allowed_classes' =&gt; false]` enables PHP Object Injection (POP gadget chains) for RCE.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-rose-700 font-semibold shrink-0">exec() / mysqldump</span>
              <span><strong>Banned in Core:</strong> Disabled on &gt;80% of budget shared hosts (`disable_functions`). The engine must operate via 100% pure PHP cursors.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-rose-700 font-semibold shrink-0">Pure WP-Cron Dependency</span>
              <span><strong>Banned for Active Runs:</strong> WP-Cron fails when site traffic is zero. Active migrations must be driven by the client frontend poll loop.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-rose-700 font-semibold shrink-0">file_get_contents(big)</span>
              <span><strong>Banned:</strong> Loading 50MB+ files into memory exhausts PHP limits. Only buffered streams (`fopen`, `fread` 2MB buffers) are permitted.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-rose-700 font-semibold shrink-0">installer.php Bootstrappers</span>
              <span><strong>Banned:</strong> Standalone PHP script left on document roots (Duplicator model) creates severe CVE vulnerabilities.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Architectural Verdict */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Architectural Synthesis & Core Decisions for Phase 2 Architecture</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          How our engine will decisively outperform existing alternatives while remaining original and compliant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">1. Original Open Archive</h4>
            <p className="text-xs text-slate-600 mt-1">
              Rejecting ServMask proprietary closed `.wpress` format. Designing <strong>.wpbundle</strong>: an open, streamable TAR/indexed binary format with SHA256 integrity checks, open for external extraction via CLI or standard archive tools.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">2. Client-Driven Chunk Engine</h4>
            <p className="text-xs text-slate-600 mt-1">
              Frontend REST poll loop sends heartbeat requests every 2–4 seconds with micro-chunk execution budgets (capped at 8 seconds). Survives LiteSpeed LSAPI 15s kills, Cloudflare 100s drops, and shared hosting memory limits.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">3. Token-Safe Serialization Engine</h4>
            <p className="text-xs text-slate-600 mt-1">
              Custom serialization parser that recalculates exact UTF-8 byte lengths without executing object constructors or triggering class autoloaders, preventing broken site widgets and white screens of death.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
