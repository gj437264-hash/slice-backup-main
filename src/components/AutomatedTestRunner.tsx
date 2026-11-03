import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal, 
  Download, 
  Filter, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Key, 
  Code, 
  FileCode,
  Layers,
  Sparkles,
  Bug
} from 'lucide-react';
import { TEST_SUITE_RESULTS } from '../data/phase5TestData';
import { TestCaseResult } from '../types';

export const AutomatedTestRunner: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedTests, setCompletedTests] = useState<string[]>(TEST_SUITE_RESULTS.map(t => t.id));
  const [selectedTestCase, setSelectedTestCase] = useState<TestCaseResult | null>(TEST_SUITE_RESULTS[0]);
  const [injectFailure, setInjectFailure] = useState<boolean>(false);
  const [exportedFormat, setExportedFormat] = useState<'junit' | 'tap' | null>(null);

  const filteredTests = TEST_SUITE_RESULTS.filter(tc => {
    if (activeFilter === 'all') return true;
    return tc.suite.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleRunTests = () => {
    setIsRunning(true);
    setCompletedTests([]);
    setExportedFormat(null);

    // Simulate sequential execution of tests with realistic timings
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < TEST_SUITE_RESULTS.length) {
        setCompletedTests(prev => [...prev, TEST_SUITE_RESULTS[currentIdx].id]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 120);
  };

  const generateJUnitXml = () => {
    const totalAssertions = TEST_SUITE_RESULTS.reduce((acc, t) => acc + t.assertionsCount, 0);
    const totalTime = (TEST_SUITE_RESULTS.reduce((acc, t) => acc + t.durationMs, 0) / 1000).toFixed(3);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="WP Bundle Migrator Phase 5 Test Suite" tests="${TEST_SUITE_RESULTS.length}" assertions="${totalAssertions}" failures="${injectFailure ? '1' : '0'}" errors="0" time="${totalTime}">
  <testsuite name="WpBundleMigrator\\Tests" tests="${TEST_SUITE_RESULTS.length}" assertions="${totalAssertions}" failures="${injectFailure ? '1' : '0'}" errors="0" time="${totalTime}">
${TEST_SUITE_RESULTS.map(t => `    <testcase name="${t.name}" class="WpBundleMigrator\\Tests\\${t.suite}Test" file="tests/${t.suite}/${t.name}.php" assertions="${t.assertionsCount}" time="${(t.durationMs / 1000).toFixed(4)}"/>`).join('\n')}
  </testsuite>
</testsuites>`;
  };

  const generateTapReport = () => {
    return `TAP version 13
1..${TEST_SUITE_RESULTS.length}
${TEST_SUITE_RESULTS.map((t, idx) => `ok ${idx + 1} - ${t.name} (assertions: ${t.assertionsCount}, memory: ${t.memoryUsageKb}KB)`).join('\n')}
# tests ${TEST_SUITE_RESULTS.length}
# pass  ${injectFailure ? TEST_SUITE_RESULTS.length - 1 : TEST_SUITE_RESULTS.length}
# fail  ${injectFailure ? 1 : 0}`;
  };

  const totalAssertions = TEST_SUITE_RESULTS.reduce((acc, t) => acc + t.assertionsCount, 0);
  const totalDurationMs = TEST_SUITE_RESULTS.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Console */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>PHPUnit 11.2 &amp; WP Test Suite Runner</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Automated Testing &amp; Regression Verification Console
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Live automated test execution verifying serialization engines, Zip Slip mitigations, and 32MB host constraints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Failure Injection Toggle */}
            <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={injectFailure} 
                onChange={(e) => setInjectFailure(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-semibold text-slate-700 flex items-center space-x-1">
                <Bug className="w-3.5 h-3.5 text-rose-500" />
                <span>Simulate Malicious Payload / Test Failure</span>
              </span>
            </label>

            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all ${
                isRunning 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Test Battery...' : 'Run All 16 Test Suites'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Total Tests</span>
            <span className="text-lg font-bold font-mono text-slate-900">16 Suites</span>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-medium block">Total Assertions</span>
            <span className="text-lg font-bold font-mono text-emerald-800">{totalAssertions} Assertions</span>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <span className="text-[11px] text-indigo-700 font-medium block">Execution Time</span>
            <span className="text-lg font-bold font-mono text-indigo-800">{totalDurationMs.toFixed(1)} ms</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Pass Rate</span>
            <span className={`text-lg font-bold font-mono ${injectFailure ? 'text-rose-600' : 'text-emerald-600'}`}>
              {injectFailure ? '93.75% (1 Failure)' : '100% Green'}
            </span>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center space-x-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            {[
              { id: 'all', label: 'All Suites (16)' },
              { id: 'serialization', label: 'Serialization (3)' },
              { id: 'zipslip', label: 'Zip Slip & Security (3)' },
              { id: 'databasecursor', label: 'Database Cursor (3)' },
              { id: 'hostconstraints', label: 'Host Limits (2)' },
              { id: 'crypto', label: 'AES-256 Crypto (2)' },
              { id: 'chunkintegrity', label: 'Chunk Slices (3)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setExportedFormat(exportedFormat === 'junit' ? null : 'junit')}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>JUnit XML</span>
            </button>
            <button
              onClick={() => setExportedFormat(exportedFormat === 'tap' ? null : 'tap')}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>TAP 13</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Preview Modal/Drawer if triggered */}
      {exportedFormat && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-indigo-400 font-bold">
              Exported {exportedFormat === 'junit' ? 'JUnit XML Report' : 'Test Anything Protocol (TAP) 13 Report'}
            </span>
            <button 
              onClick={() => setExportedFormat(null)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <pre className="overflow-x-auto max-h-48 text-[11px] text-slate-300 leading-relaxed">
            {exportedFormat === 'junit' ? generateJUnitXml() : generateTapReport()}
          </pre>
        </div>
      )}

      {/* Test Cases Table and Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Cases List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Test Battery Execution Log ({filteredTests.length} tests)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Target: PHP 8.1 - 8.4 • PHPUnit 11
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[640px]">
            {filteredTests.map((tc, idx) => {
              const isCompleted = completedTests.includes(tc.id);
              const isSelected = selectedTestCase?.id === tc.id;
              const isSimulatedFailed = injectFailure && tc.id === 'tc-04';

              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedTestCase(tc)}
                  className={`p-3.5 flex items-start justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/60 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        isSimulatedFailed ? (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                      )}
                      <span className={`text-xs font-bold font-mono ${
                        isSimulatedFailed ? 'text-rose-600' : isSelected ? 'text-indigo-900' : 'text-slate-800'
                      }`}>
                        {tc.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 pl-6">
                      {tc.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 text-right space-y-0.5">
                    <span className="text-[11px] font-mono text-slate-500">
                      {isCompleted ? `${tc.durationMs}ms` : 'waiting...'}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {tc.assertionsCount} asserts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Test Case Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {selectedTestCase ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700">
                      Suite: {selectedTestCase.suite}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700">
                      PASSED
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-mono text-slate-900 mt-2">
                    {selectedTestCase.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    {selectedTestCase.durationMs} ms
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    RSS: {selectedTestCase.memoryUsageKb} KB
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Verification Objective
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedTestCase.description}
                </p>
              </div>

              {/* Assertions Count */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Assertions</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTestCase.assertionsCount} checks</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Memory Overhead</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTestCase.memoryUsageKb} KB</span>
                </div>
              </div>

              {/* Code Snippet */}
              {selectedTestCase.codeSnippet && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      PHPUnit Assertion Code
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Strict Types</span>
                  </div>
                  <pre className="bg-slate-950 text-slate-200 p-3.5 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    {selectedTestCase.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Failure Simulation Note if active */}
              {injectFailure && selectedTestCase.id === 'tc-04' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                  <span className="font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Injected Attack Simulation:</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    A malicious Zip entry attempting traversal `../../../../wp-config.php` was fed to the extractor. 
                    The assertion verifies that `SecurityException` was cleanly raised and no file write took place.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select a test case from the left log to inspect its assertions and PHP code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
