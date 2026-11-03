import React, { useState } from 'react';
import { Layers, ShieldCheck, Cpu, HardDrive, ArrowRight, CheckCircle2, Box, RefreshCw, Terminal, Lock } from 'lucide-react';
import { SYSTEM_LAYERS } from '../data/phase2Data';

export const Phase2ArchitectureView: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState(SYSTEM_LAYERS[0].id);

  const activeLayer = SYSTEM_LAYERS.find(l => l.id === selectedLayer) || SYSTEM_LAYERS[0];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Phase 2 Deliverable: Architecture & System Design</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
              Production System Architecture & Component Model
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Engineered from first principles for WordPress 6.7+ and PHP 8.1–8.4. Employs a strict layered architecture with decoupled storage, streaming IO, deterministic heartbeat state machines, and defense-in-depth isolation.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-semibold">
              Status: Phase 2 Approved
            </span>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Target Memory</span>
            <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">&le; 16 MB Flat</span>
            <span className="text-[11px] text-slate-500">Zero memory bloat on 10GB+</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Time Slice Ceiling</span>
            <span className="text-base font-bold text-indigo-600 font-mono mt-0.5 block">6 - 8 Seconds</span>
            <span className="text-[11px] text-slate-500">Defeats 15s LiteSpeed limit</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Architecture Pattern</span>
            <span className="text-base font-bold text-emerald-600 font-mono mt-0.5 block">PSR-4 Layered</span>
            <span className="text-[11px] text-slate-500">Clean separation of concerns</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Package Standard</span>
            <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">.wpbundle (TAR+JSON)</span>
            <span className="text-[11px] text-slate-500">Non-proprietary open format</span>
          </div>
        </div>
      </div>

      {/* Layer Stack Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Selector Stack */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            System Layer Stack (Top &rarr; Down)
          </div>
          {SYSTEM_LAYERS.map((layer, idx) => {
            const isSelected = layer.id === selectedLayer;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${layer.accentColor}`}>
                    L{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{layer.name}</h4>
                    <span className="text-[11px] text-slate-500">{layer.badge}</span>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>

        {/* Layer Deep-Dive Pane */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeLayer.accentColor}`}>
                  {activeLayer.name}
                </span>
                <span className="text-xs font-mono text-slate-500">{activeLayer.badge}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">PSR-4 Standard</span>
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {activeLayer.description}
            </p>

            <div className="mt-6">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                Core Architectural Components in this Layer:
              </span>
              <div className="space-y-3">
                {activeLayer.components.map((comp) => (
                  <div key={comp.name} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <Box className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-mono text-xs font-bold text-slate-900">{comp.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 pl-5 leading-relaxed">
                      {comp.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Isolation: Strict unidirectional downward dependency calls</span>
            <span className="font-mono text-emerald-700 font-semibold">&check; Zero circular dependencies</span>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
            <RefreshCw className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Client-Driven Heartbeat Loop</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Eliminates reliance on silent, unmonitored background cron tasks. The browser or CLI issues discrete REST heartbeats with 6s timeouts, receiving step offsets and saving checkpoints on every tick.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-600 font-semibold">
            &bull; Resumes instantly upon network drops
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Streaming TAR Without Staging</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Never requires 2x disk space for temporary uncompressed staging. Database SQL chunks and wp-content files stream directly into a single open <code className="font-mono text-slate-800">.wpbundle</code> TAR file handle.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold">
            &bull; Conserves shared hosting disk quotas
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero-Trust Isolation Model</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            All endpoints require WordPress administrative authentication (<code className="font-mono text-slate-800">manage_options</code>). Storage vaults are randomized and protected via <code className="font-mono text-slate-800">.htaccess</code> and <code className="font-mono text-slate-800">index.php</code>, with HMAC package signing.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-rose-600 font-semibold">
            &bull; Zero standalone installer.php vulnerabilities
          </div>
        </div>
      </div>
    </div>
  );
};
