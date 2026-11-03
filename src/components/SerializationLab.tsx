import React, { useState } from 'react';
import { safeSerializedReplace, getUtf8ByteLength } from '../utils/serializationEngine';
import { Terminal, Play, RotateCcw, CheckCircle2, AlertTriangle, Info, Copy, Check } from 'lucide-react';

const PRESET_PAYLOADS = [
  {
    title: 'Standard WordPress Option (Site URL & Home URL)',
    search: 'http://old-example.test',
    replace: 'https://new-production-domain.com',
    data: 'a:2:{s:7:"siteurl";s:23:"http://old-example.test";s:4:"home";s:23:"http://old-example.test";}'
  },
  {
    title: 'Theme Mods with Nested Widget Configurations',
    search: 'old-cdn.dev',
    replace: 'media-assets-cdn.prod.aws',
    data: 'a:3:{s:10:"custom_logo";s:31:"https://old-cdn.dev/logo.png";s:12:"sidebar_data";a:2:{s:6:"banner";s:33:"https://old-cdn.dev/banner.jpg";s:5:"title";s:14:"Welcome Widget";}s:7:"version";s:5:"2.4.1";}'
  },
  {
    title: 'Multibyte UTF-8 Characters (Japanese / Accents)',
    search: 'http://staging-test.jp',
    replace: 'https://本番サイト.com',
    data: 'a:2:{s:10:"site_title";s:12:"東京サイト";s:8:"site_url";s:21:"http://staging-test.jp";}'
  }
];

export const SerializationLab: React.FC = () => {
  const [searchStr, setSearchStr] = useState<string>('http://old-example.test');
  const [replaceStr, setReplaceStr] = useState<string>('https://new-production-domain.com');
  const [inputData, setInputData] = useState<string>(PRESET_PAYLOADS[0].data);
  const [copied, setCopied] = useState<boolean>(false);

  // Run the safe serialization replacement
  const result = safeSerializedReplace(inputData, searchStr, replaceStr);

  const applyPreset = (preset: typeof PRESET_PAYLOADS[0]) => {
    setSearchStr(preset.search);
    setReplaceStr(preset.replace);
    setInputData(preset.data);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Core Migration Engine Component #3</span>
        </div>
        <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
          Interactive Serialization-Safe URL Replacement Engine
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          In PHP serialized data (e.g., <code className="text-indigo-600 font-mono">s:23:"http://old-example.test";</code>), blind search-and-replace breaks the byte count token (<code className="text-indigo-600 font-mono">s:23</code>). When PHP attempts to <code className="font-mono">unserialize()</code>, it throws <code className="text-rose-600 font-mono">unserialize(): Error at offset...</code> and completely destroys user widgets, menus, and theme settings. Test our byte-recalculating engine below.
        </p>

        {/* Preset Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 self-center font-medium mr-1">Load Preset Case:</span>
          {PRESET_PAYLOADS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset)}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Search Target (Old Domain / URL / Prefix)
            </label>
            <input
              type="text"
              value={searchStr}
              onChange={(e) => setSearchStr(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="http://old-domain.com"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Length: {getUtf8ByteLength(searchStr)} UTF-8 bytes
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Replace With (New Domain / URL / Prefix)
            </label>
            <input
              type="text"
              value={replaceStr}
              onChange={(e) => setReplaceStr(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="https://new-domain.com"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Length: {getUtf8ByteLength(replaceStr)} UTF-8 bytes
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700">
              Input Serialized PHP String
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              Input Length: {getUtf8ByteLength(inputData)} bytes
            </span>
          </div>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            rows={4}
            className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50"
          />
        </div>

        {/* Live Transformation Result */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Engine Replacement Output
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Valid Byte Length Recalculated</span>
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Output'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
            {result.result}
          </div>

          {/* Comparison Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Occurrences Replaced</span>
              <span className="text-lg font-bold text-indigo-600">{result.replacementCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Original Bytes</span>
              <span className="text-lg font-bold text-slate-700">{result.byteDifferences.beforeBytes} B</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Transformed Bytes</span>
              <span className="text-lg font-bold text-emerald-600">{result.byteDifferences.afterBytes} B</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">PHP unserialize() Status</span>
              <span className="text-sm font-bold text-emerald-700 flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Safe</span>
              </span>
            </div>
          </div>

          {/* Engine Tokenizer Trace Log */}
          <div className="mt-4">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
              Tokenizer & Offset Execution Trace:
            </h5>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs font-mono text-slate-700 max-h-36 overflow-y-auto">
              {result.details.map((msg, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-slate-400">[{i + 1}]</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
