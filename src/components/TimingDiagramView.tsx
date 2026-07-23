import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { HeartState, SystemConfig, TimingSample } from '../types';
import {
  generateTimingSimulation,
  STATE_DEFINITIONS,
} from '../utils/digitalLogic';

interface TimingDiagramViewProps {
  bpm: number;
  config: SystemConfig;
  currentHeartState: HeartState;
}

export const TimingDiagramView: React.FC<TimingDiagramViewProps> = ({
  bpm,
  config,
  currentHeartState,
}) => {
  const [activeStep, setActiveStep] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);

  const samples = generateTimingSimulation(bpm, config, 6.0);
  const maxSteps = samples.length;
  const currentSample = samples[activeStep] || samples[0];

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % maxSteps);
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsPlaying(false);
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % maxSteps);
      }, 200 / zoom);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps, zoom]);

  // Display slice around current active step
  const visibleWindow = 30;
  const startIdx = Math.max(0, activeStep - 10);
  const endIdx = Math.min(maxSteps, startIdx + visibleWindow);
  const visibleSamples = samples.slice(startIdx, endIdx);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            CRONOGRAMA DE TIEMPOS Y ANALIZADOR LÓGICO
          </h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
            Formas de Onda Síncronas para Reloj (CLK), Pulso QRS (P_QRS), Contador y Decodificador
          </p>
        </div>

        {/* Step-by-step Simulation Player */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-md border border-slate-800">
          <button
            onClick={handleReset}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title="Reiniciar Simulación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs cursor-pointer shadow-sm transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR'}</span>
          </button>

          <button
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs cursor-pointer border border-slate-700 font-bold"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>PASO RELOJ</span>
          </button>
        </div>
      </div>

      {/* Main Waveform Inspector Area */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Timeline Header Cursor */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-bold bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded-lg">
              PASO {activeStep} / {maxSteps}
            </span>
            <span>Tiempo: {currentSample?.timeSec} s</span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Contador: <strong className="text-slate-200">{currentSample?.counterValue}</strong>
            </span>
            <span
              className="font-bold px-2 py-0.5 rounded"
              style={{
                color: STATE_DEFINITIONS[currentSample?.state || 'RESET'].color,
                backgroundColor: `${STATE_DEFINITIONS[currentSample?.state || 'RESET'].color}20`,
              }}
            >
              {currentSample?.state}
            </span>
          </div>
        </div>

        {/* Digital Waveform Tracks */}
        <div className="space-y-4 font-mono text-xs">
          {/* Track 1: Reference Clock CLK */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px] mb-2 font-bold">
              <span className="text-slate-200 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Reloj Maestro (CLK) - {config.f_clk} Hz
              </span>
              <span>Nivel Actual: {currentSample?.clk}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {visibleSamples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`flex-1 h-10 border-l flex flex-col justify-between transition-all cursor-pointer ${
                    s.id === activeStep ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-500' : 'border-slate-800'
                  }`}
                >
                  <div
                    className={`w-full h-1 ${
                      s.clk === 1 ? 'bg-blue-400 shadow-sm shadow-blue-400' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`w-full h-1 ${
                      s.clk === 0 ? 'bg-blue-400' : 'bg-transparent'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: QRS Pulse Input P_QRS */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px] mb-2 font-bold">
              <span className="text-slate-200 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Pulso QRS Detectado (P_QRS)
              </span>
              <span>Nivel Actual: {currentSample?.qrsSignal}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {visibleSamples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`flex-1 h-10 border-l flex flex-col justify-between transition-all cursor-pointer ${
                    s.id === activeStep ? 'bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-500' : 'border-slate-800'
                  }`}
                >
                  <div
                    className={`w-full h-2 ${
                      s.qrsSignal === 1 ? 'bg-yellow-400 shadow-md shadow-yellow-400' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`w-full h-1 ${
                      s.qrsSignal === 0 ? 'bg-slate-700' : 'bg-transparent'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: Counter Register Value */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px] mb-2 font-bold">
              <span className="text-slate-200 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Valor de Contador Síncrono (Q3 Q2 Q1 Q0)
              </span>
              <span>Conteo: {currentSample?.counterValue}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {visibleSamples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`flex-1 h-10 border border-slate-800 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    s.id === activeStep
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-400 ring-2 ring-indigo-500'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.counterValue}
                </div>
              ))}
            </div>
          </div>

          {/* Track 4: Output Y_BRADI */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px] mb-2 font-bold">
              <span className="text-blue-400 flex items-center gap-2">
                Salida Y_BRADI (Bradicardia &lt;60 BPM)
              </span>
              <span>{currentSample?.yBradi}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {visibleSamples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`flex-1 h-6 rounded transition-all cursor-pointer ${
                    s.yBradi === 1 ? 'bg-blue-500 shadow-sm shadow-blue-500' : 'bg-slate-900'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Track 5: Output Y_NORMAL */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px] mb-2 font-bold">
              <span className="text-emerald-400 flex items-center gap-2">
                Salida Y_NORMAL (Ritmo Normal 60-100 BPM)
              </span>
              <span>{currentSample?.yNormal}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {visibleSamples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`flex-1 h-6 rounded transition-all cursor-pointer ${
                    s.yNormal === 1 ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-900'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Track 6: Output Y_TAQUI */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px] mb-2 font-bold">
              <span className="text-red-400 flex items-center gap-2">
                Salida Y_TAQUI (Taquicardia &gt;100 BPM)
              </span>
              <span>{currentSample?.yTaqui}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {visibleSamples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`flex-1 h-6 rounded transition-all cursor-pointer ${
                    s.yTaqui === 1 ? 'bg-red-500 shadow-sm shadow-red-500' : 'bg-slate-900'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Range Slider */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Posición de Tiempo Global:</span>
            <span className="text-slate-200 font-bold">{currentSample?.timeSec} s</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxSteps - 1}
            value={activeStep}
            onChange={(e) => setActiveStep(Number(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
