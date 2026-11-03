import React from 'react';
import { SECURITY_VULNERABILITY_VECTORS } from '../data/researchData';
import { ShieldCheck, ShieldAlert, Lock, FileCode, CheckCircle2, AlertOctagon } from 'lucide-react';

export const SecurityThreatModelView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Security Architecture Philosophy */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4" />
          <span>Security-First Architectural Posture</span>
        </div>
        <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
          Attack Vectors & Defense-in-Depth Model for Migration Systems
        </h2>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Migration plugins operate with the highest privileges in WordPress—writing arbitrary files and rewriting database records. An insecure implementation is an open backdoor to remote code execution (RCE) and full database exfiltration.
        </p>
      </div>

      {/* Vulnerability Vectors List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>Identified Threat Vectors & Concrete Mitigations</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Every vector evaluated against CVE histories of existing migration plugins (All-in-One, Duplicator, UpdraftPlus).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {SECURITY_VULNERABILITY_VECTORS.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {sec.cwe}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{sec.vector}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold uppercase">
                    {sec.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {sec.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 bg-emerald-50/70 p-2.5 rounded border border-emerald-100">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Defensive Implementation:</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  {sec.mitigationStrategy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory & Backup File Hardening */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          <span>Securing the Storage Vault & Download Directory</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Backup files must never be publicly indexable or directly downloadable without cryptographic capability checks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900">1. Obfuscated Vault Folder</h4>
            <p className="text-xs text-slate-600 mt-1">
              Path: <code className="text-[11px] text-indigo-600 font-mono">wp-content/uploads/wpmigrate-[random-32-chars]/</code>. Directory name is generated on activation via <code className="text-[11px] font-mono">wp_generate_password(32, false)</code> and stored in WordPress options.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900">2. Multi-Server Access Blocking</h4>
            <p className="text-xs text-slate-600 mt-1">
              Injects both <code className="text-[11px] font-mono">.htaccess</code> (<code className="text-[10px] font-mono">Deny from all</code>) for Apache/LiteSpeed and a companion <code className="text-[11px] font-mono">index.php</code> redirection stub for Nginx/IIS fallback.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900">3. Ephemeral Download Tokens</h4>
            <p className="text-xs text-slate-600 mt-1">
              Backup downloads route through an internal authenticated PHP stream handler verifying <code className="text-[11px] font-mono">current_user_can('export')</code> and a single-use HMAC token valid for 60 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
