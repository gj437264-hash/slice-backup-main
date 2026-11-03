import React, { useState, useEffect, useRef } from 'react';
import { MIGRATION_STATE_STEPS } from '../data/researchData';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw, Database, FileText, Activity } from 'lucide-react';

export const StateMachineSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [filesProcessed, setFilesProcessed] = useState<number>(0);
  const totalFiles = 14280;
  const [tablesProcessed, setTablesProcessed] = useState<number>(0);
  const totalTables = 42;
  const [bytesProcessedMb, setBytesProcessedMb] = useState<number>(0);
  const totalMb = 1450; // 1.45 GB
  const [memoryUsedMb, setMemoryUsedMb] = useState<number>(14.2);
  const [logs, setLogs] = useState<{ time: string; level: string; message: string }[]>([
    { time: '00:00.00', level: 'INFO', message: 'Migration Engine initialized in idle standby.' }
  ]);

  const timerRef = useRef<number | null>(null);

  const addLog = (level: string, message: string) => {
    const now = new Date().toISOString().substring(11, 19);
    setLogs(prev => [{ time: now, level, message }, ...prev.slice(0, 40)]);
  };

  const startSimulation = () => {
    setIsRunning(true);
    addLog('INFO', `Starting job execution at checkpoint step: ${MIGRATION_STATE_STEPS[currentStepIndex].id}`);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    addLog('WARNING', 'Simulating server timeout / connection drop! State checkpoint securely saved to wp_migrator_jobs.');
  };

  const resetSimulation = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStepIndex(0);
    setProgressPercent(0);
    setFilesProcessed(0);
    setTablesProcessed(0);
    setBytesProcessedMb(0);
    setMemoryUsedMb(14.2);
    setLogs([{ time: '00:00.00', level: 'INFO', message: 'Engine reset to initial state.' }]);
  };

  // Simulation tick loop
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = window.setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 100) {
          setIsRunning(false);
          addLog('SUCCESS', 'Migration export completed successfully! Package signature verified.');
          return 100;
        }

        const next = Math.min(100, prev + 2);

        // Step updates based on progress
        if (next < 10) {
          setCurrentStepIndex(0); // INITIALIZING
        } else if (next < 25) {
          setCurrentStepIndex(1); // INDEXING_FILES
          setFilesProcessed(Math.floor((next / 25) * totalFiles));
        } else if (next < 55) {
          setCurrentStepIndex(2); // EXPORTING_DATABASE
          const dbProgress = (next - 25) / 30;
          setTablesProcessed(Math.min(totalTables, Math.floor(dbProgress * totalTables)));
          setBytesProcessedMb(Math.floor(dbProgress * 320));
        } else if (next < 90) {
          setCurrentStepIndex(3); // PACKAGING_FILES
          setFilesProcessed(totalFiles);
          const fileProgress = (next - 55) / 35;
          setBytesProcessedMb(320 + Math.floor(fileProgress * (totalMb - 320)));
        } else if (next < 98) {
          setCurrentStepIndex(4); // FINALIZING_PACKAGE
        } else {
          setCurrentStepIndex(5); // READY
        }

        // Memory stays low and bounded
        setMemoryUsedMb(Number((14.0 + Math.sin(next) * 3.5).toFixed(1)));

        return next;
      });
    }, 400);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const currentStep = MIGRATION_STATE_STEPS[currentStepIndex];

  return (
    <div className="space-y-8">
      {/* Simulation Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Resumable Architecture Proof of Concept</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
              Chunked State Machine & Interruption Recovery Runner
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Demonstrates how the client REST polling loop breaks a 1.45GB site with 14,280 files and 42 database tables into micro-slices, saving state checkpoints after every chunk. You can simulate a server timeout at any time and resume immediately without loss.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isRunning ? (
              <button
                onClick={startSimulation}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{progressPercent > 0 && progressPercent < 100 ? 'Resume Execution' : 'Start Simulation'}</span>
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Simulate Server Timeout</span>
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Real-Time Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Current Phase: {currentStep.label}</span>
            </span>
            <span className="font-mono font-bold text-indigo-600 text-sm">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">{currentStep.description}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Files Packaged</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {filesProcessed.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {totalFiles.toLocaleString()}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Indexed from wp-content</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Database Tables</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {tablesProcessed} <span className="text-xs text-slate-400 font-normal">/ {totalTables}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Cursor streaming via primary key</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Bytes Streamed</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 font-mono">
            {bytesProcessedMb} MB <span className="text-xs text-slate-400 font-normal">/ {totalMb} MB</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Zero uncompressed temp files</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>PHP Memory Used</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Stable</span>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 font-mono">
            {memoryUsedMb} MB
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Limit: 128 MB (Capped at 15%)</div>
        </div>
      </div>

      {/* State Steps Timeline & Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Machine Steps */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            State Machine Transitions
          </h3>
          <div className="space-y-3">
            {MIGRATION_STATE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50/50 text-slate-700'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{step.label}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{step.resumableKey}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {step.memoryRisk} Memory Risk
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Structured Logger */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wide">
                Structured Diagnostic Stream (PSR-3)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Job ID: mig_7f29b41a
              </span>
            </div>

            <div className="mt-4 space-y-1.5 font-mono text-xs max-h-72 overflow-y-auto pr-2 scrollbar-thin">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                    log.level === 'INFO' ? 'bg-blue-900 text-blue-300' :
                    log.level === 'WARNING' ? 'bg-amber-900 text-amber-300' :
                    log.level === 'SUCCESS' ? 'bg-emerald-900 text-emerald-300' :
                    'bg-rose-900 text-rose-300'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Redaction: Passwords, tokens & secrets sanitized</span>
            <span>Channel: /wp-json/migrate/v1/jobs/mig_7f29b41a/log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
