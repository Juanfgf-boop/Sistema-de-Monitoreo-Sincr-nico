export type HeartState = 'BRADICARDIA' | 'RITMO_NORMAL' | 'TAQUICARDIA' | 'RESET';

export type FlipFlopType = 'D' | 'JK';

export type EncodingType = 'BINARY' | 'GRAY' | 'ONE_HOT';

export interface SystemConfig {
  f_clk: number; // Hz (e.g. 10 Hz or 100 Hz)
  bradyThresholdBpm: number; // Default 60 BPM
  tachyThresholdBpm: number; // Default 100 BPM
  ffType: FlipFlopType;
  encodingType: EncodingType;
  counterBits: number; // e.g. 4 or 8 bits
  noiseLevel: number; // 0 to 1
  samplingWindowSec: number; // e.g., 1.0 s or 6.0 s
}

export interface ECGPoint {
  time: number; // in seconds
  voltage: number; // mV
  isQrsPeak: boolean;
  qrsPulse: number; // 0 or 1 digital signal
}

export interface StateDefinition {
  id: HeartState;
  code: string; // e.g. '01'
  name: string;
  bpmRange: string;
  trrRange: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface TransitionTableRow {
  currentState: HeartState;
  currentStateCode: string; // Q1 Q0
  qrsPulse: number; // X
  countCondition: string; // e.g., "Count > N_bradi" or "Count < N_taqui"
  nextState: HeartState;
  nextStateCode: string; // Q1+ Q0+
  yBradi: number;
  yNormal: number;
  yTaqui: number;
  // Excitation outputs for D Flip Flop
  d1: number;
  d0: number;
  // Excitation outputs for JK Flip Flop
  j1: string;
  k1: string;
  j0: string;
  k0: string;
}

export interface KMapCell {
  row: string; // e.g., "0" or "1"
  col: string; // e.g., "00", "01", "11", "10"
  val: string; // "0", "1", "X"
}

export interface KMapData {
  title: string;
  variableName: string;
  rowVar: string;
  colVars: string;
  grid: string[][]; // 2x4 or 2x2
  rowLabels: string[];
  colLabels: string[];
  simplifiedEquation: string;
}

export interface TimingSample {
  id: number;
  timeSec: number;
  clk: number; // 0 or 1
  qrsSignal: number; // 0 or 1
  counterValue: number;
  qBits: number[]; // [Q3, Q2, Q1, Q0]
  state: HeartState;
  yBradi: number;
  yNormal: number;
  yTaqui: number;
}

export interface MedicalParams {
  bpm: number;
  tRR: number; // seconds
  fQRS: number; // Hz
  calculatedCount: number;
  isBrady: boolean;
  isNormal: boolean;
  isTachy: boolean;
}
