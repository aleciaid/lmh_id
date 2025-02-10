import { openDB } from 'idb';
import { supabase } from './supabase';
import type { SleepRecord, ExerciseRecord, OCDRecord } from '../types';
import { toast } from 'react-hot-toast';

// IndexedDB setup
const DB_NAME = 'lifestyle-tracker-local';
const DB_VERSION = 1;

async function initLocalDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sleepRecords')) {
        const sleepStore = db.createObjectStore('sleepRecords', { keyPath: 'id' });
        sleepStore.createIndex('by-timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('exerciseRecords')) {
        const exerciseStore = db.createObjectStore('exerciseRecords', { keyPath: 'id' });
        exerciseStore.createIndex('by-date', 'date');
      }
      if (!db.objectStoreNames.contains('ocdRecords')) {
        const ocdStore = db.createObjectStore('ocdRecords', { keyPath: 'id' });
        ocdStore.createIndex('by-created', 'createdAt');
      }
    },
  });
}

// Storage class to handle both local and remote storage
export class Storage {
  private user_id: string | null = null;

  constructor(userId?: string) {
    this.user_id = userId || null;
    if (userId) {
      this.clearLocalData().catch(console.error);
    }
  }

  private async getDB() {
    return await initLocalDB();
  }

  // Clear local data when user logs in
  private async clearLocalData() {
    try {
      const db = await this.getDB();
      
      // Clear all stores
      await Promise.all([
        db.clear('sleepRecords'),
        db.clear('exerciseRecords'),
        db.clear('ocdRecords')
      ]);

      toast.success('Switched to cloud storage. Please re-enter your data.');
    } catch (error) {
      console.error('Error clearing local data:', error);
      toast.error('Failed to clear local data');
    }
  }

  // Sleep Records
  async addSleepRecord(record: SleepRecord) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('sleep_records')
          .insert([{ ...record, user_id: this.user_id }]);
        if (error) throw error;
        toast.success('Sleep record saved successfully!');
      } else {
        const db = await this.getDB();
        await db.add('sleepRecords', record);
        toast.success('Sleep record saved locally!');
      }
    } catch (error) {
      console.error('Error saving sleep record:', error);
      toast.error('Failed to save sleep record');
      throw error;
    }
  }

  async getAllSleepRecords() {
    try {
      if (this.user_id) {
        const { data, error } = await supabase
          .from('sleep_records')
          .select('*')
          .eq('user_id', this.user_id)
          .order('timestamp', { ascending: false });
        if (error) throw error;
        return data;
      } else {
        const db = await this.getDB();
        return await db.getAllFromIndex('sleepRecords', 'by-timestamp');
      }
    } catch (error) {
      console.error('Error fetching sleep records:', error);
      toast.error('Failed to fetch sleep records');
      throw error;
    }
  }

  async deleteSleepRecord(id: string) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('sleep_records')
          .delete()
          .eq('id', id);
        if (error) throw error;
        toast.success('Sleep record deleted successfully!');
      } else {
        const db = await this.getDB();
        await db.delete('sleepRecords', id);
        toast.success('Sleep record deleted locally!');
      }
    } catch (error) {
      console.error('Error deleting sleep record:', error);
      toast.error('Failed to delete sleep record');
      throw error;
    }
  }

  // Exercise Records
  async addExerciseRecord(record: ExerciseRecord) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('exercise_records')
          .insert([{ ...record, user_id: this.user_id }]);
        if (error) throw error;
        toast.success('Exercise record saved successfully!');
      } else {
        const db = await this.getDB();
        await db.add('exerciseRecords', record);
        toast.success('Exercise record saved locally!');
      }
    } catch (error) {
      console.error('Error saving exercise record:', error);
      toast.error('Failed to save exercise record');
      throw error;
    }
  }

  async getAllExerciseRecords() {
    try {
      if (this.user_id) {
        const { data, error } = await supabase
          .from('exercise_records')
          .select('*')
          .eq('user_id', this.user_id)
          .order('date', { ascending: false });
        if (error) throw error;
        return data;
      } else {
        const db = await this.getDB();
        return await db.getAllFromIndex('exerciseRecords', 'by-date');
      }
    } catch (error) {
      console.error('Error fetching exercise records:', error);
      toast.error('Failed to fetch exercise records');
      throw error;
    }
  }

  async updateExerciseRecord(record: ExerciseRecord) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('exercise_records')
          .update({ ...record, user_id: this.user_id })
          .eq('id', record.id);
        if (error) throw error;
        toast.success('Exercise record updated successfully!');
      } else {
        const db = await this.getDB();
        await db.put('exerciseRecords', record);
        toast.success('Exercise record updated locally!');
      }
    } catch (error) {
      console.error('Error updating exercise record:', error);
      toast.error('Failed to update exercise record');
      throw error;
    }
  }

  async deleteExerciseRecord(id: string) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('exercise_records')
          .delete()
          .eq('id', id);
        if (error) throw error;
        toast.success('Exercise record deleted successfully!');
      } else {
        const db = await this.getDB();
        await db.delete('exerciseRecords', id);
        toast.success('Exercise record deleted locally!');
      }
    } catch (error) {
      console.error('Error deleting exercise record:', error);
      toast.error('Failed to delete exercise record');
      throw error;
    }
  }

  // OCD Records
  async addOCDRecord(record: OCDRecord) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('ocd_records')
          .insert([{ ...record, user_id: this.user_id }]);
        if (error) throw error;
        toast.success('OCD record saved successfully!');
      } else {
        const db = await this.getDB();
        await db.add('ocdRecords', record);
        toast.success('OCD record saved locally!');
      }
    } catch (error) {
      console.error('Error saving OCD record:', error);
      toast.error('Failed to save OCD record');
      throw error;
    }
  }

  async getAllOCDRecords() {
    try {
      if (this.user_id) {
        const { data, error } = await supabase
          .from('ocd_records')
          .select('*')
          .eq('user_id', this.user_id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } else {
        const db = await this.getDB();
        return await db.getAllFromIndex('ocdRecords', 'by-created');
      }
    } catch (error) {
      console.error('Error fetching OCD records:', error);
      toast.error('Failed to fetch OCD records');
      throw error;
    }
  }

  async updateOCDRecord(record: OCDRecord) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('ocd_records')
          .update({ ...record, user_id: this.user_id })
          .eq('id', record.id);
        if (error) throw error;
        toast.success('OCD record updated successfully!');
      } else {
        const db = await this.getDB();
        await db.put('ocdRecords', record);
        toast.success('OCD record updated locally!');
      }
    } catch (error) {
      console.error('Error updating OCD record:', error);
      toast.error('Failed to update OCD record');
      throw error;
    }
  }

  async deleteOCDRecord(id: string) {
    try {
      if (this.user_id) {
        const { error } = await supabase
          .from('ocd_records')
          .delete()
          .eq('id', id);
        if (error) throw error;
        toast.success('OCD record deleted successfully!');
      } else {
        const db = await this.getDB();
        await db.delete('ocdRecords', id);
        toast.success('OCD record deleted locally!');
      }
    } catch (error) {
      console.error('Error deleting OCD record:', error);
      toast.error('Failed to delete OCD record');
      throw error;
    }
  }
}

// Storage context to manage current storage instance
export const createStorage = (userId?: string) => new Storage(userId);