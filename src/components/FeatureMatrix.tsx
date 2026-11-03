import React, { useState } from 'react';
import { FEATURE_CLASSIFICATIONS, COMPETITOR_ANALYSIS } from '../data/researchData';
import { CheckCircle2, ShieldAlert, Sparkles, Filter, AlertCircle, XCircle } from 'lucide-react';

export const FeatureMatrix: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'Core Free MVP', label: 'Core Free MVP' },
    { id: 'Optional Add-on Module', label: 'Optional Add-on Module' },
    { id: 'Cloud/External Service', label: 'Cloud / External' },
    { id: 'Banned Anti-Pattern', label: 'Banned Anti-Patterns' },
  ];

  const filteredFeatures = categoryFilter === 'all'
    ? FEATURE_CLASSIFICATIONS
    : FEATURE_CLASSIFICATIONS.filter(f => f.category === categoryFilter);

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'Core Free MVP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Optional Add-on Module':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cloud/External Service':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Banned Anti-Pattern':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'Critical':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Medium':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Filter and Introduction */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Feature Classification & Scope Boundaries</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Clear distinction between the Free Open Core, Optional Extensibility Modules, Cloud Services, and Banned Anti-Patterns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards / Table */}
        <div className="mt-6 divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {filteredFeatures.map((feat) => (
            <div key={feat.id} className="p-4 hover:bg-slate-50 transition-colors bg-white">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {feat.category === 'Banned Anti-Pattern' ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <h4 className="text-sm font-bold text-slate-900">{feat.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                    {feat.rationale}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pl-6 md:pl-0 shrink-0">
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded border ${getBadgeStyle(feat.category)}`}>
                    {feat.category}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded border ${getComplexityBadge(feat.technicalComplexity)}`}>
                    {feat.technicalComplexity} Complexity
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {feat.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scope Governance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1. Core Free MVP</span>
          </div>
          <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
            Must remain 100% complete, fully functional, and self-contained on its own. No arbitrary size limits (e.g. 512MB limits). Full database, file, uploads, themes, and serialization replacement.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>2. Optional Add-ons</span>
          </div>
          <p className="text-xs text-blue-800 mt-2 leading-relaxed">
            Non-essential specialized integrations such as S3/Dropbox adapters, WP-CLI commands, automated cron schedules, and Multisite extraction sub-tools.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <span>3. Cloud / External Services</span>
          </div>
          <p className="text-xs text-purple-800 mt-2 leading-relaxed">
            Only for massive enterprise websites (50GB - 500GB+) where shared hosting resource ceilings prevent local execution, offloading compute to a remote relay server.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>4. Banned Anti-Patterns</span>
          </div>
          <p className="text-xs text-rose-800 mt-2 leading-relaxed">
            Strictly forbidden due to severe security or architectural fragility: raw installer.php scripts, direct PHP object unserialize, blind preg_replace on database dumps.
          </p>
        </div>
      </div>
    </div>
  );
};
