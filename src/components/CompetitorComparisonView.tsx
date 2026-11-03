import React, { useState } from 'react';
import { COMPETITOR_ANALYSIS } from '../data/researchData';
import { Check, X, ShieldAlert, Cpu, HardDrive, DollarSign } from 'lucide-react';

export const CompetitorComparisonView: React.FC = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<number>(0);

  const competitor = COMPETITOR_ANALYSIS[selectedCompetitor];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-lg font-bold text-slate-900">
          Competitive Landscape & Architectural Teardown
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Detailed analysis of the top 4 WordPress migration plugins to identify strengths to adopt, flaws to eliminate, and security traps to avoid.
        </p>

        {/* Competitor Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {COMPETITOR_ANALYSIS.map((comp, idx) => (
            <button
              key={comp.name}
              onClick={() => setSelectedCompetitor(idx)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedCompetitor === idx
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-xs font-bold text-slate-900 truncate">{comp.name.split(' ')[0]}</div>
              <div className="text-[11px] text-slate-500 truncate">{comp.name}</div>
            </button>
          ))}
        </div>

        {/* Selected Competitor Detailed Breakdown */}
        <div className="mt-6 border border-slate-200 rounded-xl p-6 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <h4 className="text-base font-bold text-slate-900">{competitor.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{competitor.architecture}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-medium px-2 py-1 rounded bg-slate-200 text-slate-800 font-mono">
                Format: {competitor.archiveFormat.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Strengths to learn from */}
            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs pb-2 border-b border-emerald-100">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Strengths to Incorporate</span>
              </div>
              <ul className="space-y-2 mt-3 text-xs text-slate-700">
                {competitor.strengths.map((s, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses to eliminate */}
            <div className="bg-white p-4 rounded-lg border border-rose-200">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs pb-2 border-b border-rose-100">
                <X className="w-4 h-4 text-rose-600" />
                <span>Weaknesses We Will Solve</span>
              </div>
              <ul className="space-y-2 mt-3 text-xs text-slate-700">
                {competitor.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Security & Monetization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs pb-2 border-b border-amber-100">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Identified Security & Stability Risks</span>
              </div>
              <ul className="space-y-2 mt-3 text-xs text-slate-700">
                {competitor.securityConcerns.map((sec, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">!</span>
                    <span>{sec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2 text-indigo-800 font-bold text-xs pb-2 border-b border-indigo-100">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Commercial & Monetization Strategy Analysis</span>
              </div>
              <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                {competitor.monetizationBoundary}
              </p>
              <div className="mt-3 p-2.5 rounded bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900">
                <strong>Our Strategic Differentiation:</strong> Provide an open, unlimited-size core migration engine with no artificial 512MB payload caps, monetizing solely through advanced multi-cloud adapters, white-labeling, and automated enterprise scheduling.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
