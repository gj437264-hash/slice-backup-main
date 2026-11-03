import React from 'react';
import { Database, ShieldCheck, Cpu, HardDrive, Terminal, Layers, GitFork, FolderTree, RefreshCw, Network, Cloud, Calendar, Sparkles, TrendingUp, CheckCircle2, ShieldAlert, Code2, Package, FileCode2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; phase?: string }[] = [
    { id: 'phase6-hardening', label: 'Phase 6 Overview', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, phase: 'P6' },
    { id: 'security-audit-report', label: 'Threat Penetration Audit', icon: <ShieldAlert className="w-4 h-4 text-rose-600" />, phase: 'P6' },
    { id: 'static-analysis-wpcs', label: 'PHPStan L8 & WPCS', icon: <Code2 className="w-4 h-4 text-indigo-600" />, phase: 'P6' },
    { id: 'developer-hooks-api', label: 'Hooks & Filters API', icon: <FileCode2 className="w-4 h-4 text-emerald-600" />, phase: 'P6' },
    { id: 'production-release-builder', label: 'Release Builder (.zip)', icon: <Package className="w-4 h-4 text-amber-600" />, phase: 'P6' },
    { id: 'phase5-benchmarks', label: 'Phase 5 Benchmarks', icon: <TrendingUp className="w-4 h-4 text-violet-600" />, phase: 'P5' },
    { id: 'automated-test-runner', label: 'PHPUnit Test Runner', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, phase: 'P5' },
    { id: 'site-benchmark-lab', label: '100GB Scale Lab', icon: <Cpu className="w-4 h-4 text-indigo-600" />, phase: 'P5' },
    { id: 'fuzzing-security-lab', label: 'Adversarial Fuzzing', icon: <ShieldAlert className="w-4 h-4 text-rose-600" />, phase: 'P5' },
    { id: 'phase4-extensions', label: 'Phase 4 Extensions', icon: <Sparkles className="w-4 h-4 text-amber-500" />, phase: 'P4' },
    { id: 'cloud-storage-hub', label: 'Pluggable Cloud Hub', icon: <Cloud className="w-4 h-4 text-indigo-600" />, phase: 'P4' },
    { id: 'automation-retention', label: 'Smart Retention Daemon', icon: <Calendar className="w-4 h-4 text-blue-600" />, phase: 'P4' },
    { id: 'cli-multisite', label: 'WP-CLI & Multisite', icon: <Terminal className="w-4 h-4 text-slate-800" />, phase: 'P4' },
    { id: 'phase3-mvp', label: 'Phase 3 MVP Dashboard', icon: <Database className="w-4 h-4 text-emerald-600" />, phase: 'P3' },
    { id: 'php-codebase', label: 'Production PHP Core', icon: <Terminal className="w-4 h-4 text-indigo-600" />, phase: 'P3' },
    { id: 'chunk-upload-tester', label: 'Chunk Upload Lab', icon: <Cpu className="w-4 h-4 text-amber-600" />, phase: 'P3' },
    { id: 'phase2-architecture', label: 'Phase 2 Architecture', icon: <Layers className="w-4 h-4" />, phase: 'P2' },
    { id: 'class-diagram', label: 'Class Hierarchy & Contracts', icon: <GitFork className="w-4 h-4" />, phase: 'P2' },
    { id: 'directory-tree', label: 'PSR-4 Plugin Directory', icon: <FolderTree className="w-4 h-4" />, phase: 'P2' },
    { id: 'data-flow', label: 'Data Flow Pipelines', icon: <RefreshCw className="w-4 h-4" />, phase: 'P2' },
    { id: 'rest-api', label: 'REST API Contracts', icon: <Network className="w-4 h-4" />, phase: 'P2' },
    { id: 'research', label: 'Phase 1 Research', icon: <Cpu className="w-4 h-4" />, phase: 'P1' },
    { id: 'comparison', label: 'Competitor Teardown', icon: <Database className="w-4 h-4" />, phase: 'P1' },
    { id: 'features', label: 'Feature Matrix & Scope', icon: <HardDrive className="w-4 h-4" />, phase: 'P1' },
    { id: 'hosting-limits', label: 'Shared Hosting Limits', icon: <Cpu className="w-4 h-4" />, phase: 'P1' },
    { id: 'security', label: 'Security & Threat Model', icon: <ShieldCheck className="w-4 h-4" />, phase: 'P1' },
    { id: 'serialization-lab', label: 'Serialization Lab', icon: <Terminal className="w-4 h-4" />, phase: 'P1' },
    { id: 'state-machine', label: 'State Simulator', icon: <Database className="w-4 h-4" />, phase: 'P1' },
    { id: 'package-spec', label: 'Package & DB Schema', icon: <HardDrive className="w-4 h-4" />, phase: 'P1' },
    { id: 'roadmap', label: 'Phased Roadmap', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs font-bold text-base">
              WP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  WP Migration Engine Architect
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                <span>Phase 6 Hardening</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">PHPStan Level 8</span>
                <span aria-hidden="true">·</span>
                <span>WPCS Compliant</span>
                <span aria-hidden="true">·</span>
                <span>Release v1.0.0</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setActiveTab('production-release-builder')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shadow-xs ${
                activeTab === 'production-release-builder'
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Download .ZIP</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {navItems.map((item) => {
            const isP6 = item.phase === 'P6';
            const isP5 = item.phase === 'P5';
            const isP4 = item.phase === 'P4';
            const isP3 = item.phase === 'P3';
            const isP2 = item.phase === 'P2';
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.phase && (
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isP6
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : isP5
                      ? 'bg-violet-100 text-violet-800 font-semibold'
                      : isP4
                      ? 'bg-amber-100 text-amber-800'
                      : isP3
                      ? 'bg-emerald-100 text-emerald-800'
                      : isP2
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.phase}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

