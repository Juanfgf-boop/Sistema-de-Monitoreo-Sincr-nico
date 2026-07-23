import React from 'react';
import { Activity, Cpu, FileText, Sparkles, Sliders } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  currentBpm: number;
  currentState: string;
  stateColor: string;
  onSetBpm?: (bpm: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  currentBpm,
  currentState,
  stateColor,
  onSetBpm,
}) => {
  const tabs = [
    { id: 'ecg', label: 'Monitor ECG & QRS', icon: Activity },
    { id: 'fsm', label: 'Máquina de Estados (FSM)', icon: Cpu },
    { id: 'timing', label: 'Cronograma / Waveforms', icon: Sliders },
    { id: 'circuit', label: 'Esquema de Circuito', icon: Cpu },
    { id: 'workbench', label: 'Cálculo de Diseño', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          {/* Brand Title */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
                SISTEMA DE MONITOREO SINCRÓNICO <span className="text-sky-400">v4.2</span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mt-0.5">
              Modelado Digital de Frecuencia Cardíaca - Protocolo QRS
            </p>
          </div>

          {/* Header Status Badges & Academic Action */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onSetBpm && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-md text-[11px] font-mono">
                <span className="text-slate-500 uppercase px-1 text-[9px] font-bold">FORZAR ESTADO:</span>
                <button
                  onClick={() => onSetBpm(45)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    currentBpm < 60 ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'bg-slate-950 text-amber-400 hover:bg-slate-800'
                  }`}
                  title="Forzar Bradicardia (<60 BPM)"
                >
                  BRADI (45)
                </button>
                <button
                  onClick={() => onSetBpm(75)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    currentBpm >= 60 && currentBpm <= 100 ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'bg-slate-950 text-emerald-400 hover:bg-slate-800'
                  }`}
                  title="Forzar Ritmo Sinusal Normal (60-100 BPM)"
                >
                  NORMAL (75)
                </button>
                <button
                  onClick={() => onSetBpm(140)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    currentBpm > 100 ? 'bg-rose-500 text-slate-950 font-black shadow-sm' : 'bg-slate-950 text-rose-400 hover:bg-slate-800'
                  }`}
                  title="Forzar Taquicardia (>100 BPM)"
                >
                  TAQUI (140)
                </button>
              </div>
            )}

            <div className="px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-md text-xs font-mono text-slate-300">
              MASTER CLOCK: <span className="text-sky-400 font-bold">100 Hz</span>
            </div>

            <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-500/50 rounded-md text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SISTEMA: ESTABLE
            </div>

            <div
              className="px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5"
              style={{
                color: stateColor,
                backgroundColor: `${stateColor}20`,
                border: `1px solid ${stateColor}50`,
              }}
            >
              <span>{currentBpm} BPM</span>
              <span className="opacity-40">|</span>
              <span>{currentState}</span>
            </div>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition-all cursor-pointer border border-sky-400/30 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>INFORME TÉCNICO</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-sky-950 text-sky-400 border border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.15)] font-bold'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

