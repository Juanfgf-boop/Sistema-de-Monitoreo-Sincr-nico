import React, { useState } from 'react';
import {
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ListFilter,
  Grid,
  FileCode,
  Zap,
} from 'lucide-react';
import { FlipFlopType, HeartState, SystemConfig } from '../types';
import {
  generateKMaps,
  generateTransitionTable,
  STATE_DEFINITIONS,
} from '../utils/digitalLogic';

interface StateDiagramViewProps {
  currentHeartState: HeartState;
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

export const StateDiagramView: React.FC<StateDiagramViewProps> = ({
  currentHeartState,
  config,
  setConfig,
}) => {
  const [selectedNode, setSelectedNode] = useState<HeartState | null>(null);

  const transitionTable = generateTransitionTable(config.ffType);
  const kMaps = generateKMaps(config.ffType);

  const activeNode = selectedNode || currentHeartState;
  const activeDef = STATE_DEFINITIONS[activeNode];

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            TRANSICIONES DE ESTADO LÓGICO (FSM SECUENCIAL)
          </h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
            Máquina de Moore/Mealy para Clasificación Temporizada por Complejo QRS
          </p>
        </div>

        {/* Flip-Flop Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-md border border-slate-800 font-mono text-xs">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] px-2 font-bold">
            TECNOLOGÍA FF:
          </span>
          <button
            onClick={() => setConfig((prev) => ({ ...prev, ffType: 'D' }))}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              config.ffType === 'D'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TIPO D (D = Q+)
          </button>
          <button
            onClick={() => setConfig((prev) => ({ ...prev, ffType: 'JK' }))}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              config.ffType === 'JK'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TIPO JK (J, K)
          </button>
        </div>
      </div>

      {/* Logic State Transition Cards (as in theme preview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border transition-all ${activeNode === 'RESET' ? 'bg-slate-900 border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.2)]' : 'bg-slate-950 border-slate-800'}`}>
          <div className="text-[10px] text-slate-500 italic uppercase mb-1">ESTADO INICIAL</div>
          <div className="text-2xl font-mono font-bold text-sky-400">0x00</div>
          <div className="text-[10px] mt-2 py-0.5 px-1.5 bg-sky-950 text-sky-300 inline-block rounded font-mono font-bold uppercase border border-sky-800/40">
            RESET / IDLE
          </div>
        </div>

        <div className={`p-4 rounded-lg border transition-all ${activeNode === 'BRADICARDIA' ? 'bg-blue-950/40 border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.2)]' : 'bg-slate-950 border-slate-800'}`}>
          <div className="text-[10px] text-slate-500 italic uppercase mb-1">CÓDIGO BINARIO 01</div>
          <div className="text-2xl font-mono font-bold text-blue-400">0x01</div>
          <div className="text-[10px] mt-2 py-0.5 px-1.5 bg-blue-950 text-blue-300 inline-block rounded font-mono font-bold uppercase border border-blue-800/40">
            BRADICARDIA (&lt;60 BPM)
          </div>
        </div>

        <div className={`p-4 rounded-lg border transition-all ${activeNode === 'RITMO_NORMAL' ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-slate-950 border-slate-800'}`}>
          <div className="text-[10px] text-slate-500 italic uppercase mb-1">CÓDIGO BINARIO 10</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">0x02</div>
          <div className="text-[10px] mt-2 py-0.5 px-1.5 bg-emerald-950 text-emerald-300 inline-block rounded font-mono font-bold uppercase border border-emerald-800/40">
            RITMO NORMAL (60-100)
          </div>
        </div>

        <div className={`p-4 rounded-lg border transition-all ${activeNode === 'TAQUICARDIA' ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]' : 'bg-slate-950 border-slate-800'}`}>
          <div className="text-[10px] text-slate-500 italic uppercase mb-1">CÓDIGO BINARIO 11</div>
          <div className="text-2xl font-mono font-bold text-rose-400">0x03</div>
          <div className="text-[10px] mt-2 py-0.5 px-1.5 bg-rose-950 text-rose-300 inline-block rounded font-mono font-bold uppercase border border-rose-800/40">
            TAQUICARDIA (&gt;100)
          </div>
        </div>
      </div>

      {/* Main FSM Visual Diagram & Interactive Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive FSM State Diagram Graphic */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>MODELO DE MÁQUINA DE ESTADOS (MOORE/MEALY)</span>
            <span>CÓDIGO: 2 BITS (Q1 Q0)</span>
          </div>

          {/* FSM Graph View */}
          <div className="relative my-8 py-6 min-h-[320px] flex items-center justify-center">
            {/* SVG Connector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
              </defs>

              {/* Connections between nodes */}
              <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
              <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Inter-state transitions */}
              <path d="M 22% 80% Q 35% 65% 48% 80%" fill="none" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />
              <path d="M 52% 80% Q 65% 65% 78% 80%" fill="none" stroke="#f87171" strokeWidth="2" markerEnd="url(#arrow)" />
              <path d="M 78% 85% Q 50% 98% 22% 85%" fill="none" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrow)" />
            </svg>

            {/* FSM Nodes */}
            <div className="relative z-10 w-full max-w-2xl grid grid-cols-3 gap-6 text-center">
              {/* Top Node: RESET */}
              <div className="col-span-3 flex justify-center mb-4">
                <button
                  onClick={() => setSelectedNode('RESET')}
                  className={`px-5 py-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                    currentHeartState === 'RESET'
                      ? 'bg-slate-800 border-slate-400 ring-4 ring-slate-500/30 shadow-xl scale-105'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <div className="text-left font-mono">
                    <div className="text-xs font-bold text-slate-200">RESET / INIT</div>
                    <div className="text-[10px] text-slate-400">Código: 00</div>
                  </div>
                </button>
              </div>

              {/* Bottom Nodes: BRADICARDIA, RITMO NORMAL, TAQUICARDIA */}
              {/* Node 1: BRADICARDIA */}
              <button
                onClick={() => setSelectedNode('BRADICARDIA')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  currentHeartState === 'BRADICARDIA'
                    ? 'bg-blue-950/80 border-blue-400 ring-4 ring-blue-500/40 shadow-xl shadow-blue-500/20 scale-105'
                    : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 mb-2">
                  Q1Q0 = 01
                </span>
                <span className="text-sm font-bold text-slate-100">BRADICARDIA</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1">&lt; 60 BPM</span>
                <span className="text-[10px] font-mono text-blue-300 mt-2 bg-blue-900/40 px-2 py-0.5 rounded">
                  Y_BRADI = 1
                </span>
              </button>

              {/* Node 2: RITMO NORMAL */}
              <button
                onClick={() => setSelectedNode('RITMO_NORMAL')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  currentHeartState === 'RITMO_NORMAL'
                    ? 'bg-emerald-950/80 border-emerald-400 ring-4 ring-emerald-500/40 shadow-xl shadow-emerald-500/20 scale-105'
                    : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-2">
                  Q1Q0 = 10
                </span>
                <span className="text-sm font-bold text-slate-100">RITMO NORMAL</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1">60 - 100 BPM</span>
                <span className="text-[10px] font-mono text-emerald-300 mt-2 bg-emerald-900/40 px-2 py-0.5 rounded">
                  Y_NORMAL = 1
                </span>
              </button>

              {/* Node 3: TAQUICARDIA */}
              <button
                onClick={() => setSelectedNode('TAQUICARDIA')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  currentHeartState === 'TAQUICARDIA'
                    ? 'bg-red-950/80 border-red-400 ring-4 ring-red-500/40 shadow-xl shadow-red-500/20 scale-105'
                    : 'bg-slate-900/90 border-slate-800 hover:border-red-500/50'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 mb-2">
                  Q1Q0 = 11
                </span>
                <span className="text-sm font-bold text-slate-100">TAQUICARDIA</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1">&gt; 100 BPM</span>
                <span className="text-[10px] font-mono text-red-300 mt-2 bg-red-900/40 px-2 py-0.5 rounded">
                  Y_TAQUI = 1
                </span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Haz clic en un estado para inspeccionar sus ecuaciones lógicas.</span>
            <span className="text-blue-400 font-bold">Estado Activo: {currentHeartState}</span>
          </div>
        </div>

        {/* State Detail Inspector Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Detalle de Estado</span>
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                style={{
                  color: activeDef.color,
                  backgroundColor: `${activeDef.color}15`,
                  border: `1px solid ${activeDef.color}40`,
                }}
              >
                {activeDef.code}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-100 mt-2">{activeDef.name}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{activeDef.description}</p>

            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[11px]">Condición de Transición R-R:</div>
                <div className="text-slate-200 font-bold mt-1">{activeDef.trrRange}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[11px]">Decodificación de Salida:</div>
                <div className="text-slate-200 font-bold mt-1">
                  {activeNode === 'BRADICARDIA' && 'Y_BRADI = 1, Y_NORMAL = 0, Y_TAQUI = 0'}
                  {activeNode === 'RITMO_NORMAL' && 'Y_BRADI = 0, Y_NORMAL = 1, Y_TAQUI = 0'}
                  {activeNode === 'TAQUICARDIA' && 'Y_BRADI = 0, Y_NORMAL = 0, Y_TAQUI = 1'}
                  {activeNode === 'RESET' && 'Y_BRADI = 0, Y_NORMAL = 0, Y_TAQUI = 0'}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[11px]">Vector de Excitación (D1, D0):</div>
                <div className="text-blue-400 font-bold mt-1">
                  D1 = {activeDef.code[0]}, D0 = {activeDef.code[1]}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Sincronización:</span>
            <span className="font-mono text-emerald-400 font-semibold">Flanco de Subida QRS</span>
          </div>
        </div>
      </div>

      {/* State Transition & Excitation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-blue-400" />
            Tabla de Transición de Estados y Excitación ({config.ffType === 'D' ? 'Flip-Flops D' : 'Flip-Flops JK'})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Símbolo Excitación: X = Indiferente (Don't Care)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="p-3">Estado Presente</th>
                <th className="p-3">Código (Q1 Q0)</th>
                <th className="p-3">Condición de Conteo R-R</th>
                <th className="p-3">Estado Siguiente</th>
                <th className="p-3">Siguiente (Q1+ Q0+)</th>
                <th className="p-3 text-center">Salidas (Y_B, Y_N, Y_T)</th>
                <th className="p-3 text-center bg-blue-950/40 border-l border-slate-800">
                  {config.ffType === 'D' ? 'Excitación D (D1, D0)' : 'Excitación JK (J1 K1, J0 K0)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transitionTable.map((row, idx) => {
                const isCurrent = row.currentState === currentHeartState;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-blue-600/10 font-bold text-slate-100'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="p-3 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATE_DEFINITIONS[row.currentState].color }}
                      />
                      {STATE_DEFINITIONS[row.currentState].name}
                    </td>
                    <td className="p-3 text-blue-400 font-bold">{row.currentStateCode}</td>
                    <td className="p-3 text-slate-400">{row.countCondition}</td>
                    <td className="p-3 text-emerald-400">{STATE_DEFINITIONS[row.nextState].name}</td>
                    <td className="p-3 text-emerald-400 font-bold">{row.nextStateCode}</td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-950 px-2 py-1 rounded text-slate-200">
                        {row.yBradi}, {row.yNormal}, {row.yTaqui}
                      </span>
                    </td>
                    <td className="p-3 text-center bg-blue-950/20 border-l border-slate-800 font-bold text-blue-300">
                      {config.ffType === 'D'
                        ? `D1=${row.d1}, D0=${row.d0}`
                        : `J1=${row.j1}, K1=${row.k1} | J0=${row.j0}, K0=${row.k0}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Karnaugh Maps (K-Maps) & Boolean Minimization Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-400" />
            Mapas de Karnaugh (K-Maps) & Ecuaciones Lógicas Simplificadas
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Minimización Booleana por Álgebra de Boole / Quine-McCluskey
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kMaps.map((kmap, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="font-bold text-blue-400">{kmap.title}</span>
                  <span className="text-slate-500">
                    {kmap.rowVar} \ {kmap.colVars}
                  </span>
                </div>

                {/* K-Map Grid */}
                <div className="my-2 overflow-x-auto">
                  <table className="w-full text-center font-mono text-xs border border-slate-800">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400">
                        <th className="p-1.5 border border-slate-800">
                          {kmap.rowVar}\{kmap.colVars}
                        </th>
                        {kmap.colLabels.map((c, i) => (
                          <th key={i} className="p-1.5 border border-slate-800 font-bold text-slate-300">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {kmap.grid.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="p-1.5 bg-slate-900 font-bold text-slate-400 border border-slate-800">
                            {kmap.rowLabels[rIdx]}
                          </td>
                          {row.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              className={`p-1.5 border border-slate-800 font-bold ${
                                val === '1'
                                  ? 'bg-blue-600/30 text-blue-300'
                                  : val === 'X'
                                  ? 'text-yellow-500'
                                  : 'text-slate-600'
                              }`}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Simplified Equation */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  ECUACIÓN MINIMIZADA:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded block">
                  {kmap.simplifiedEquation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
