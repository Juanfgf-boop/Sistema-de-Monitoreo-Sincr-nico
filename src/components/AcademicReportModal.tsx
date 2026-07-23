import React from 'react';
import { X, Printer, Download, BookOpen, CheckCircle2, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { FlipFlopType, HeartState, SystemConfig } from '../types';
import {
  generateKMaps,
  generateTransitionTable,
  STATE_DEFINITIONS,
} from '../utils/digitalLogic';

interface AcademicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  currentBpm: number;
}

export const AcademicReportModal: React.FC<AcademicReportModalProps> = ({
  isOpen,
  onClose,
  config,
  currentBpm,
}) => {
  if (!isOpen) return null;

  const transitionTable = generateTransitionTable(config.ffType);
  const kMaps = generateKMaps(config.ffType);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Header toolbar */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Informe Técnico: Modelado Digital de Frecuencia Cardíaca
              </h2>
              <p className="text-xs text-slate-400">
                Diseño Secuencial y Control Temporizado Síncrono por Complejo QRS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-3 py-2 rounded-xl transition cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 space-y-8 print:text-black print:bg-white text-xs sm:text-sm leading-relaxed">
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-6 text-center space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              PROYECTO DE DISEÑO DIGITAL SÍNCRONO & CONTROL TEMPORIZADO
            </span>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Modelado Digital de Frecuencia Cardíaca mediante Sistemas Secuenciales Síncronos
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Caso de Estudio: Detección de Complejos QRS y Clasificación de Ritmo Sinusal
            </p>
          </div>

          {/* Section 1: Introduction & Medical Rationale */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 border-l-4 border-blue-500 pl-3">
              1. Fundamentación Médica y Parámetros Clínicos
            </h3>
            <p className="text-slate-300">
              El ritmo cardíaco humano se evalúa midiendo el intervalo de tiempo transcurrido entre dos picos
              consecutivos del complejo QRS (intervalo T_RR). Basado en estándares electrofisiológicos
              fisiológicos, la frecuencia cardíaca instantánea se clasifica en tres estados lógicos excluyentes:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs text-slate-300 pl-2">
              <li>
                <strong className="text-blue-400">Bradicardia:</strong> Frecuencia inferior a 60 BPM
                (T_RR &gt; 1.00 s).
              </li>
              <li>
                <strong className="text-emerald-400">Ritmo Sinusal Normal:</strong> Frecuencia entre 60 y 100 BPM
                (0.60 s &le; T_RR &le; 1.00 s).
              </li>
              <li>
                <strong className="text-red-400">Taquicardia:</strong> Frecuencia superior a 100 BPM
                (T_RR &lt; 0.60 s).
              </li>
            </ul>
          </section>

          {/* Section 2: FSM Design & Encoding */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 border-l-4 border-indigo-500 pl-3">
              2. Arquitectura de la Máquina de Estados Finita (FSM)
            </h3>
            <p className="text-slate-300">
              Se utiliza un código binario de 2 bits (Q1 Q0) para codificar los estados lógicos del sistema:
            </p>

            <div className="overflow-x-auto my-3">
              <table className="w-full text-left font-mono text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-2.5">Estado Lógico</th>
                    <th className="p-2.5">Código Binario (Q1 Q0)</th>
                    <th className="p-2.5">Condición R-R (T_RR)</th>
                    <th className="p-2.5">Salida Decodificada (Y_B, Y_N, Y_T)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-400">RESET / INIT</td>
                    <td className="p-2.5 text-slate-400 font-bold">00</td>
                    <td className="p-2.5 text-slate-400">Inicialización</td>
                    <td className="p-2.5">0, 0, 0</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-400">BRADICARDIA</td>
                    <td className="p-2.5 text-blue-400 font-bold">01</td>
                    <td className="p-2.5">T_RR &gt; 1.00 s</td>
                    <td className="p-2.5">1, 0, 0</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">RITMO NORMAL</td>
                    <td className="p-2.5 text-emerald-400 font-bold">10</td>
                    <td className="p-2.5">0.60 s &le; T_RR &le; 1.00 s</td>
                    <td className="p-2.5">0, 1, 0</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-red-400">TAQUICARDIA</td>
                    <td className="p-2.5 text-red-400 font-bold">11</td>
                    <td className="p-2.5">T_RR &lt; 0.60 s</td>
                    <td className="p-2.5">0, 0, 1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Transition & Excitation Table */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 border-l-4 border-emerald-500 pl-3">
              3. Tabla de Transición y Excitación de Flip-Flops ({config.ffType})
            </h3>
            <p className="text-slate-300">
              Las funciones de excitación para los Flip-Flops tipo {config.ffType} se determinan analizando las
              transiciones requeridas en cada flanco de reloj síncrono:
            </p>

            <div className="overflow-x-auto my-3">
              <table className="w-full text-left font-mono text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-2">Estado (Q1 Q0)</th>
                    <th className="p-2">Condición R-R</th>
                    <th className="p-2">Siguiente (Q1+ Q0+)</th>
                    <th className="p-2">Salidas Decodificadas</th>
                    <th className="p-2 font-bold text-blue-400">Excitación ({config.ffType})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transitionTable.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2 font-bold">{row.currentStateCode}</td>
                      <td className="p-2 text-slate-400">{row.countCondition}</td>
                      <td className="p-2 font-bold text-emerald-400">{row.nextStateCode}</td>
                      <td className="p-2">
                        {row.yBradi}, {row.yNormal}, {row.yTaqui}
                      </td>
                      <td className="p-2 font-bold text-blue-300">
                        {config.ffType === 'D'
                          ? `D1=${row.d1}, D0=${row.d0}`
                          : `J1=${row.j1}, K1=${row.k1} | J0=${row.j0}, K0=${row.k0}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Boolean Logic & Output Decoders */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 border-l-4 border-purple-500 pl-3">
              4. Ecuaciones Lógicas Simplificadas de Salida
            </h3>
            <p className="text-slate-300">
              Mediante mapas de Karnaugh, las ecuaciones mínimas para los decodificadores de salida y las banderas LED
              son:
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-blue-400">
                Y_BRADI = NOT(Q1) &bull; Q0 &nbsp;&nbsp;&nbsp;&nbsp; (Lógica Activa en Alto)
              </div>
              <div className="text-emerald-400">
                Y_NORMAL = Q1 &bull; NOT(Q0) &nbsp;&nbsp;&nbsp;&nbsp; (Lógica Activa en Alto)
              </div>
              <div className="text-red-400">
                Y_TAQUI = Q1 &bull; Q0 &nbsp;&nbsp;&nbsp;&nbsp; (Lógica Activa en Alto)
              </div>
            </div>
          </section>

          {/* Section 5: Conclusions */}
          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h3 className="text-base font-bold text-slate-100 border-l-4 border-emerald-500 pl-3">
              5. Conclusiones del Diseño Digital Síncrono
            </h3>
            <p className="text-slate-300">
              El diseño secuencial síncrono presentado permite una clasificación en tiempo real precisa del ritmo
              cardíaco, eliminando el riesgo de estados espurios o glitching gracias a la sincronización con el reloj
              maestro CLK y la señal de habilitación producida por el complejo QRS.
            </p>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-slate-900/95 border-t border-slate-800 px-6 py-4 flex justify-between items-center">
          <span className="text-xs font-mono text-slate-400">
            Frecuencia Configurada: {config.f_clk} Hz | BPM Actual: {currentBpm}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl cursor-pointer"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
};
