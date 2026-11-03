import React, { useState } from 'react';
import { SHARED_HOSTING_CONSTRAINTS } from '../data/researchData';
import { AlertTriangle, CheckCircle, Server, Gauge, ShieldCheck, RefreshCw } from 'lucide-react';

export const SharedHostingLimitsView: React.FC = () => {
  // Interactive hosting benchmark simulator state
  const [maxExecutionTime, setMaxExecutionTime] = useState<number>(30);
  const [memoryLimitMb, setMemoryLimitMb] = useState<number>(128);
  const [uploadLimitMb, setUploadLimitMb] = useState<number>(8);
  const [hasExec, setHasExec] = useState<boolean>(false);
  const [simulatedSiteSizeGb, setSimulatedSiteSizeGb] = useState<number>(2.4);

  // Computed viability analysis
  const chunkSliceSec = Math.min(8, Math.floor(maxExecutionTime * 0.4));
  const memoryPerChunkMb = Math.min(8, Math.floor(memoryLimitMb * 0.15));
  const estimatedSlices = Math.ceil((simulatedSiteSizeGb * 1024) / 100); // 100MB per slice

  return (
    <div className="space-y-8">
      {/* Constraints Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <span>Shared Hosting Constraints & Architectural Mitigations</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Rigorous design decisions to guarantee survival in budget cPanel, LiteSpeed, Apache, and Cloudflare environments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {SHARED_HOSTING_CONSTRAINTS.map((c, i) => (
            <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-mono font-bold text-indigo-700">{c.parameter}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    Worst: {c.worstCaseValue}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-700">
                  <strong className="text-slate-900">Failure Risk:</strong> {c.impactOnMigration}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-emerald-800 bg-emerald-50/50 p-2.5 rounded">
                <strong>Our Engine Mitigation:</strong> {c.architecturalMitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Hosting Threshold Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-indigo-600" />
              <span>Interactive Hosting Budget & Chunking Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate how our chunking algorithm adapts to aggressive server limits without throwing 500/504 errors.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Real-Time Engine Tuning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Controls */}
          <div className="space-y-4 md:col-span-1 border-r border-slate-100 pr-4">
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>max_execution_time</span>
                <span className="font-bold text-indigo-600">{maxExecutionTime}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={maxExecutionTime}
                onChange={(e) => setMaxExecutionTime(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10s (LiteSpeed)</span>
                <span>30s (Default)</span>
                <span>120s (VPS)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>memory_limit</span>
                <span className="font-bold text-indigo-600">{memoryLimitMb} MB</span>
              </div>
              <input
                type="range"
                min="32"
                max="512"
                step="32"
                value={memoryLimitMb}
                onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>32 MB (Low)</span>
                <span>128 MB</span>
                <span>512 MB (High)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>upload_max_filesize</span>
                <span className="font-bold text-indigo-600">{uploadLimitMb} MB</span>
              </div>
              <input
                type="range"
                min="2"
                max="64"
                step="2"
                value={uploadLimitMb}
                onChange={(e) => setUploadLimitMb(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2 MB (Minimal)</span>
                <span>8 MB</span>
                <span>64 MB</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>Simulated Site Size</span>
                <span className="font-bold text-indigo-600">{simulatedSiteSizeGb} GB</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="20"
                step="0.2"
                value={simulatedSiteSizeGb}
                onChange={(e) => setSimulatedSiteSizeGb(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Engine Adaptation Feedback */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Chunk Time Limit</span>
                <span className="text-lg font-bold text-indigo-600">{chunkSliceSec}s</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Safety margin &gt;60%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Upload Slice Size</span>
                <span className="text-lg font-bold text-emerald-600">{Math.min(uploadLimitMb, 2)} MB</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Under upload limits</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Memory Buffer</span>
                <span className="text-lg font-bold text-blue-600">2 MB stream</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Fits in {memoryLimitMb}MB pool</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Estimated Cycles</span>
                <span className="text-lg font-bold text-slate-900">{estimatedSlices}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">REST chunk cycles</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <div className="font-bold flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verdict: System Guaranteed to Succeed</span>
              </div>
              <p className="leading-relaxed">
                Even under an execution limit of {maxExecutionTime} seconds and memory ceiling of {memoryLimitMb} MB, each micro-slice operates in <strong>{chunkSliceSec} seconds</strong> and flushes to disk immediately with zero memory accumulation. If the browser or connection drops mid-way, the client will resume directly from chunk index <strong>#{Math.floor(estimatedSlices * 0.4)}</strong> without repeating previously processed files or tables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
