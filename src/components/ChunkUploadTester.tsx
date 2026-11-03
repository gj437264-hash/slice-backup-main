import React, { useState, useRef } from 'react';
import { Upload, Play, RefreshCw, CheckCircle, AlertTriangle, FileCode, Check, ShieldCheck } from 'lucide-react';

interface ChunkLog {
  chunkIndex: number;
  totalChunks: number;
  bytes: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  timeMs: number;
  hash: string;
}

export const ChunkUploadTester: React.FC = () => {
  const [fileSizeMb, setFileSizeMb] = useState<number>(24);
  const [chunkSizeMb, setChunkSizeMb] = useState<number>(2);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentChunk, setCurrentChunk] = useState<number>(0);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [logs, setLogs] = useState<ChunkLog[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to test chunked upload stream.');
  const [assemblyComplete, setAssemblyComplete] = useState<boolean>(false);
  const abortControllerRef = useRef<boolean>(false);

  const totalChunks = Math.ceil(fileSizeMb / chunkSizeMb);
  const progressPercent = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;

  const startSimulatedUpload = async () => {
    setIsUploading(true);
    setAssemblyComplete(false);
    abortControllerRef.current = false;
    setCurrentChunk(0);
    setLogs([]);
    setStatusMessage('Initiating chunked stream session...');

    const newLogs: ChunkLog[] = [];

    for (let i = 0; i < totalChunks; i++) {
      if (abortControllerRef.current) {
        setStatusMessage('Upload halted by user.');
        setIsUploading(false);
        return;
      }

      // Simulate failure on chunk 5 if toggle enabled
      if (simulateFailure && i === 4) {
        setStatusMessage('Simulated Network Interruption: 504 Gateway Timeout on chunk 5. Resuming...');
        const failedLog: ChunkLog = {
          chunkIndex: i + 1,
          totalChunks,
          bytes: chunkSizeMb * 1024 * 1024,
          status: 'failed',
          timeMs: 420,
          hash: 'e7a1...'
        };
        newLogs.push(failedLog);
        setLogs([...newLogs]);
        await new Promise(r => setTimeout(r, 900)); // Pause briefly before auto-retry
        // Retry
        setStatusMessage('Resuming from chunk 5 using stored offset...');
      }

      setCurrentChunk(i + 1);
      const remainingMb = Math.min(chunkSizeMb, fileSizeMb - (i * chunkSizeMb));
      const logEntry: ChunkLog = {
        chunkIndex: i + 1,
        totalChunks,
        bytes: remainingMb * 1024 * 1024,
        status: 'uploading',
        timeMs: Math.round(180 + Math.random() * 120),
        hash: `sha256_${Math.random().toString(36).substring(2, 10)}`
      };

      newLogs.push(logEntry);
      setLogs([...newLogs]);
      setStatusMessage(`Uploading chunk ${i + 1} of ${totalChunks} (${remainingMb.toFixed(1)} MB)...`);

      // Simulate HTTP network latency
      await new Promise(r => setTimeout(r, 220));

      logEntry.status = 'completed';
      setLogs([...newLogs]);
    }

    setStatusMessage('All slices received. Verifying SHA-256 and executing atomic rename...');
    await new Promise(r => setTimeout(r, 400));
    setAssemblyComplete(true);
    setIsUploading(false);
    setStatusMessage(`Package assembled successfully: package_session_${Date.now()}.wpbundle (${fileSizeMb} MB total)`);
  };

  const handleStop = () => {
    abortControllerRef.current = true;
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Client-Side Slicing Simulator
              </span>
              <span className="text-xs text-slate-500">Blob.prototype.slice(start, end)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              FileReader Chunk Upload & Assembly Tester
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Simulates the client-side binary chunk slicer that breaks large .wpbundle archives into 1MB–2MB pieces, sending them over standard HTTP REST requests to completely bypass PHP's strict <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">upload_max_filesize = 2M</code>.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!isUploading ? (
              <button
                onClick={startSimulatedUpload}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Chunk Upload</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Halt Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Simulated Archive Size
            </label>
            <select
              value={fileSizeMb}
              disabled={isUploading}
              onChange={(e) => setFileSizeMb(Number(e.target.value))}
              className="w-full text-xs rounded-lg border-slate-300 shadow-2xs focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white"
            >
              <option value={8}>8 MB (Small Site / Database Only)</option>
              <option value={24}>24 MB (Typical Shared Hosting Site)</option>
              <option value={64}>64 MB (Medium WooCommerce Site)</option>
              <option value={128}>128 MB (Heavy Media Site)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slice Window Size
            </label>
            <select
              value={chunkSizeMb}
              disabled={isUploading}
              onChange={(e) => setChunkSizeMb(Number(e.target.value))}
              className="w-full text-xs rounded-lg border-slate-300 shadow-2xs focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white"
            >
              <option value={1}>1 MB (Maximum Safety - Ultra Strict Hosts)</option>
              <option value={2}>2 MB (Default - Fits inside 2MB PHP limit)</option>
              <option value={4}>4 MB (Faster - For 8MB+ Hostings)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={simulateFailure}
                disabled={isUploading}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span>Simulate Mid-Upload Timeout & Resume</span>
            </label>
          </div>
        </div>
      </div>

      {/* Progress & Live Status */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chunk Transfer Progress
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {currentChunk} of {totalChunks} Chunks Transferred ({progressPercent}%)
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            assemblyComplete
              ? 'bg-emerald-100 text-emerald-800'
              : isUploading
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {assemblyComplete ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Assembled & Validated
              </>
            ) : isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin text-indigo-600" />
                Streaming Slices
              </>
            ) : (
              'Idle'
            )}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              assemblyComplete ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-200 flex items-center justify-between">
          <span className="truncate">{statusMessage}</span>
          <span className="text-slate-400 shrink-0 ml-2">Endpoint: /v1/upload/chunk</span>
        </div>
      </div>

      {/* Live Chunk Stream Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">HTTP REST Chunk Stream Audit Log</h3>
          <span className="text-xs text-slate-500 font-mono">{logs.length} requests executed</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No upload chunks dispatched yet. Click &quot;Start Chunk Upload&quot; to begin.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <span className="w-16 font-bold text-slate-700">Chunk #{log.chunkIndex}</span>
                  <span className="text-slate-500">{(log.bytes / (1024 * 1024)).toFixed(2)} MB</span>
                  <span className="text-slate-400 text-[11px]">{log.hash}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500">{log.timeMs}ms</span>
                  {log.status === 'completed' && (
                    <span className="inline-flex items-center text-emerald-600 font-medium">
                      <Check className="w-3.5 h-3.5 mr-1" /> 200 OK
                    </span>
                  )}
                  {log.status === 'uploading' && (
                    <span className="inline-flex items-center text-indigo-600">
                      <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Transferring
                    </span>
                  )}
                  {log.status === 'failed' && (
                    <span className="inline-flex items-center text-rose-600 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> 504 Timeout
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Architectural Guarantee Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs mb-1">
            <Upload className="w-4 h-4" />
            <h4>Zero Memory Slicing</h4>
          </div>
          <p className="text-xs text-slate-600">
            The browser slices native raw binary chunks via pointer arithmetic without reading the whole archive into JavaScript V8 heap memory.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-xs mb-1">
            <ShieldCheck className="w-4 h-4" />
            <h4>Atomic Server Assembly</h4>
          </div>
          <p className="text-xs text-slate-600">
            Chunks are appended directly to <code className="font-mono text-slate-800">.part</code> stream files via PHP <code className="font-mono text-slate-800">stream_copy_to_stream</code> and only renamed once all slices pass checksums.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs mb-1">
            <FileCode className="w-4 h-4" />
            <h4>Automatic Offset Resume</h4>
          </div>
          <p className="text-xs text-slate-600">
            If an HTTP slice connection is severed, the client queries the server&apos;s current byte offset and resumes seamlessly with zero duplicate uploads.
          </p>
        </div>
      </div>
    </div>
  );
};
