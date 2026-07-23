import React from 'react';
import { Sparkles, Calculator, BookOpen, CheckCircle2, ShieldCheck, Sliders } from 'lucide-react';
import { SystemConfig } from '../types';
import { calculateMedicalParams } from '../utils/digitalLogic';

interface EngineeringWorkbenchProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  bpm: number;
}

export const EngineeringWorkbench: React.FC<EngineeringWorkbenchProps> = ({
  config,
  setConfig,
  bpm,
}) => {
  const params = calculateMedicalParams(bpm, config.f_clk);

  // Calculations at different clocks
  const calc10Hz = calculateMedicalParams(bpm, 10);
  const calc100Hz = calculateMedicalParams(bpm, 100);
  const calc1000Hz = calculateMedicalParams(bpm, 1000);

  const nBradiCount = Math.round(1.0 * config.f_clk);
  const nTaquiCount = Math.round(0.6 * config.f_clk);

  const minBits = Math.ceil(Math.log2(nBradiCount * 2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-400" />
            CÁLCULO Y PARÁMETROS DE DISEÑO TÉCNICO
          </h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">
            Fundamentos Teóricos y Ecuaciones Síncronas Basadas en Parámetros Clínicos
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 font-mono text-xs">
          <span className="text-slate-400 uppercase text-[10px]">BITS MÍNIMOS REGISTRO:</span>
          <span className="text-sky-400 font-bold">{minBits} BITS (N_min)</span>
        </div>
      </div>

      {/* Formulas & Calculations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formula Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>ECUACIÓN CLÍNICA 1</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Intervalo R-R (T_RR)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tiempo transcurrido entre dos ondas R consecutivas del complejo QRS.
            </p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs space-y-2">
              <div className="text-blue-400 font-bold">T_RR = 60 / BPM</div>
              <div className="text-slate-300">
                Para BPM = {bpm}: <strong className="text-slate-100">{params.tRR} s</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Rango Sinusal Normal: 0.60 s - 1.00 s</span>
          </div>
        </div>

        {/* Formula Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>ECUACIÓN DIGITAL 2</span>
              <Calculator className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Conteo del Reloj Síncrono (N)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Número de pulsos acumulados en el contador durante el intervalo T_RR.
            </p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-bold">N = T_RR &times; f_clk</div>
              <div className="text-slate-300">
                Con f_clk = {config.f_clk} Hz: <strong className="text-slate-100">{params.calculatedCount} ciclos</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Resolución de Muestreo: {(1000 / config.f_clk).toFixed(1)} ms</span>
          </div>
        </div>

        {/* Formula Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>UMBRALES COMPARADORES</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Límites Lógicos (N_bradi, N_taqui)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Condiciones de comparación para la decodificación del estado.
            </p>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs space-y-2">
              <div className="text-purple-300">N_bradi = 1.00s &times; {config.f_clk}Hz = <strong className="text-slate-100">{nBradiCount}</strong></div>
              <div className="text-purple-300">N_taqui = 0.60s &times; {config.f_clk}Hz = <strong className="text-slate-100">{nTaquiCount}</strong></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Detección de Bradicardia si N &gt; {nBradiCount}</span>
          </div>
        </div>
      </div>

      {/* Comparison Matrix across Clock Frequencies */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          Comparación de Parámetros a Múltiples Frecuencias de Reloj
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="p-3">Frecuencia Reloj (f_clk)</th>
                <th className="p-3">Periodo (T_clk)</th>
                <th className="p-3">Conteo Bradicardia (N_bradi)</th>
                <th className="p-3">Conteo Taquicardia (N_taqui)</th>
                <th className="p-3">Conteo Actual (N_BPM)</th>
                <th className="p-3 font-bold text-emerald-400">Bits Mínimos (N_bits)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-blue-400">10 Hz</td>
                <td className="p-3 text-slate-300">100 ms</td>
                <td className="p-3 text-slate-300">10 ciclos</td>
                <td className="p-3 text-slate-300">6 ciclos</td>
                <td className="p-3 text-slate-100 font-bold">{calc10Hz.calculatedCount} ciclos</td>
                <td className="p-3 font-bold text-emerald-400">4 Bits</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-blue-400">100 Hz</td>
                <td className="p-3 text-slate-300">10 ms</td>
                <td className="p-3 text-slate-300">100 ciclos</td>
                <td className="p-3 text-slate-300">60 ciclos</td>
                <td className="p-3 text-slate-100 font-bold">{calc100Hz.calculatedCount} ciclos</td>
                <td className="p-3 font-bold text-emerald-400">7 Bits</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-blue-400">1000 Hz (1 kHz)</td>
                <td className="p-3 text-slate-300">1 ms</td>
                <td className="p-3 text-slate-300">1000 ciclos</td>
                <td className="p-3 text-slate-300">600 ciclos</td>
                <td className="p-3 text-slate-100 font-bold">{calc1000Hz.calculatedCount} ciclos</td>
                <td className="p-3 font-bold text-emerald-400">11 Bits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
