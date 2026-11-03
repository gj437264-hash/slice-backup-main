import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';
import { DIRECTORY_STRUCTURE } from '../data/phase2Data';
import { DirectoryNode } from '../types';

interface TreeNodeProps {
  node: DirectoryNode;
  level: number;
  selectedPath: string;
  onSelect: (node: DirectoryNode) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, selectedPath, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder';

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            setIsOpen(!isOpen);
          }
          onSelect(node);
        }}
        className={`flex items-center space-x-1.5 py-1.5 px-2 rounded-md cursor-pointer text-xs font-mono transition-colors ${
          isSelected 
            ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600' 
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            <span className="text-slate-400">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            {isOpen ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileCode className="w-4 h-4 text-indigo-500" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DirectoryTreeView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<DirectoryNode>(DIRECTORY_STRUCTURE);
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
          <Terminal className="w-4 h-4" />
          <span>Filesystem Layout & PSR-4 Directory Tree</span>
        </div>
        <h2 className="text-xl font-bold mt-1 text-slate-900 tracking-tight">
          Standardized WordPress Plugin Directory Architecture
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          The plugin adheres strictly to modern WordPress engineering and PSR-4 autoloading specifications. All domain classes reside under <code className="font-mono text-slate-800">src/</code> with unambiguous namespace isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Directory Tree Panel */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Plugin Hierarchy (wp-bundle-migrator)</span>
            <span className="text-[11px] font-mono text-indigo-600">PSR-4 Root</span>
          </div>

          <div className="py-2 overflow-y-auto max-h-[520px] select-none">
            <TreeNode
              node={DIRECTORY_STRUCTURE}
              level={0}
              selectedPath={selectedNode.path}
              onSelect={setSelectedNode}
            />
          </div>
        </div>

        {/* File / Folder Inspection Panel */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                {selectedNode.type === 'folder' ? (
                  <Folder className="w-5 h-5 text-amber-500" />
                ) : (
                  <FileCode className="w-5 h-5 text-indigo-600" />
                )}
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-900">
                    {selectedNode.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    {selectedNode.path}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                selectedNode.type === 'folder' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {selectedNode.type}
              </span>
            </div>

            {selectedNode.psr4Class && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">PSR-4 Class:</span>
                <code className="font-mono text-indigo-700 font-bold">{selectedNode.psr4Class}</code>
              </div>
            )}

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {selectedNode.description || 'Core directory component facilitating modular WordPress operation and isolation.'}
            </p>

            {/* Code preview if present */}
            {selectedNode.preview && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    File Implementation Preview:
                  </span>
                  <button
                    onClick={() => handleCopy(selectedNode.preview)}
                    className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                  <code>{selectedNode.preview}</code>
                </pre>
              </div>
            )}

            {!selectedNode.preview && selectedNode.type === 'folder' && selectedNode.children && (
              <div className="mt-5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Sub-components ({selectedNode.children.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedNode.children.map((c) => (
                    <div key={c.path} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono flex items-center space-x-2">
                      {c.type === 'folder' ? <Folder className="w-3.5 h-3.5 text-amber-500" /> : <FileCode className="w-3.5 h-3.5 text-indigo-500" />}
                      <span className="text-slate-800 truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conforms to WordPress Coding Standards (WPCS)</span>
            </span>
            <span className="font-mono text-[11px]">PHP 8.1+ Strict Types</span>
          </div>
        </div>
      </div>
    </div>
  );
};
