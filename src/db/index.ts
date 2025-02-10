import { openDB, DBSchema } from 'idb';
import type { SleepRecord, ExerciseRecord, OCDRecord } from '../types';
import { deleteSleepRecord } from '/src/db/index';

interface MyDB extends DBSchema {
  sleepRecords: {
    key: string;
    value: SleepRecord;
    indexes: { 'by-timestamp': string };
  };
  exerciseRecords: {
    key: string;
    value: ExerciseRecord;
    indexes: { 'by-date': string };
  };
  ocdRecords: {
    key: string;
    value: OCDRecord;
    indexes: { 'by-created': string };
  };
}

const DB_NAME = 'lifestyle-tracker';
const DB_VERSION = 3;

export async function initDB() {
  return openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const sleepStore = db.createObjectStore('sleepRecords', {
          keyPath: 'id',
        });
        sleepStore.createIndex('by-timestamp', 'timestamp');
      }
      
      if (oldVersion < 2) {
        const exerciseStore = db.createObjectStore('exerciseRecords', {
          keyPath: 'id',
        });
        exerciseStore.createIndex('by-date', 'date');
      }

      if (oldVersion < 3) {
        const ocdStore = db.createObjectStore('ocdRecords', {
          keyPath: 'id',
        });
        ocdStore.createIndex('by-created', 'createdAt');
      }
    },
  });
}

export async function addSleepRecord(record: SleepRecord) {
  const db = await initDB();
  return db.add('sleepRecords', record);
}

export async function getAllSleepRecords() {
  const db = await initDB();
  return db.getAllFromIndex('sleepRecords', 'by-timestamp');
}

export async function deleteSleepRecord(id: string) {
  const db = await initDB();
  return db.delete('sleepRecords', id);
}

export async function addExerciseRecord(record: ExerciseRecord) {
  const db = await initDB();
  return db.add('exerciseRecords', record);
}

export async function getAllExerciseRecords() {
  const db = await initDB();
  return db.getAllFromIndex('exerciseRecords', 'by-date');
}

export async function updateExerciseRecord(record: ExerciseRecord) {
  const db = await initDB();
  return db.put('exerciseRecords', record);
}

export async function deleteExerciseRecord(id: string) {
  const db = await initDB();
  return db.delete('exerciseRecords', id);
}

export async function getNextDayNumber() {
  const db = await initDB();
  const records = await db.getAllFromIndex('exerciseRecords', 'by-date');
  return records.length > 0 ? Math.max(...records.map(r => r.dayNumber)) + 1 : 1;
}

export async function addOCDRecord(record: OCDRecord) {
  const db = await initDB();
  return db.add('ocdRecords', record);
}

export async function getAllOCDRecords() {
  const db = await initDB();
  return db.getAllFromIndex('ocdRecords', 'by-created');
}

export async function updateOCDRecord(record: OCDRecord) {
  const db = await initDB();
  return db.put('ocdRecords', record);
}

export async function deleteOCDRecord(id: string) {
  const db = await initDB();
  return db.delete('ocdRecords', id);
}

export async function getNextOCDDayNumber() {
  const db = await initDB();
  const records = await db.getAllFromIndex('ocdRecords', 'by-created');
  return records.length > 0 ? Math.max(...records.map(r => r.dayNumber)) + 1 : 1;
}