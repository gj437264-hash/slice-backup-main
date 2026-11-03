import React, { useState } from 'react';
import { ActiveTab } from './types';
import { Header } from './components/Header';
import { Phase6HardeningOverview } from './components/Phase6HardeningOverview';
import { SecurityAuditReport } from './components/SecurityAuditReport';
import { StaticAnalysisWPCS } from './components/StaticAnalysisWPCS';
import { DeveloperHooksAPI } from './components/DeveloperHooksAPI';
import { ProductionReleaseBuilder } from './components/ProductionReleaseBuilder';
import { Phase5BenchmarkOverview } from './components/Phase5BenchmarkOverview';
import { AutomatedTestRunner } from './components/AutomatedTestRunner';
import { SiteBenchmarkLab } from './components/SiteBenchmarkLab';
import { FuzzingSecurityLab } from './components/FuzzingSecurityLab';
import { Phase4ExtensionsView } from './components/Phase4ExtensionsView';
import { CloudStorageHub } from './components/CloudStorageHub';
import { AutomationRetentionView } from './components/AutomationRetentionView';
import { CliMultisiteView } from './components/CliMultisiteView';
import { Phase3MvpView } from './components/Phase3MvpView';
import { PhpCodebaseBrowser } from './components/PhpCodebaseBrowser';
import { ChunkUploadTester } from './components/ChunkUploadTester';
import { Phase2ArchitectureView } from './components/Phase2ArchitectureView';
import { ClassHierarchyView } from './components/ClassHierarchyView';
import { DirectoryTreeView } from './components/DirectoryTreeView';
import { DataFlowView } from './components/DataFlowView';
import { RestApiView } from './components/RestApiView';
import { ResearchOverview } from './components/ResearchOverview';
import { CompetitorComparisonView } from './components/CompetitorComparisonView';
import { FeatureMatrix } from './components/FeatureMatrix';
import { SharedHostingLimitsView } from './components/SharedHostingLimitsView';
import { SecurityThreatModelView } from './components/SecurityThreatModelView';
import { SerializationLab } from './components/SerializationLab';
import { StateMachineSimulator } from './components/StateMachineSimulator';
import { PackageFormatSpec } from './components/PackageFormatSpec';
import { RoadmapView } from './components/RoadmapView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('phase6-hardening');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'phase6-hardening' && <Phase6HardeningOverview onNavigateTab={setActiveTab} />}
        {activeTab === 'security-audit-report' && <SecurityAuditReport />}
        {activeTab === 'static-analysis-wpcs' && <StaticAnalysisWPCS />}
        {activeTab === 'developer-hooks-api' && <DeveloperHooksAPI />}
        {activeTab === 'production-release-builder' && <ProductionReleaseBuilder />}
        {activeTab === 'phase5-benchmarks' && <Phase5BenchmarkOverview onNavigateTab={setActiveTab} />}
        {activeTab === 'automated-test-runner' && <AutomatedTestRunner />}
        {activeTab === 'site-benchmark-lab' && <SiteBenchmarkLab />}
        {activeTab === 'fuzzing-security-lab' && <FuzzingSecurityLab />}
        {activeTab === 'phase4-extensions' && <Phase4ExtensionsView onNavigateTab={setActiveTab} />}
        {activeTab === 'cloud-storage-hub' && <CloudStorageHub />}
        {activeTab === 'automation-retention' && <AutomationRetentionView />}
        {activeTab === 'cli-multisite' && <CliMultisiteView />}
        {activeTab === 'phase3-mvp' && <Phase3MvpView />}
        {activeTab === 'php-codebase' && <PhpCodebaseBrowser />}
        {activeTab === 'chunk-upload-tester' && <ChunkUploadTester />}
        {activeTab === 'phase2-architecture' && <Phase2ArchitectureView />}
        {activeTab === 'class-diagram' && <ClassHierarchyView />}
        {activeTab === 'directory-tree' && <DirectoryTreeView />}
        {activeTab === 'data-flow' && <DataFlowView />}
        {activeTab === 'rest-api' && <RestApiView />}
        {activeTab === 'research' && <ResearchOverview />}
        {activeTab === 'comparison' && <CompetitorComparisonView />}
        {activeTab === 'features' && <FeatureMatrix />}
        {activeTab === 'hosting-limits' && <SharedHostingLimitsView />}
        {activeTab === 'security' && <SecurityThreatModelView />}
        {activeTab === 'serialization-lab' && <SerializationLab />}
        {activeTab === 'state-machine' && <StateMachineSimulator />}
        {activeTab === 'package-spec' && <PackageFormatSpec />}
        {activeTab === 'roadmap' && <RoadmapView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">WordPress Migration Plugin Architect</span>
            <span>•</span>
            <span>Phase 6: Security Audit &amp; Final Production Hardening</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>WordPress 6.7+ &amp; PHPStan L8 Ready</span>
            <span>PHP 7.4 - 8.4 Cross-Compatible</span>
            <span>GPLv2 Production Release</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
