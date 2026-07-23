import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { EcgMonitor } from './components/EcgMonitor';
import { StateDiagramView } from './components/StateDiagramView';
import { TimingDiagramView } from './components/TimingDiagramView';
import { CircuitSchematicView } from './components/CircuitSchematicView';
import { EngineeringWorkbench } from './components/EngineeringWorkbench';
import { AcademicReportModal } from './components/AcademicReportModal';
import { HeartState, SystemConfig } from './types';
import { getHeartStateFromBpm, STATE_DEFINITIONS } from './utils/digitalLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('ecg');
  const [bpm, setBpm] = useState<number>(72);
  const [qrsFlash, setQrsFlash] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  const [config, setConfig] = useState<SystemConfig>({
    f_clk: 100, // 100 Hz reference clock
    bradyThresholdBpm: 60,
    tachyThresholdBpm: 100,
    ffType: 'D',
    encodingType: 'BINARY',
    counterBits: 8,
    noiseLevel: 0.05,
    samplingWindowSec: 1.0,
  });

  const currentHeartState: HeartState = getHeartStateFromBpm(bpm);
  const stateDef = STATE_DEFINITIONS[currentHeartState];

  const handleManualPulseTrigger = () => {
    setQrsFlash(true);
    setTimeout(() => setQrsFlash(false), 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        currentBpm={bpm}
        currentState={stateDef.name}
        stateColor={stateDef.color}
        onSetBpm={setBpm}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ecg' && (
          <EcgMonitor
            config={config}
            setConfig={setConfig}
            bpm={bpm}
            setBpm={setBpm}
            onManualPulseTrigger={handleManualPulseTrigger}
          />
        )}

        {activeTab === 'fsm' && (
          <StateDiagramView
            currentHeartState={currentHeartState}
            config={config}
            setConfig={setConfig}
          />
        )}

        {activeTab === 'timing' && (
          <TimingDiagramView
            bpm={bpm}
            config={config}
            currentHeartState={currentHeartState}
          />
        )}

        {activeTab === 'circuit' && (
          <CircuitSchematicView
            currentHeartState={currentHeartState}
            config={config}
            qrsActive={qrsFlash}
          />
        )}

        {activeTab === 'workbench' && (
          <EngineeringWorkbench
            config={config}
            setConfig={setConfig}
            bpm={bpm}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            MODELADO DIGITAL DE FRECUENCIA CARDÍACA &bull; SISTEMAS SÍNCRONOS DIGITALES
          </div>
          <div>
            PARÁMETROS MÉDICOS REALES: QRS | BRADICARDIA (&lt;60 BPM) | NORMAL (60-100 BPM) | TAQUICARDIA (&gt;100 BPM)
          </div>
        </div>
      </footer>

      {/* Academic Printable Report Modal */}
      <AcademicReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        config={config}
        currentBpm={bpm}
      />
    </div>
  );
}
