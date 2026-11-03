import React, { useState } from 'react';
import { Box, Code, CheckCircle2, ChevronRight, Copy, Check, FileCode, Layers } from 'lucide-react';
import { CLASS_DEFINITIONS } from '../data/phase2Data';
import { ClassDefinition } from '../types';

export const ClassHierarchyView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<ClassDefinition>(CLASS_DEFINITIONS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Object-Oriented Design & Class Hierarchy</span>
        </div>
        <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
          PSR-4 Class & Interface Contracts
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Comprehensive class hierarchy strictly adhering to SOLID principles. Decoupled interfaces for storage, database streaming, archive creation, and security verification ensure testability with PHPUnit and long-term extensibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Selector List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">
            Class & Interface Catalog ({CLASS_DEFINITIONS.length})
          </div>
          <div className="space-y-1.5">
            {CLASS_DEFINITIONS.map((cls) => {
              const isSelected = cls.name === selectedClass.name;
              return (
                <button
                  key={cls.name}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        cls.type === 'interface' 
                          ? 'bg-amber-100 text-amber-800' 
                          : cls.type === 'abstract' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cls.type}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 truncate">
                        {cls.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate">
                      {cls.namespace}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Class Details & Code Inspector */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                  {selectedClass.type}
                </span>
                <h3 className="font-mono text-base font-bold text-slate-900">
                  {selectedClass.name}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 block mt-0.5">
                namespace {selectedClass.namespace};
              </span>
            </div>

            {selectedClass.implementsOrExtends && (
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs">
                {selectedClass.implementsOrExtends}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 mt-4 leading-relaxed">
            {selectedClass.description}
          </p>

          {/* Responsibilities */}
          <div className="mt-5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Primary Responsibilities:
            </span>
            <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
              {selectedClass.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Methods */}
          <div className="mt-6">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Key Method Contracts & Signatures:
            </span>
            <div className="space-y-2">
              {selectedClass.keyMethods.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between font-mono text-xs text-slate-900 font-semibold">
                    <span>{m.signature}</span>
                    <span className="text-indigo-600 text-[11px] font-mono ml-2 shrink-0">: {m.returnType}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippet if available */}
          {selectedClass.codeSnippet && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Production Implementation Preview:</span>
                </span>
                <button
                  onClick={() => handleCopy(selectedClass.codeSnippet)}
                  className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy PHP'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                <code>{selectedClass.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
