import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  addExerciseRecord, 
  getAllExerciseRecords, 
  updateExerciseRecord, 
  deleteExerciseRecord,
  getNextDayNumber 
} from '../db';
import type { ExerciseRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { toast } from 'react-hot-toast';

export function OlahragaTrack() {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    walkingDuration: '',
    calories: '',
    pushUps: '',
    sitUps: ''
  });

  const { storage, user } = useAuth();

  useEffect(() => {
    loadRecords();
  }, [storage]);

  async function loadRecords() {
    try {
      setLoading(true);
      const allRecords = await storage.getAllExerciseRecords();
      setRecords(allRecords.sort((a, b) => b.dayNumber - a.dayNumber));
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load exercise records');
    } finally {
      setLoading(false);
    }
  }

  function getCurrentJakartaDate() {
    const date = new Date();
    const jakartaOptions = { timeZone: 'Asia/Jakarta' };
    return new Date(date.toLocaleString('en-US', jakartaOptions)).toISOString().split('T')[0];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add exercise records');
      return;
    }

    const record: ExerciseRecord = {
      id: editingRecord?.id || crypto.randomUUID(),
      date: getCurrentJakartaDate(),
      walkingDuration: Number(formData.walkingDuration),
      calories: Number(formData.calories),
      pushUps: Number(formData.pushUps),
      sitUps: Number(formData.sitUps),
      dayNumber: editingRecord?.dayNumber || await getNextDayNumber()
    };

    try {
      if (editingRecord) {
        await storage.updateExerciseRecord(record);
      } else {
        await storage.addExerciseRecord(record);
      }

      setFormData({
        walkingDuration: '',
        calories: '',
        pushUps: '',
        sitUps: ''
      });
      setEditingRecord(null);
      await loadRecords();
    } catch (error) {
      console.error('Error saving exercise record:', error);
      toast.error('Failed to save exercise record');
    }
  }

  async function handleEdit(record: ExerciseRecord) {
    setEditingRecord(record);
    setFormData({
      walkingDuration: record.walkingDuration.toString(),
      calories: record.calories.toString(),
      pushUps: record.pushUps.toString(),
      sitUps: record.sitUps.toString()
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!user) {
      toast.error('Please login to delete records');
      return;
    }

    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await storage.deleteExerciseRecord(id);
        await loadRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        toast.error('Failed to delete record');
      }
    }
  }

  const filteredRecords = records.filter(record => 
    record.dayNumber.toString().includes(searchTerm) ||
    record.date.includes(searchTerm) ||
    record.walkingDuration.toString().includes(searchTerm) ||
    record.calories.toString().includes(searchTerm) ||
    record.pushUps.toString().includes(searchTerm) ||
    record.sitUps.toString().includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Olahraga Track</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span>{showForm ? 'Hide Form' : 'Show Form'}</span>
          </button>
        </div>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={getCurrentJakartaDate()}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Lama Jalan Kaki (menit)
              </label>
              <input
                type="number"
                value={formData.walkingDuration}
                onChange={(e) => setFormData({ ...formData, walkingDuration: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kalori
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Push Up (minimal 5x)
              </label>
              <input
                type="number"
                value={formData.pushUps}
                onChange={(e) => setFormData({ ...formData, pushUps: e.target.value })}
                required
                min="5"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Sit Up (minimal 25x)
              </label>
              <input
                type="number"
                value={formData.sitUps}
                onChange={(e) => setFormData({ ...formData, sitUps: e.target.value })}
                required
                min="25"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!user}
            className={`w-full py-2 px-4 rounded-lg ${
              user 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            {editingRecord ? 'Update Record' : 'Submit'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  Olahraga Day {record.dayNumber}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(record)}
                    disabled={!user}
                    className={`p-2 rounded-lg ${
                      user 
                        ? 'text-blue-600 hover:bg-blue-50' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    disabled={!user}
                    className={`p-2 rounded-lg ${
                      user 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p>Tanggal: {new Date(record.date).toLocaleDateString()}</p>
                  <p>Jalan Kaki: {record.walkingDuration} menit</p>
                </div>
                <div>
                  <p>Kalori: {record.calories}</p>
                  <p>Push Up: {record.pushUps}x</p>
                  <p>Sit Up: {record.sitUps}x</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}