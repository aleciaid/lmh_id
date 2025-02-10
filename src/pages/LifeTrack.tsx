import React, { useEffect, useState } from 'react';
import { Moon, Sun, Search, Trash2, Calendar, SmilePlus, Frown, Bed, Sunrise } from 'lucide-react';
import type { SleepRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function LifeTrack() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [lastStatus, setLastStatus] = useState<'bangun' | 'sleep' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sleepStats, setSleepStats] = useState({
    totalHours: 0,
    isHealthy: true,
    daysUntilMonthEnd: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const { storage, user } = useAuth();

  useEffect(() => {
    loadRecords();
  }, [storage]);

  useEffect(() => {
    if (records.length > 0) {
      calculateSleepStats();
    }
  }, [records]);

  function getCurrentHour() {
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return jakartaTime.getHours();
  }

  function getSleepStatusInfo() {
    const hour = getCurrentHour();
    const isMorning = hour >= 5 && hour < 12;

    return {
      icon: isMorning ? Sunrise : Bed,
      message: isMorning 
        ? 'Hay pejuang ayo bangun dan ayo kita gerak'
        : 'Hay pejuang, Jaga kualitas tidurmu ya.',
      iconColor: isMorning ? 'text-yellow-500' : 'text-blue-600',
      bgColor: isMorning ? 'bg-yellow-50' : 'bg-blue-50'
    };
  }

  async function loadRecords() {
    try {
      setLoading(true);
      const allRecords = await storage.getAllSleepRecords();
      setRecords(allRecords.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      
      if (allRecords.length > 0) {
        setLastStatus(allRecords[0].status);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }

  function calculateSleepStats() {
    setStatsLoading(true);
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysUntilMonthEnd = lastDayOfMonth.getDate() - now.getDate();
    
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let totalSleepMinutes = 0;
    let lastSleepTime: Date | null = null;
    
    records.forEach(record => {
      const recordTime = new Date(record.timestamp);
      if (recordTime >= firstDayOfMonth) {
        if (record.status === 'sleep') {
          lastSleepTime = recordTime;
        } else if (record.status === 'bangun' && lastSleepTime) {
          const sleepDuration = recordTime.getTime() - lastSleepTime.getTime();
          totalSleepMinutes += sleepDuration / (1000 * 60);
          lastSleepTime = null;
        }
      }
    });

    const totalHours = Math.round(totalSleepMinutes / 60);
    setSleepStats({
      totalHours,
      isHealthy: totalHours >= 160,
      daysUntilMonthEnd
    });
    setStatsLoading(false);
  }

  async function handleTrack(status: 'bangun' | 'sleep') {
    if (!user) {
      toast.error('Please login to track your sleep');
      return;
    }

    const record: SleepRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status,
    };

    try {
      await storage.addSleepRecord(record);
      await loadRecords();
    } catch (error) {
      console.error('Error tracking sleep:', error);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await storage.deleteSleepRecord(id);
        await loadRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  }

  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
    const matchesSearch = record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(record.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || recordDate === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const sleepStatusInfo = getSleepStatusInfo();
  const showWarning = sleepStats.daysUntilMonthEnd <= 5 && !sleepStats.isHealthy;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Life Track</h1>
      
      <div className="space-y-4 mb-8">
        {/* Sleep Status Widget */}
        {statsLoading ? (
          <LoadingSkeleton type="stats" />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className={`flex items-center p-4 rounded-lg ${sleepStatusInfo.bgColor}`}>
              <div className="mr-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white">
                  <sleepStatusInfo.icon className={sleepStatusInfo.iconColor} size={24} />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium">{sleepStatusInfo.message}</p>
                <p className="text-gray-600">
                  Total tidur bulan ini: {sleepStats.totalHours} jam
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning Widget */}
        {!statsLoading && showWarning && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center p-4 rounded-lg bg-red-50">
              <div className="mr-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                  <Frown className="text-red-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Hai pejuang, tolong jaga kualitas tidurmu ya :(
                </h3>
                <p className="text-red-600">
                  Target minimal: 160 jam
                </p>
                <p className="text-gray-600 mt-1">
                  {sleepStats.daysUntilMonthEnd} hari lagi menuju akhir bulan
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => handleTrack('bangun')}
          disabled={lastStatus === 'bangun' || !user}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
            lastStatus === 'bangun' || !user
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          <Sun size={20} />
          <span>Bangun</span>
        </button>

        <button
          onClick={() => handleTrack('sleep')}
          disabled={lastStatus === 'sleep' || !user}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
            lastStatus === 'sleep' || !user
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Moon size={20} />
          <span>Sleep</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="flex-1 relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {record.status === 'bangun' ? (
                  <Sun className="text-yellow-500" />
                ) : (
                  <Moon className="text-blue-600" />
                )}
                <div>
                  <span className="font-medium capitalize">{record.status}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(record.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}