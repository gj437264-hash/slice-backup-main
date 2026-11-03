import React from 'react';
import { Terminal, CheckCircle2, Clock, ShieldCheck, Flag, ArrowRight } from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Research & Requirements Analysis',
      status: 'Completed',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Ecosystem analysis, WordPress 6.7+ API standards, competitive analysis (AIOWP/Duplicator/BlogVault), shared hosting constraints, threat modeling, and original package specification.',
      deliverables: [
        'Comprehensive Competitive Analysis matrix',
        'Shared hosting micro-chunk mitigation specifications',
        'Threat model & vulnerability mitigations (CWE-22, CWE-434, CWE-502)',
        'Original .wpbundle specification & DB schema definition',
        'Serialization replacement mathematical model'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Architecture & System Design',
      status: 'Completed',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Directory layout, PSR-4 namespaces, class hierarchy, database cursors, storage abstraction interfaces, state machine event contracts, and REST API route schemas.',
      deliverables: [
        'Complete directory hierarchy & PSR-4 autoloading manifest',
        'Database DDL scripts and uninstall.php cleanup',
        'State machine event loop & job manager class contracts',
        'StorageAdapterInterface & LocalStorageAdapter definition',
        'REST API route controllers & capability authorization middleware'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'MVP Production-Ready Core Implementation',
      status: 'Completed',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Core functional plugin: pure PHP database streaming exporter/importer, file chunking, .wpbundle generator, serialization-safe URL replacer, backup manager, and WordPress admin UI.',
      deliverables: [
        'Streaming MySQL dump engine with primary key cursor pagination',
        'Streaming TAR / .wpbundle archive engine',
        'Chunked slice uploader (1MB - 2MB FileReader slices)',
        'Serialization-aware recursive URL/domain replacement engine',
        'WordPress Admin UI with real-time polling progress'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Advanced Features & Extensions',
      status: 'Completed',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Extensibility layer: Pluggable cloud storage with zero paywalls (free BYOS for Amazon S3, Cloudflare R2, Google Cloud Storage, Dropbox, SFTP) + optional turnkey Managed Cloud Vault service, Action Scheduler GFS retention pruning, headless WP-CLI command suite, AES-256-GCM encryption, and Multisite extraction.',
      deliverables: [
        'Pluggable Cloud Hub: Free BYOS (S3, R2, GCS, Dropbox, SFTP) + Managed Vault',
        'Automated GFS retention policy daemon (Daily 7, Weekly 4, Monthly 12)',
        'Full WP-CLI command suite (wp migrate export/import/backup/cloud/multisite)',
        'Zero-dependency streaming AES-256-GCM encryption with PBKDF2 (100k iterations)',
        'WordPress Multisite single-subsite table isolation and standalone extraction'
      ]
    },
    {
      phase: 'Phase 5',
      title: 'Automated Testing & Large-Site Benchmarking',
      status: 'Completed',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'End-to-end automated testing suite with PHPUnit 11, WP Test Suite, adversarial security fuzzing, and large-site scale benchmarks across 100MB, 1GB, 5GB, 25GB, and 100GB+ installations under restrictive shared hosting limits.',
      deliverables: [
        'PHPUnit 11 suite for serialization URL replacement & multi-byte UTF-8 emoji boundaries',
        'Zip Slip, path traversal, null-byte poisoning, and POP object injection (CWE-502) fuzzing tests',
        'Mock server simulations for LiteSpeed 15s timeout, Cloudflare 100s limit, and 32MB memory',
        'Large-scale stress benchmarking across 100MB to 100GB+ measuring constant O(1) memory'
      ]
    },
    {
      phase: 'Phase 6',
      title: 'Security Audit & Final Production Hardening',
      status: 'Completed & Production Ready',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Security penetration review, static analysis (PHPStan Level 8 / Psalm), WordPress Coding Standards (WPCS) compliance check, performance profiling, and documentation.',
      deliverables: [
        'PHPStan level 8 strict analysis & zero warnings',
        'WPCS (WordPress-Core, WordPress-Extra) compliance validation',
        'Complete Developer Documentation & Hook/Filter API Reference',
        'Production release package (.zip) ready for WordPress.org repository'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Flag className="w-4 h-4" />
          <span>Engineering Roadmap & Delivery Plan</span>
        </div>
        <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
          Phased Implementation & Architectural Gateways
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Structured across 6 disciplined phases. Per engineering mandate, we do not generate speculative code until Phase 1 research, risk mitigation, and architectural foundations are completely documented and approved.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {phases.map((p, idx) => (
          <div key={p.phase} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.phase}: {p.title}</h3>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${p.badge}`}>
                {p.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {p.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Key Acceptance Deliverables:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                {p.deliverables.map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
