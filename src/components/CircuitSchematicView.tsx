import React, { useState } from 'react';
import { Cpu, Zap, Activity, Clock, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { HeartState, SystemConfig } from '../types';
import { STATE_DEFINITIONS } from '../utils/digitalLogic';

interface CircuitSchematicViewProps {
  currentHeartState: HeartState;
  config: SystemConfig;
  qrsActive: boolean;
}

export const CircuitSchematicView: React.FC<CircuitSchematicViewProps> = ({
  currentHeartState,
  config,
  qrsActive,
}) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const stateDef = STATE_DEFINITIONS[currentHeartState];
  const q1 = parseInt(stateDef.code[0], 10);
  const q0 = parseInt(stateDef.code[1], 10);

  const yBradi = currentHeartState === 'BRADICARDIA' ? 1 : 0;
  const yNormal = currentHeartState === 'RITMO_NORMAL' ? 1 : 0;
  const yTaqui = currentHeartState === 'TAQUICARDIA' ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            ESQUEMA DEL CIRCUITO DIGITAL SÍNCRONO
          </h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
            Detector QRS, Oscilador Maestro, Contador, Registro ({config.ffType}) y Decodificador
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 font-mono text-xs">
          <span className="text-slate-400 uppercase text-[10px]">ESTADO HARDWARE:</span>
          <span
            className="font-bold px-2 py-0.5 rounded"
            style={{
              color: stateDef.color,
              backgroundColor: `${stateDef.color}20`,
            }}
          >
            {stateDef.name} ({stateDef.code})
          </span>
        </div>
      </div>

      {/* Interactive Architecture Map */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="text-xs font-mono text-slate-400 mb-6 flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span>DIAGRAMA DE BLOQUES DE HARDWARE SÍNCRONO</span>
          <span>Pasa el cursor sobre cada módulo para ver su función lógica</span>
        </div>

        {/* Modular Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Module 1: Acondicionador QRS & Schmitt Trigger */}
          <div
            onMouseEnter={() => setActiveModule('qrs')}
            onMouseLeave={() => setActiveModule(null)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
              activeModule === 'qrs'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                MÓDULO 1
              </span>
              <Zap
                className={`w-4 h-4 ${
                  qrsActive ? 'text-amber-400 fill-amber-400 animate-ping' : 'text-slate-600'
                }`}
              />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Detector & Filtro QRS</h3>
            <p className="text-xs text-slate-400 mt-1">
              Filtro Pasa-Banda + Disparador Schmitt (Compara pico R &gt; 0.5 mV).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs text-amber-300 font-bold">
              Salida: P_QRS = {qrsActive ? 1 : 0}
            </div>
          </div>

          {/* Module 2: Oscillator & Synchronous Counter */}
          <div
            onMouseEnter={() => setActiveModule('counter')}
            onMouseLeave={() => setActiveModule(null)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
              activeModule === 'counter'
                ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                MÓDULO 2
              </span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Contador Síncrono N-Bits</h3>
            <p className="text-xs text-slate-400 mt-1">
              Contador binario (f_clk = {config.f_clk} Hz) habilitado por P_QRS.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs text-blue-300 font-bold">
              Reloj: CLK, Sync Clear: P_QRS
            </div>
          </div>

          {/* Module 3: Flip-Flop State Register */}
          <div
            onMouseEnter={() => setActiveModule('register')}
            onMouseLeave={() => setActiveModule(null)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
              activeModule === 'register'
                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                MÓDULO 3
              </span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Registro de Estado ({config.ffType})</h3>
            <p className="text-xs text-slate-400 mt-1">
              Flip-Flops FF1 y FF0 para almacenamiento síncrono del estado.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs text-indigo-300 font-bold">
              Vector: (Q1, Q0) = ({q1}, {q0})
            </div>
          </div>

          {/* Module 4: Output Gate Decoders & Indicators */}
          <div
            onMouseEnter={() => setActiveModule('decoder')}
            onMouseLeave={() => setActiveModule(null)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
              activeModule === 'decoder'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                MÓDULO 4
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Decodificador & LEDs</h3>
            <p className="text-xs text-slate-400 mt-1">
              Compuertas Lógicas combinacionales (AND, OR, NOT) e Indicadores.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs text-emerald-300 font-bold">
              Salidas: (Y_B={yBradi}, Y_N={yNormal}, Y_T={yTaqui})
            </div>
          </div>
        </div>

        {/* Hardware Status Indicators (LED Panel) */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-4">
            PANEL DE INDICADORES LED DE ESTADO CARDÍACO
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blue LED: Bradicardia */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                yBradi === 1
                  ? 'bg-blue-950/80 border-blue-400 ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-white/20 ${
                  yBradi === 1 ? 'bg-blue-500 shadow-lg shadow-blue-500 animate-pulse' : 'bg-slate-800'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-100">LED BRADICARDIA</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Ecuación: Y_BRADI = NOT(Q1) &bull; Q0 ({yBradi === 1 ? 'HIGH / 1' : 'LOW / 0'})
                </div>
              </div>
            </div>

            {/* Green LED: Normal */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                yNormal === 1
                  ? 'bg-emerald-950/80 border-emerald-400 ring-4 ring-emerald-500/30 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-white/20 ${
                  yNormal === 1 ? 'bg-emerald-500 shadow-lg shadow-emerald-500 animate-pulse' : 'bg-slate-800'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-100">LED RITMO NORMAL</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Ecuación: Y_NORMAL = Q1 &bull; NOT(Q0) ({yNormal === 1 ? 'HIGH / 1' : 'LOW / 0'})
                </div>
              </div>
            </div>

            {/* Red LED: Taquicardia */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                yTaqui === 1
                  ? 'bg-red-950/80 border-red-400 ring-4 ring-red-500/30 shadow-lg shadow-red-500/20'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-white/20 ${
                  yTaqui === 1 ? 'bg-red-500 shadow-lg shadow-red-500 animate-pulse' : 'bg-slate-800'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-100">LED TAQUICARDIA</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Ecuación: Y_TAQUI = Q1 &bull; Q0 ({yTaqui === 1 ? 'HIGH / 1' : 'LOW / 0'})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
