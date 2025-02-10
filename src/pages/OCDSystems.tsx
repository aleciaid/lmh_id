import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Clock } from 'lucide-react';
import type { OCDRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { toast } from 'react-hot-toast';

export function OCDSystems() {
  const [records, setRecords] = useState<OCDRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OCDRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'puasa' as 'puasa' | 'cheating',
    start_time: getCurrentJakartaDateTime(), // Initialize with current time
    level: '1' as '1' | '2' | '3',
    weight: ''
  });

  const { storage } = useAuth();

  useEffect(() => {
    loadRecords();
  }, [storage]);

  async function loadRecords() {
    try {
      setLoading(true);
      const allRecords = await storage.getAllOCDRecords();
      const sortedRecords = allRecords.sort((a, b) => {
        if (b.day_number !== a.day_number) {
          return b.day_number - a.day_number;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  }

  function getCurrentJakartaDateTime() {
    const date = new Date();
    const jakartaOptions = { timeZone: 'Asia/Jakarta' };
    return new Date(date.toLocaleString('en-US', jakartaOptions))
      .toISOString()
      .slice(0, 16);
  }

  function handleTimeNow() {
    setFormData(prev => ({
      ...prev,
      start_time: getCurrentJakartaDateTime()
    }));
  }

  function resetForm() {
    setFormData({
      type: 'puasa',
      start_time: getCurrentJakartaDateTime(),
      level: '1',
      weight: ''
    });
    setEditingRecord(null);
    setShowModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate start_time
    if (formData.type === 'puasa' && !formData.start_time) {
      toast.error('Please set a start time');
      return;
    }

    try {
      const nextDayNumber = records.length > 0 
        ? Math.max(...records.map(r => r.day_number)) + 1 
        : 1;

      const record: OCDRecord = {
        id: editingRecord?.id || crypto.randomUUID(),
        type: formData.type,
        start_time: formData.type === 'puasa' ? formData.start_time : getCurrentJakartaDateTime(),
        level: formData.type === 'puasa' ? Number(formData.level) as 1 | 2 | 3 : undefined,
        day_number: editingRecord?.day_number || nextDayNumber,
        created_at: new Date().toISOString(),
        weight: formData.weight ? Number(formData.weight) : undefined
      };

      if (editingRecord) {
        await storage.updateOCDRecord(record);
        toast.success('Record updated successfully');
      } else {
        await storage.addOCDRecord(record);
        toast.success('Record added successfully');
      }

      resetForm();
      await loadRecords();
    } catch (error) {
      console.error('Error saving OCD record:', error);
      toast.error('Failed to save record');
    }
  }

  async function handleEdit(record: OCDRecord) {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      start_time: record.start_time,
      level: record.level?.toString() as '1' | '2' | '3' || '1',
      weight: record.weight?.toString() || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await storage.deleteOCDRecord(id);
        toast.success('Record deleted successfully');
        await loadRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        toast.error('Failed to delete record');
      }
    }
  }

  function calculateFastingEndTime(start_time: string, level: number): string {
    const start = new Date(start_time);
    let hours = 16;
    
    switch (level) {
      case 2:
        hours = 18;
        break;
      case 3:
        hours = 20;
        break;
      default:
        hours = 16;
    }
    
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return end.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  }

  const filteredRecords = records.filter(record => 
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.day_number.toString().includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">OCD Systems</h1>
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
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingRecord ? 'Edit Record' : 'Add New Record'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'puasa' | 'cheating' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="puasa">Puasa</option>
                  <option value="cheating">Cheating Days</option>
                </select>
              </div>

              {formData.type === 'puasa' ? (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Start Time
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleTimeNow}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Clock size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as '1' | '2' | '3' })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Level 1 - 8 jam makan</option>
                      <option value="2">Level 2 - 6 jam makan</option>
                      <option value="3">Level 3 - 4 jam makan</option>
                    </select>
                  </div>

                  {editingRecord && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Berat Badan Setelah Puasa (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Masukkan berat badan"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  Cheating Day - Enjoy Your Day!
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingRecord ? 'Update Record' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
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
                  OCD Day {record.day_number}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>Type: <span className="capitalize">{record.type}</span></p>
                {record.type === 'puasa' && (
                  <>
                    <p>Start Time: {new Date(record.start_time).toLocaleString()}</p>
                    <p>Waktu Berbuka: {calculateFastingEndTime(record.start_time, record.level!)}</p>
                    <p>Level: {record.level} ({record.level === 1 ? '8' : record.level === 2 ? '6' : '4'} jam makan)</p>
                    {record.weight && (
                      <p>Berat Badan: {record.weight} kg</p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}