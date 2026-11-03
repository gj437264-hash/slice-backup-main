import React, { useState } from 'react';
import { PRODUCTION_PHP_FILES } from '../data/phase3CodeData';
import { PhpSourceFile } from '../types';
import { Code, Copy, Check, FileCode, CheckCircle2, ShieldAlert, Cpu, HardDrive } from 'lucide-react';

export const PhpCodebaseBrowser: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PhpSourceFile>(PRODUCTION_PHP_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Database', 'Archive', 'Files', 'Storage', 'Core'];

  const filteredFiles = activeCategory === 'All'
    ? PRODUCTION_PHP_FILES
    : PRODUCTION_PHP_FILES.filter(f => f.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Phase 3 Deliverable
              </span>
              <span className="text-xs text-slate-400">PHP 8.1 - 8.4 • PSR-4 Compliant</span>
            </div>
            <h2 className="text-2xl font-bold mt-2">Production PHP Core Implementation</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Production-ready, pure-PHP migration engine source code. Designed specifically to run inside 32MB shared hosting containers with zero external CLI dependencies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Active Class'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300">Zero-Offset MySQL Cursor (WHERE id &gt; ?)</span>
          </div>
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Pure-PHP Streaming TAR (.wpbundle)</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">POP Gadget Shield (allowed_classes=false)</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Raw UTF-8 Byte Length Recalculation</span>
          </div>
        </div>
      </div>

      {/* Main Code View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Plugin Core Modules</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a class to inspect the implementation</p>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <FileCode className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {file.name}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-100 text-slate-600">
                        {file.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {file.path}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {file.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content & Details */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Class Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono text-xs font-semibold text-slate-800">{selectedFile.path}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  namespace {selectedFile.namespace};
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 transition-colors shadow-2xs self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Description Bar */}
            <div className="px-4 py-2.5 bg-indigo-50/40 border-b border-indigo-100 text-xs text-indigo-950">
              <span className="font-semibold">Implementation Detail: </span>
              {selectedFile.description}
            </div>

            {/* Code Body */}
            <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[620px] leading-relaxed">
              <pre className="text-emerald-400">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
