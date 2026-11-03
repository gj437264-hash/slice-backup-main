import React, { useState } from 'react';
import { Terminal, Lock, Send, CheckCircle2, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { REST_ENDPOINTS } from '../data/phase2Data';
import { RestEndpoint } from '../types';

export const RestApiView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<RestEndpoint>(REST_ENDPOINTS[0]);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulatedResponse(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedResponse(selectedEndpoint.responseExample);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>REST API Architecture & Route Contracts</span>
        </div>
        <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
          WordPress REST API Endpoints (/wp-json/wp-bundle-migrator/v1)
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Provides authenticated client-to-server heartbeats and chunk streaming. All routes enforce <code className="font-mono text-slate-800">current_user_can('manage_options')</code>, validate cryptographic nonces, and enforce rate limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">
            REST Route Catalog ({REST_ENDPOINTS.length})
          </div>
          <div className="space-y-1.5">
            {REST_ENDPOINTS.map((ep) => {
              const isSelected = ep.route === selectedEndpoint.route && ep.method === selectedEndpoint.method;
              return (
                <button
                  key={ep.route + ep.method}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setSimulatedResponse(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">
                      {ep.route.replace('/wp-json/wp-bundle-migrator/v1', '')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-1">
                    {ep.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Endpoint Inspector */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                  selectedEndpoint.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedEndpoint.route}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[11px] font-semibold border border-rose-200">
                  <Lock className="w-3 h-3" />
                  <span>{selectedEndpoint.capability}</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {/* Request Schema if available */}
            {selectedEndpoint.requestBodyExample && (
              <div className="mt-5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Request Payload Example:
                </span>
                <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{selectedEndpoint.requestBodyExample}</code>
                </pre>
              </div>
            )}

            {/* Response Example */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Expected JSON Response (HTTP 200 OK):
                </span>
                <button
                  onClick={() => handleCopy(selectedEndpoint.responseExample)}
                  className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <code>{simulatedResponse || selectedEndpoint.responseExample}</code>
              </pre>
            </div>
          </div>

          {/* Test Trigger Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Header required: <code className="font-mono text-slate-700">X-WP-Nonce: [wp_create_nonce('wp_rest')]</code>
            </span>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Executing Tick...' : 'Simulate API Call'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
