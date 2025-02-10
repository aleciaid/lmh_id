import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Clock } from 'lucide-react';
import { 
  addOCDRecord, 
  getAllOCDRecords, 
  updateOCDRecord, 
  deleteOCDRecord,
  getNextOCDDayNumber 
} from '../db';
import type { OCDRecord } from '../types';

export function OCDSystems() {
  const [records, setRecords] = useState<OCDRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OCDRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: 'puasa' as 'puasa' | 'cheating',
    startTime: '',
    level: '1' as '1' | '2' | '3'
  });

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    const allRecords = await getAllOCDRecords();
    setRecords(allRecords.sort((a, b) => b.dayNumber - a.dayNumber));
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
      startTime: getCurrentJakartaDateTime()
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const record: OCDRecord = {
      id: editingRecord?.id || crypto.randomUUID(),
      type: formData.type,
      startTime: formData.startTime,
      level: formData.type === 'puasa' ? Number(formData.level) as 1 | 2 | 3 : undefined,
      dayNumber: editingRecord?.dayNumber || await getNextOCDDayNumber(),
      createdAt: new Date().toISOString()
    };

    if (editingRecord) {
      await updateOCDRecord(record);
    } else {
      await addOCDRecord(record);
    }

    setFormData({
      type: 'puasa',
      startTime: '',
      level: '1'
    });
    setEditingRecord(null);
    setShowModal(false);
    await loadRecords();
  }

  async function handleEdit(record: OCDRecord) {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      startTime: record.startTime,
      level: record.level?.toString() as '1' | '2' | '3' || '1'
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteOCDRecord(id);
      await loadRecords();
    }
  }

  function getEatingWindow(level: number) {
    switch (level) {
      case 1: return '8 jam';
      case 2: return '6 jam';
      case 3: return '4 jam';
      default: return '';
    }
  }

  function calculateEndTime(startTime: string, level: number): string {
    const start = new Date(startTime);
    let hours = 8;
    
    switch (level) {
      case 2:
        hours = 6;
        break;
      case 3:
        hours = 4;
        break;
      default:
        hours = 8;
    }
    
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return end.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  }

  const filteredRecords = records.filter(record => 
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.dayNumber.toString().includes(searchTerm)
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
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                onClick={() => {
                  setShowModal(false);
                  setEditingRecord(null);
                  setFormData({ type: 'puasa', startTime: '', level: '1' });
                }}
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
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                OCD Day {record.dayNumber}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(record)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>Type: <span className="capitalize">{record.type}</span></p>
              {record.type === 'puasa' && (
                <>
                  <p>Start Time: {new Date(record.startTime).toLocaleString()}</p>
                  <p>End Time: {calculateEndTime(record.startTime, record.level!)}</p>
                  <p>Level: {record.level} ({getEatingWindow(record.level!)})</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}