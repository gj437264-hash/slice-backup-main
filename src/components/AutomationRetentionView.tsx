import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  Database,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { DEFAULT_RETENTION_CONFIG } from '../data/phase4Data';

interface SimulatedBackup {
  id: string;
  date: string;
  daysAgo: number;
  sizeMb: number;
  isSunday: boolean;
  isFirstOfMonth: boolean;
  isLocked: boolean;
  status?: 'keep-daily' | 'keep-weekly' | 'keep-monthly' | 'keep-locked' | 'purged';
  reason?: string;
}

export const AutomationRetentionView: React.FC = () => {
  const [config, setConfig] = useState(DEFAULT_RETENTION_CONFIG);
  const [schedulerType, setSchedulerType] = useState<'action_scheduler' | 'wp_cron'>('action_scheduler');
  const [isSimulated, setIsSimulated] = useState(true);

  // Generate 35 mock historical backups over the past 45 days
  const initialBackups: SimulatedBackup[] = useMemo(() => {
    const list: SimulatedBackup[] = [];
    for (let daysAgo = 45; daysAgo >= 0; daysAgo--) {
      // simulate backups every 1 to 2 days
      if (daysAgo % 2 === 0 || daysAgo < 10) {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const isSunday = d.getDay() === 0;
        const isFirstOfMonth = d.getDate() <= 2;
        const isLocked = daysAgo === 30; // One locked milestone backup

        list.push({
          id: `wpb_snap_${daysAgo}d`,
          date: d.toISOString().split('T')[0],
          daysAgo,
          sizeMb: 420 + ((daysAgo * 7) % 50),
          isSunday,
          isFirstOfMonth,
          isLocked
        });
      }
    }
    return list;
  }, []);

  // Compute retained vs purged items according to GFS (Grandfather-Father-Son) logic
  const evaluatedBackups = useMemo(() => {
    let weeklyCount = 0;
    let monthlyCount = 0;
    const keptWeeklies = new Set<string>();
    const keptMonthlies = new Set<string>();

    return initialBackups.map(b => {
      // 1. Locked backups are never pruned
      if (b.isLocked) {
        return { ...b, status: 'keep-locked' as const, reason: 'Pinned Milestone' };
      }

      // 2. Daily window check
      if (b.daysAgo < config.dailyRetention) {
        return { ...b, status: 'keep-daily' as const, reason: `Within Daily Window (${b.daysAgo}d < ${config.dailyRetention}d)` };
      }

      // 3. Weekly check (Sundays within weekly window)
      if (b.isSunday && weeklyCount < config.weeklyRetention && !keptWeeklies.has(b.date)) {
        weeklyCount++;
        keptWeeklies.add(b.date);
        return { ...b, status: 'keep-weekly' as const, reason: `Weekly Sunday Snapshot (#${weeklyCount} of ${config.weeklyRetention})` };
      }

      // 4. Monthly check (1st of month)
      if (b.isFirstOfMonth && monthlyCount < config.monthlyRetention && !keptMonthlies.has(b.date.slice(0, 7))) {
        monthlyCount++;
        keptMonthlies.add(b.date.slice(0, 7));
        return { ...b, status: 'keep-monthly' as const, reason: `Monthly Snapshot (#${monthlyCount} of ${config.monthlyRetention})` };
      }

      // 5. Otherwise, safely purge to reclaim storage
      return { ...b, status: 'purged' as const, reason: 'Exceeded retention window threshold' };
    });
  }, [initialBackups, config]);

  const totalOriginalStorage = initialBackups.reduce((acc, b) => acc + b.sizeMb, 0) / 1024;
  const retainedBackups = evaluatedBackups.filter(b => b.status !== 'purged');
  const purgedBackups = evaluatedBackups.filter(b => b.status === 'purged');
  const totalRetainedStorage = retainedBackups.reduce((acc, b) => acc + b.sizeMb, 0) / 1024;
  const totalReclaimedStorage = totalOriginalStorage - totalRetainedStorage;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
              Automated Retention &amp; Scheduling
            </span>
            <span className="text-xs text-slate-500 font-mono">Action Scheduler Integration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Zero-Maintenance Smart Backup Retention Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Never run out of disk space on shared hosting. Automatically clean up stale daily snapshots while archiving weekly and monthly recovery milestones using the GFS (Grandfather-Father-Son) pruning model.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSchedulerType('action_scheduler')}
            className={`px-3 py-1.5 rounded-md transition-colors ${schedulerType === 'action_scheduler' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Action Scheduler (Recommended)
          </button>
          <button
            onClick={() => setSchedulerType('wp_cron')}
            className={`px-3 py-1.5 rounded-md transition-colors ${schedulerType === 'wp_cron' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Native WP-Cron
          </button>
        </div>
      </div>

      {/* Configuration Controls & Live Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Retention Policy Sliders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Retention Rules (GFS Algorithm)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Config</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Daily */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Daily Backups:</span>
                <span className="text-indigo-600 font-bold">Keep last {config.dailyRetention} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={config.dailyRetention}
                onChange={e => setConfig({ ...config, dailyRetention: parseInt(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Retains high-granularity daily snapshots for recent rollback needs.</p>
            </div>

            {/* Weekly */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Weekly Backups:</span>
                <span className="text-indigo-600 font-bold">Keep last {config.weeklyRetention} weeks</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={config.weeklyRetention}
                onChange={e => setConfig({ ...config, weeklyRetention: parseInt(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Saves one snapshot every Sunday for medium-term safety.</p>
            </div>

            {/* Monthly */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Monthly Backups:</span>
                <span className="text-indigo-600 font-bold">Keep last {config.monthlyRetention} months</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={config.monthlyRetention}
                onChange={e => setConfig({ ...config, monthlyRetention: parseInt(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Long-term compliance &amp; tax record snapshots on 1st of month.</p>
            </div>

            {/* Hard Quota */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Hard Storage Ceiling:</span>
                <span className="text-indigo-600 font-bold">{config.maxStorageQuotaGb} GB</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={config.maxStorageQuotaGb}
                onChange={e => setConfig({ ...config, maxStorageQuotaGb: parseInt(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Emergency hard purge if disk fills up regardless of age.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Execution Window:</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
              03:00 AM (Off-Peak Server Time)
            </span>
          </div>
        </div>

        {/* Center & Right: Simulation Results & Visual Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Savings Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Without Pruning</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {totalOriginalStorage.toFixed(2)} GB
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {initialBackups.length} snapshots total
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Retained Storage</div>
              <div className="text-xl font-bold text-indigo-600 mt-1">
                {totalRetainedStorage.toFixed(2)} GB
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">
                {retainedBackups.length} valid recovery points
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-xs">
              <div className="text-xs text-emerald-700 font-medium">Disk Space Saved</div>
              <div className="text-xl font-bold text-emerald-800 mt-1">
                {totalReclaimedStorage.toFixed(2)} GB
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                {purgedBackups.length} obsolete snapshots purged
              </div>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Pruning Audit Simulation (Last 45 Days)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {retainedBackups.length} Kept • {purgedBackups.length} Purged
              </span>
            </div>

            <div className="overflow-x-auto max-h-80 scrollbar-none">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-3">Age</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Pruning Outcome</th>
                    <th className="py-2.5 px-4">Rule Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {evaluatedBackups.slice(0, 16).map(item => (
                    <tr key={item.id} className={item.status === 'purged' ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-800'}>
                      <td className="py-2 px-4 font-medium flex items-center space-x-2">
                        <span>{item.date}</span>
                        {item.isLocked && <Lock className="w-3 h-3 text-amber-500 inline" />}
                      </td>
                      <td className="py-2 px-3">{item.daysAgo}d ago</td>
                      <td className="py-2 px-3">{item.sizeMb} MB</td>
                      <td className="py-2 px-3 font-sans">
                        {item.status === 'keep-daily' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                            Keep (Daily)
                          </span>
                        )}
                        {item.status === 'keep-weekly' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Keep (Weekly)
                          </span>
                        )}
                        {item.status === 'keep-monthly' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                            Keep (Monthly)
                          </span>
                        )}
                        {item.status === 'keep-locked' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            Pinned (Locked)
                          </span>
                        )}
                        {item.status === 'purged' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-600">
                            Purged
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 font-sans text-xs text-slate-500">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
              Showing top 16 of {evaluatedBackups.length} snapshots. Pruning executes non-blocking in batches of 5 deletions per heartbeat tick.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
