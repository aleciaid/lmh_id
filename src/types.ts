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
  pushUps: number;
  sitUps: number;
  dayNumber: number;
}

export interface OCDRecord {
  id: string;
  type: 'puasa' | 'cheating';
  startTime: string;
  level?: 1 | 2 | 3;
  dayNumber: number;
  createdAt: string;
}

export interface DBSchema {
  sleepRecords: SleepRecord[];
  exerciseRecords: ExerciseRecord[];
  ocdRecords: OCDRecord[];
}