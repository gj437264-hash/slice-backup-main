import React, { useState } from 'react';
import { ArrowRight, Database, HardDrive, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { DATA_FLOW_STAGES } from '../data/phase2Data';

export const DataFlowView: React.FC = () => {
  const [pipelineType, setPipelineType] = useState<'export' | 'import'>('export');
  const [activeStep, setActiveStep] = useState<number>(1);

  const stages = DATA_FLOW_STAGES[pipelineType];
  const currentStage = stages.find(s => s.step === activeStep) || stages[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <RefreshCw className="w-4 h-4" />
              <span>Data Flow & State Transitions</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
              Export & Import/Restore Execution Pipelines
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Step-by-step architectural execution flows. Each micro-step is bounded by time and memory budgets, persisting offsets to MySQL so execution can be safely resumed across timeouts.
            </p>
          </div>

          {/* Pipeline Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1 shrink-0">
            <button
              onClick={() => {
                setPipelineType('export');
                setActiveStep(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                pipelineType === 'export'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Export Pipeline (Backup)
            </button>
            <button
              onClick={() => {
                setPipelineType('import');
                setActiveStep(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                pipelineType === 'import'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Import / Restore Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Step Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Pipeline Sequence ({stages.length} Distinct Stages)
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stages.map((stage) => {
            const isCurrent = stage.step === activeStep;
            const isPassed = stage.step < activeStep;

            return (
              <button
                key={stage.step}
                onClick={() => setActiveStep(stage.step)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                    : isPassed
                      ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stage.step}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                      {stage.state}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {stage.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Detail Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {currentStage.step}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentStage.title}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  State: {currentStage.state}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500">Atomic Time Slice: &le; 6 seconds</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous Step
            </button>
            <button
              onClick={() => setActiveStep(prev => Math.min(stages.length, prev + 1))}
              disabled={activeStep === stages.length}
              className="px-3 py-1.5 rounded-md bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Next Step
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Execution Operation & Logic:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStage.detail}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Memory & Disk Streaming Strategy:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStage.bufferStrategy}
            </p>
          </div>
        </div>

        {/* Resumption & Rollback Guarantees */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Timeout Resumption Guarantee:</span>
              <span className="text-slate-600">If server kills connection at 6s, the state machine logs the last primary key or byte offset into <code className="font-mono text-slate-800">wp_migrator_jobs</code>. The next heartbeat resumes exactly from that offset.</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Rollback Safety on Failure:</span>
              <span className="text-slate-600">If critical error occurs during restore, the state machine triggers clean-up: restores backup prefix tables, removes temporary files, and unlocks the site.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
