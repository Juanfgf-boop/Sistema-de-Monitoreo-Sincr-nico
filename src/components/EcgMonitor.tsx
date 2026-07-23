import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Heart,
  Clock,
} from 'lucide-react';
import { SystemConfig } from '../types';
import {
  calculateMedicalParams,
  generateECGPoint,
  getHeartStateFromBpm,
  STATE_DEFINITIONS,
} from '../utils/digitalLogic';

interface EcgMonitorProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  bpm: number;
  setBpm: (bpm: number) => void;
  onManualPulseTrigger: () => void;
}

export const EcgMonitor: React.FC<EcgMonitorProps> = ({
  config,
  setConfig,
  bpm,
  setBpm,
  onManualPulseTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [qrsFlash, setQrsFlash] = useState(false);
  const [arrhythmiaMode, setArrhythmiaMode] = useState(false);

  const medicalParams = calculateMedicalParams(bpm, config.f_clk);
  const currentHeartState = getHeartStateFromBpm(bpm);
  const stateDef = STATE_DEFINITIONS[currentHeartState];

  // Canvas animation buffer
  const timeRef = useRef(0);
  const pointsRef = useRef<{ x: number; y: number; isQrs: boolean }[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let effectiveBpm = bpm;

    const render = () => {
      if (!isPlaying) return;

      timeRef.current += 0.016; // ~60fps step
      const t = timeRef.current;

      // Handle arrhythmia mode fluctuation
      if (arrhythmiaMode) {
        effectiveBpm = Math.round(75 + 45 * Math.sin(t * 0.8) + 20 * Math.sin(t * 2.3));
        setBpm(effectiveBpm);
      } else {
        effectiveBpm = bpm;
      }

      const ecg = generateECGPoint(t, effectiveBpm, config.noiseLevel);

      if (ecg.isQrsPeak) {
        setQrsFlash(true);
        setTimeout(() => setQrsFlash(false), 120);
      }

      // Draw grid & canvas
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#090d16'; // Deep medical monitor dark background
      ctx.fillRect(0, 0, width, height);

      // Draw ECG Grid Lines
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 20;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Add point to array
      const yVal = height / 2 - ecg.voltage * (height / 3.5);
      pointsRef.current.push({ x: width - 10, y: yVal, isQrs: ecg.isQrsPeak });

      // Shift points left
      const scrollSpeed = 2.2;
      pointsRef.current.forEach((p) => {
        p.x -= scrollSpeed;
      });

      // Remove offscreen points
      pointsRef.current = pointsRef.current.filter((p) => p.x > 0);

      // Draw ECG wave line
      if (pointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#10b981'; // Emerald green medical phosphor line
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;

        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
        for (let i = 1; i < pointsRef.current.length; i++) {
          ctx.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow

        // Draw QRS pulse detection highlights
        pointsRef.current.forEach((p) => {
          if (p.isQrs) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Vertical QRS digital trigger pulse line
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(p.x, 0);
            ctx.lineTo(p.x, height);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // Draw Live Sweeping Bar
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(width - 25, 0, 25, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, bpm, config.noiseLevel, config.f_clk, arrhythmiaMode, setBpm]);

  // Medical Presets
  const applyPreset = (presetBpm: number, isArrhythmia: boolean = false) => {
    setArrhythmiaMode(isArrhythmia);
    if (!isArrhythmia) {
      setBpm(presetBpm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status Overview & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* State Card */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Estado Lógico (FSM)</span>
              <span className="font-mono text-sky-400">0x0{stateDef.code}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full animate-pulse shadow-md"
                style={{ backgroundColor: stateDef.color }}
              />
              <h2 className="text-xl font-bold text-white tracking-tight">{stateDef.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
              {stateDef.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 uppercase text-[10px]">Rango R-R:</span>
            <span className="font-bold text-slate-200">{stateDef.trrRange}</span>
          </div>
        </div>

        {/* Live Frequency & Medical Parameters */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Main BPM Meter Card with Spectrum Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lectura de Frecuencia</h3>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black text-white tabular-nums tracking-tight">{bpm}</span>
                <span className="text-slate-400 font-bold text-sm">BPM</span>
              </div>
              
              {/* Spectrum bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex border border-slate-800 mt-2">
                <div
                  className={`h-full bg-amber-500 transition-all duration-300 ${bpm < 60 ? 'shadow-[0_0_8px_#f59e0b]' : 'opacity-40'}`}
                  style={{ width: '30%' }}
                />
                <div
                  className={`h-full bg-emerald-500 transition-all duration-300 ${bpm >= 60 && bpm <= 100 ? 'shadow-[0_0_10px_#10b981]' : 'opacity-40'}`}
                  style={{ width: '40%' }}
                />
                <div
                  className={`h-full bg-rose-500 transition-all duration-300 ${bpm > 100 ? 'shadow-[0_0_8px_#f43f5e]' : 'opacity-40'}`}
                  style={{ width: '30%' }}
                />
              </div>
              <div className="flex justify-between text-[9px] mt-1.5 font-mono text-slate-500 uppercase tracking-wider">
                <span className={bpm < 60 ? 'text-amber-400 font-bold' : ''}>Bradi (&lt;60)</span>
                <span className={bpm >= 60 && bpm <= 100 ? 'text-emerald-400 font-bold' : ''}>Normal (60-100)</span>
                <span className={bpm > 100 ? 'text-rose-400 font-bold' : ''}>Taqui (&gt;100)</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] font-mono text-sky-400 uppercase">
              f_QRS = {(bpm / 60).toFixed(2)} Hz
            </div>
          </div>

          {/* Interval & Counter Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parámetros Lógicos</h3>
            <div className="space-y-3">
              <div className="border-l-2 border-sky-500 pl-3 py-0.5">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Intervalo R-R (T_RR)</div>
                <div className="text-lg font-bold font-mono text-slate-100">{medicalParams.tRR} s</div>
                <div className="text-[10px] text-sky-400/80 font-mono">T_RR = 60 / BPM</div>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3 py-0.5">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Ticks Reloj (N)</div>
                <div className="text-lg font-bold font-mono text-slate-100">{medicalParams.calculatedCount} ticks</div>
                <div className="text-[10px] text-emerald-400/80 font-mono">N = T_RR &times; {config.f_clk}Hz</div>
              </div>
            </div>
          </div>

          {/* QRS Hardware Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Detección de Onda R</h3>
            <div className="space-y-3">
              <div className={`p-3 rounded bg-slate-950 border ${qrsFlash ? 'border-amber-500/80 bg-amber-950/20' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">P_QRS SIGNAL</span>
                  <Zap className={`w-4 h-4 ${qrsFlash ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${qrsFlash ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-700'}`} />
                  <span className="text-sm font-mono font-bold text-white">
                    {qrsFlash ? 'HIGH (1)' : 'LOW (0)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-500 uppercase">PRE-SCALER</div>
                  <div className="text-xs font-bold text-slate-200">1:1</div>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-500 uppercase">DUTY CYCLE</div>
                  <div className="text-xs font-bold text-slate-200">50%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Monitor Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Canvas Header toolbar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              OSCILOSCOPIO ECG SIMULADO
            </div>
            <span className="text-slate-500 font-mono hidden sm:inline">
              Escala: 25mm/s | 10mm/mV
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium font-mono text-xs cursor-pointer border border-slate-700"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
            </button>

            <button
              onClick={onManualPulseTrigger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 font-mono text-xs font-bold cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Inyectar QRS Manual</span>
            </button>
          </div>
        </div>

        {/* HTML Canvas */}
        <canvas
          ref={canvasRef}
          width={900}
          height={260}
          className="w-full h-64 rounded-xl bg-slate-950 border border-slate-900"
        />

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span>Señal Electrocardiográfica (ECG)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>Pico R (Complejo QRS DETECTADO)</span>
            </div>
          </div>
          <div>
            <span>Condición de Reloj Síncrono: f_clk = {config.f_clk} Hz</span>
          </div>
        </div>
      </div>

      {/* Control Panel: BPM Slider & Medical Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preset Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Escenarios Médicos Reales
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => applyPreset(45)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                bpm < 60 && !arrhythmiaMode
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-xs font-bold">Bradicardia</span>
              <span className="text-[10px] font-mono text-slate-400">45 BPM (&lt;60)</span>
            </button>

            <button
              onClick={() => applyPreset(75)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                bpm >= 60 && bpm <= 100 && !arrhythmiaMode
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-bold">Sinusal Normal</span>
              <span className="text-[10px] font-mono text-slate-400">75 BPM (60-100)</span>
            </button>

            <button
              onClick={() => applyPreset(140)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                bpm > 100 && !arrhythmiaMode
                  ? 'bg-red-600/20 border-red-500 text-red-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-red-400 mb-1" />
              <span className="text-xs font-bold">Taquicardia</span>
              <span className="text-[10px] font-mono text-slate-400">140 BPM (&gt;100)</span>
            </button>

            <button
              onClick={() => applyPreset(90, true)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                arrhythmiaMode
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-xs font-bold">Arritmia Var.</span>
              <span className="text-[10px] font-mono text-slate-400">Dinámica</span>
            </button>
          </div>
        </div>

        {/* Manual Controls Slider */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200">
                Ajuste Manual de Frecuencia (BPM):
              </label>
              <span className="text-sm font-mono font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-lg border border-blue-800/50">
                {bpm} BPM
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="210"
              step="1"
              value={bpm}
              disabled={arrhythmiaMode}
              onChange={(e) => {
                setArrhythmiaMode(false);
                setBpm(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 my-3"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>30 BPM (Brady Extrema)</span>
              <span>60 BPM</span>
              <span>100 BPM</span>
              <span>210 BPM (Tachy Extrema)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Frecuencia Reloj Síncrono (f_clk):</span>
            <select
              value={config.f_clk}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, f_clk: Number(e.target.value) }))
              }
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1 font-mono text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10 Hz (Resolución 100 ms)</option>
              <option value={100}>100 Hz (Resolución 10 ms)</option>
              <option value={1000}>1000 Hz (Resolución 1 ms)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
