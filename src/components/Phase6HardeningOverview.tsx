import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileCode2, 
  Terminal, 
  Package, 
  ArrowRight, 
  Lock, 
  Flame, 
  Bug, 
  Cpu, 
  Database,
  Layers,
  Code2,
  FileCheck,
  CheckCheck
} from 'lucide-react';
import { ActiveTab } from '../types';

interface Phase6HardeningOverviewProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const Phase6HardeningOverview: React.FC<Phase6HardeningOverviewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phase 6: Security Audit &amp; Final Production Hardening</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Enterprise Security Audit, Static Analysis &amp; Release Ready
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            The final gateway before production distribution: rigorous OWASP/CWE penetration reviews, 
            PHPStan Level 8 zero-baseline static analysis, complete WordPress Coding Standards (WPCS) compliance, 
            and a clean, battle-tested hook/filter API for ecosystem extensibility.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">PHPStan Analysis</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">Level 8 (0 Errors)</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Strict Types &amp; Null Safety</span>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">WPCS Compliance</span>
              <span className="text-2xl font-bold font-mono text-indigo-300">100% Passed</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Core, Extra &amp; Docs Sniffs</span>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Threat Audit (CWE)</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">0 Vulns</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Zip Slip &amp; CWE-502 Immune</span>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Release Package</span>
              <span className="text-2xl font-bold font-mono text-amber-300">v1.0.0 Ready</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Clean Manifest &amp; SHA-256</span>
            </div>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* 4 Interactive Hardening Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => onNavigateTab('security-audit-report')}
          className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Threat Model &amp; Penetration Audit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OWASP &amp; CWE penetration matrix. Audits Zip Slip, CWE-502 object injection, CSRF nonces, SQL parameterization, and stream bombs.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-50 text-rose-700 font-semibold">8 CWE Vectors</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 font-semibold">0 Unpatched</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>Inspect Threat Audit</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('static-analysis-wpcs')}
          className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              PHPStan L8 &amp; WPCS Sniffer
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maximum static analysis strictness. Verifies declare(strict_types=1), nullability safety, generic array shapes, and WPCS formatting rules.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 font-semibold">Level 8 Clean</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700">WPCS Compliant</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>View Code Quality</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('developer-hooks-api')}
          className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Hooks &amp; Filters Developer API
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extensibility API reference for third-party plugins. Actions and filters for custom table exclusion, chunk size tuning, and Slack alerts.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">8 Actions &amp; Filters</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700">Copyable PHP</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>Explore Developer API</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('production-release-builder')}
          className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Production Release Package
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Production distribution builder. Verifies clean manifest (excluding tests/node_modules), generates sha256 checksums, and audits readme.txt.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 text-amber-800 font-semibold">v1.0.0 Archive</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700">SHA-256 Signed</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>Build Release .ZIP</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Production Hardening Defense Architecture Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Hardening Checklist &amp; Verification</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Architectural Defense Comparison vs. Industry Standards
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Comparison between WP Bundle Migrator's Phase 6 hardened architecture and traditional WordPress migration plugins.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start md:self-auto">
            100% Production Audit Pass
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Security &amp; Quality Vector</th>
                <th className="p-3">Legacy Plugin Standard</th>
                <th className="p-3">WP Bundle Migrator Hardened Standard</th>
                <th className="p-3">Audit Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                  <Bug className="w-3.5 h-3.5 text-rose-600" />
                  <span>Object Deserialization</span>
                </td>
                <td className="p-3 text-rose-600">Calls unserialize() directly on database strings; vulnerable to POP gadget chains (CWE-502).</td>
                <td className="p-3 text-emerald-800 font-medium">Custom recursive grammar tokenizer with allowed_classes = false. Zero object instantiation.</td>
                <td className="p-3"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Immune (CVSS 0.0)</span></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Archive Path Extraction</span>
                </td>
                <td className="p-3 text-rose-600">Extracts files without resolving realpath; vulnerable to Zip Slip directory escape (CWE-22).</td>
                <td className="p-3 text-emerald-800 font-medium">Strict PathSanitizer resolves realbase path and blocks directory traversing tokens before disk write.</td>
                <td className="p-3"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Blocked (CVSS 0.0)</span></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>SQL Parameterization</span>
                </td>
                <td className="p-3 text-amber-700">Direct string interpolation in pagination loops: WHERE id &gt; $offset.</td>
                <td className="p-3 text-emerald-800 font-medium">100% prepared SQL via $wpdb-&gt;prepare() with table identifier whitelist validation.</td>
                <td className="p-3"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Clean (0 SQLi)</span></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Static Analysis Strictness</span>
                </td>
                <td className="p-3 text-slate-500">Untyped PHP 5.6/7.0 legacy code; frequent undefined index and null pointer notices.</td>
                <td className="p-3 text-emerald-800 font-medium">PHPStan Level 8 with declare(strict_types=1), union types, and typed array shapes.</td>
                <td className="p-3"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">0 Errors / 0 Warnings</span></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WPCS Enforcement</span>
                </td>
                <td className="p-3 text-slate-500">Unsanitized $_POST access, missing nonces, mixed text domains.</td>
                <td className="p-3 text-emerald-800 font-medium">100% compliant with WordPress-Core and WordPress-Extra. All inputs unslashed and sanitized.</td>
                <td className="p-3"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">100% Validated</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
