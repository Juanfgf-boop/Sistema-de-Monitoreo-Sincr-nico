import {
  ECGPoint,
  FlipFlopType,
  HeartState,
  KMapData,
  MedicalParams,
  StateDefinition,
  SystemConfig,
  TimingSample,
  TransitionTableRow,
} from '../types';

// State definitions with binary codes and medical bounds
export const STATE_DEFINITIONS: Record<HeartState, StateDefinition> = {
  RESET: {
    id: 'RESET',
    code: '00',
    name: 'Inicialización / Reset',
    bpmRange: 'N/A',
    trrRange: 'N/A',
    description: 'Estado inicial síncrono en espera de sincronización con el pulso QRS.',
    color: '#64748b',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
  },
  BRADICARDIA: {
    id: 'BRADICARDIA',
    code: '01',
    name: 'Bradicardia',
    bpmRange: '< 60 BPM',
    trrRange: '> 1.00 s',
    description: 'Ritmo cardíaco anormalmente lento. Intervalo R-R prolongado (> 1.0 s).',
    color: '#3b82f6',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  RITMO_NORMAL: {
    id: 'RITMO_NORMAL',
    code: '10',
    name: 'Ritmo Normal',
    bpmRange: '60 - 100 BPM',
    trrRange: '0.60 s - 1.00 s',
    description: 'Ritmo sinusal fisiológico normal. Frecuencia dentro del rango óptimo.',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  TAQUICARDIA: {
    id: 'TAQUICARDIA',
    code: '11',
    name: 'Taquicardia',
    bpmRange: '> 100 BPM',
    trrRange: '< 0.60 s',
    description: 'Ritmo cardíaco elevado. Intervalo R-R acortado (< 0.60 s).',
    color: '#ef4444',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeText: 'text-red-700 dark:text-red-300',
  },
};

/**
 * Calculate medical parameters based on BPM and system clock
 */
export function calculateMedicalParams(bpm: number, fClk: number): MedicalParams {
  const safeBpm = Math.max(20, Math.min(250, bpm));
  const tRR = 60 / safeBpm; // seconds per beat
  const fQRS = safeBpm / 60; // Hz
  const calculatedCount = Math.round(tRR * fClk);

  return {
    bpm: safeBpm,
    tRR: parseFloat(tRR.toFixed(3)),
    fQRS: parseFloat(fQRS.toFixed(3)),
    calculatedCount,
    isBrady: safeBpm < 60,
    isNormal: safeBpm >= 60 && safeBpm <= 100,
    isTachy: safeBpm > 100,
  };
}

/**
 * Get heart state from BPM
 */
export function getHeartStateFromBpm(bpm: number): HeartState {
  if (bpm < 60) return 'BRADICARDIA';
  if (bpm <= 100) return 'RITMO_NORMAL';
  return 'TAQUICARDIA';
}

/**
 * Generate synthetic ECG waveform point given time t and target BPM
 */
export function generateECGPoint(
  tSec: number,
  bpm: number,
  noiseLevel: number = 0.05
): ECGPoint {
  const period = 60 / bpm; // duration of one cardiac cycle in seconds
  const tInCycle = ((tSec % period) + period) % period;

  let voltage = 0; // Baseline in mV (typically 0 mV baseline)

  // P wave (Atrial depolarization) - centered around 0.15 * period
  const pCenter = 0.15 * period;
  const pWidth = 0.04 * period;
  voltage += 0.15 * Math.exp(-Math.pow((tInCycle - pCenter) / pWidth, 2));

  // Q wave - centered around 0.32 * period
  const qCenter = 0.32 * period;
  const qWidth = 0.015 * period;
  voltage -= 0.15 * Math.exp(-Math.pow((tInCycle - qCenter) / qWidth, 2));

  // R peak (Ventricular depolarization) - centered around 0.35 * period
  const rCenter = 0.35 * period;
  const rWidth = 0.02 * period;
  const rPeak = Math.exp(-Math.pow((tInCycle - rCenter) / rWidth, 2));
  voltage += 1.2 * rPeak;

  // S wave - centered around 0.38 * period
  const sCenter = 0.38 * period;
  const sWidth = 0.018 * period;
  voltage -= 0.25 * Math.exp(-Math.pow((tInCycle - sCenter) / sWidth, 2));

  // T wave (Ventricular repolarization) - centered around 0.60 * period
  const tCenter = 0.60 * period;
  const tWidth = 0.08 * period;
  voltage += 0.3 * Math.exp(-Math.pow((tInCycle - tCenter) / tWidth, 2));

  // Add realistic baseline wander and noise
  const baselineWander = 0.03 * Math.sin(2 * Math.PI * 0.25 * tSec);
  const randomNoise = (Math.random() - 0.5) * noiseLevel * 0.1;
  voltage += baselineWander + randomNoise;

  // QRS Pulse extraction (High threshold on R peak > 0.6 mV)
  const isQrsPeak = rPeak > 0.5;
  const qrsPulse = isQrsPeak ? 1 : 0;

  return {
    time: parseFloat(tSec.toFixed(3)),
    voltage: parseFloat(voltage.toFixed(3)),
    isQrsPeak,
    qrsPulse,
  };
}

/**
 * Generate FSM State Transition Table for Heart Rate Monitor
 */
export function generateTransitionTable(ffType: FlipFlopType = 'D'): TransitionTableRow[] {
  // States:
  // 00: RESET / INT
  // 01: BRADICARDIA (Q1=0, Q0=1)
  // 10: RITMO_NORMAL (Q1=1, Q0=0)
  // 11: TAQUICARDIA (Q1=1, Q0=1)

  const states: { state: HeartState; q1: number; q0: number }[] = [
    { state: 'RESET', q1: 0, q0: 0 },
    { state: 'BRADICARDIA', q1: 0, q0: 1 },
    { state: 'RITMO_NORMAL', q1: 1, q0: 0 },
    { state: 'TAQUICARDIA', q1: 1, q0: 1 },
  ];

  const table: TransitionTableRow[] = [];

  states.forEach(({ state, q1, q0 }) => {
    // Condition 1: Long interval (Count > N_bradi => Bradicardia)
    // Condition 2: Normal interval (N_taqui <= Count <= N_bradi => Normal)
    // Condition 3: Short interval (Count < N_taqui => Taquicardia)

    const conditions: { condStr: string; next: HeartState }[] = [
      { condStr: 'T_RR > 1.00s (Count > N_bradi)', next: 'BRADICARDIA' },
      { condStr: '0.60s <= T_RR <= 1.00s (N_taqui <= Count <= N_bradi)', next: 'RITMO_NORMAL' },
      { condStr: 'T_RR < 0.60s (Count < N_taqui)', next: 'TAQUICARDIA' },
    ];

    conditions.forEach(({ condStr, next }) => {
      const nextDef = STATE_DEFINITIONS[next];
      const nextQ1 = parseInt(nextDef.code[0], 10);
      const nextQ0 = parseInt(nextDef.code[1], 10);

      // Outputs
      const yBradi = next === 'BRADICARDIA' ? 1 : 0;
      const yNormal = next === 'RITMO_NORMAL' ? 1 : 0;
      const yTaqui = next === 'TAQUICARDIA' ? 1 : 0;

      // D Flip Flop Excitation: D1 = Q1+, D0 = Q0+
      const d1 = nextQ1;
      const d0 = nextQ0;

      // JK Flip Flop Excitation:
      // Q -> Q+ : (0->0 => J=0, K=X), (0->1 => J=1, K=X), (1->0 => J=X, K=1), (1->1 => J=X, K=0)
      const getJK = (q: number, qNext: number) => {
        if (q === 0 && qNext === 0) return { j: '0', k: 'X' };
        if (q === 0 && qNext === 1) return { j: '1', k: 'X' };
        if (q === 1 && qNext === 0) return { j: 'X', k: '1' };
        return { j: 'X', k: '0' }; // 1 -> 1
      };

      const jk1 = getJK(q1, nextQ1);
      const jk0 = getJK(q0, nextQ0);

      table.push({
        currentState: state,
        currentStateCode: `${q1}${q0}`,
        qrsPulse: 1,
        countCondition: condStr,
        nextState: next,
        nextStateCode: `${nextQ1}${nextQ0}`,
        yBradi,
        yNormal,
        yTaqui,
        d1,
        d0,
        j1: jk1.j,
        k1: jk1.k,
        j0: jk0.j,
        k0: jk0.k,
      });
    });
  });

  return table;
}

/**
 * Generate Karnaugh Maps (K-Maps) for state variables D1, D0 and outputs
 */
export function generateKMaps(ffType: FlipFlopType = 'D'): KMapData[] {
  // Let Inputs be: Q1, Q0, and C (Condition: 01=Brady, 10=Normal, 11=Tachy)
  // Or 2-bit state Q1, Q0 with simplified condition outputs:
  return [
    {
      title: ffType === 'D' ? 'Mapa K para D1 (Estado Siguiente Q1+)' : 'Mapa K para J1',
      variableName: ffType === 'D' ? 'D1' : 'J1',
      rowVar: 'Q1',
      colVars: 'Q0, C1',
      rowLabels: ['0', '1'],
      colLabels: ['00', '01', '11', '10'],
      grid: [
        ['0', '0', '1', '1'], // Q1=0: (Q0,C1)=00,01,11,10
        ['1', '0', '1', '1'], // Q1=1
      ],
      simplifiedEquation:
        ffType === 'D'
          ? 'D1 = C_NORMAL + C_TAQUI (Activa cuando QRS < 1.0s)'
          : 'J1 = C_NORMAL + C_TAQUI',
    },
    {
      title: ffType === 'D' ? 'Mapa K para D0 (Estado Siguiente Q0+)' : 'Mapa K para J0',
      variableName: ffType === 'D' ? 'D0' : 'J0',
      rowVar: 'Q1',
      colVars: 'Q0, C0',
      rowLabels: ['0', '1'],
      colLabels: ['00', '01', '11', '10'],
      grid: [
        ['0', '1', '1', '0'],
        ['0', '1', '1', '0'],
      ],
      simplifiedEquation:
        ffType === 'D'
          ? 'D0 = C_BRADI + C_TAQUI (Activa cuando T_RR fuera del rango sinusal normal)'
          : 'J0 = C_BRADI + C_TAQUI',
    },
    {
      title: 'Decodificador de Salida Y_BRADI',
      variableName: 'Y_BRADI',
      rowVar: 'Q1',
      colVars: 'Q0',
      rowLabels: ['0', '1'],
      colLabels: ['0', '1'],
      grid: [
        ['0', '1'],
        ['0', '0'],
      ],
      simplifiedEquation: 'Y_{BRADI} = \\overline{Q_1} \\cdot Q_0',
    },
    {
      title: 'Decodificador de Salida Y_NORMAL',
      variableName: 'Y_NORMAL',
      rowVar: 'Q1',
      colVars: 'Q0',
      rowLabels: ['0', '1'],
      colLabels: ['0', '1'],
      grid: [
        ['0', '0'],
        ['1', '0'],
      ],
      simplifiedEquation: 'Y_{NORMAL} = Q_1 \\cdot \\overline{Q_0}',
    },
    {
      title: 'Decodificador de Salida Y_TAQUI',
      variableName: 'Y_TAQUI',
      rowVar: 'Q1',
      colVars: 'Q0',
      rowLabels: ['0', '1'],
      colLabels: ['0', '1'],
      grid: [
        ['0', '0'],
        ['0', '1'],
      ],
      simplifiedEquation: 'Y_{TAQUI} = Q_1 \\cdot Q_0',
    },
  ];
}

/**
 * Generate timing simulation sequence over duration T
 */
export function generateTimingSimulation(
  bpm: number,
  config: SystemConfig,
  durationSec: number = 8.0
): TimingSample[] {
  const params = calculateMedicalParams(bpm, config.f_clk);
  const totalSteps = Math.round(durationSec * config.f_clk);
  const dt = 1 / config.f_clk;

  const samples: TimingSample[] = [];
  let counterValue = 0;
  let currentState: HeartState = 'RESET';
  let lastQrsTime = 0;

  for (let step = 0; step < totalSteps; step++) {
    const t = step * dt;
    const clk = step % 2 === 0 ? 1 : 0; // Reference square clock pulse
    const ecg = generateECGPoint(t, bpm, config.noiseLevel);

    // Increment master synchronous counter on rising clock edge
    if (step % 2 === 1) {
      counterValue++;
    }

    // On QRS pulse detection (rising edge of QRS pulse)
    if (ecg.isQrsPeak) {
      const intervalSec = t - lastQrsTime;
      if (intervalSec > 0.2) { // Debounce threshold
        lastQrsTime = t;

        // Synchronous control logic updates heart state based on counter value
        const measuredBpm = intervalSec > 0 ? 60 / intervalSec : bpm;
        currentState = getHeartStateFromBpm(measuredBpm);

        // Synchronous counter reset on QRS sync
        counterValue = 0;
      }
    }

    const stateDef = STATE_DEFINITIONS[currentState];
    const q1 = parseInt(stateDef.code[0], 10);
    const q0 = parseInt(stateDef.code[1], 10);

    // Convert counter value to 4-bit representation
    const cVal = counterValue % 16;
    const qBits = [
      (cVal >> 3) & 1,
      (cVal >> 2) & 1,
      (cVal >> 1) & 1,
      cVal & 1,
    ];

    samples.push({
      id: step,
      timeSec: parseFloat(t.toFixed(2)),
      clk,
      qrsSignal: ecg.qrsPulse,
      counterValue: cVal,
      qBits,
      state: currentState,
      yBradi: currentState === 'BRADICARDIA' ? 1 : 0,
      yNormal: currentState === 'RITMO_NORMAL' ? 1 : 0,
      yTaqui: currentState === 'TAQUICARDIA' ? 1 : 0,
    });
  }

  return samples;
}
