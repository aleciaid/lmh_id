export interface SleepRecord {
  id: string;
  timestamp: string;
  status: 'bangun' | 'sleep';
}

export interface ExerciseRecord {
  id: string;
  date: string;
  walkingDuration: number;
  calories: number;
  push_ups: number;
  sit_ups: number;
  day_number: number;
}

export interface OCDRecord {
  id: string;
  type: 'puasa' | 'cheating';
  start_time: string;
  level?: 1 | 2 | 3;
  day_number: number;
  created_at: string;
  weight?: number; // New field for weight after fasting
}

export interface DBSchema {
  sleepRecords: SleepRecord[];
  exerciseRecords: ExerciseRecord[];
  ocdRecords: OCDRecord[];
}