import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Zap, Gauge, Plus, ChevronLeft, ChevronRight, X, Calendar, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface Changelog {
  id: string;
  type: 'bug' | 'feature' | 'performance';
  version: string;
  description: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

export function Changelog() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingLog, setEditingLog] = useState<Changelog | null>(null);
  const { userRole } = useAuth();

  const [formData, setFormData] = useState({
    type: 'feature' as 'bug' | 'feature' | 'performance',
    description: '',
  });

  useEffect(() => {
    loadChangelogs();
  }, [currentPage]);

  useEffect(() => {
    if (editingLog) {
      setFormData({
        type: editingLog.type,
        description: editingLog.description,
      });
      setShowForm(true);
    }
  }, [editingLog]);

  async function loadChangelogs() {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('changelogs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setChangelogs(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error loading changelogs:', error);
      toast.error('Failed to load changelogs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingLog) {
        const { error } = await supabase
          .from('changelogs')
          .update({
            type: formData.type,
            description: formData.description,
          })
          .eq('id', editingLog.id);

        if (error) throw error;
        toast.success('Changelog updated successfully');
      } else {
        // Get the latest version
        const { data: latestVersion } = await supabase
          .from('changelogs')
          .select('version')
          .order('created_at', { ascending: false })
          .limit(1);

        // Parse and increment version
        const currentVersion = latestVersion?.[0]?.version || 'v1.0.7';
        const [major, minor, patch] = currentVersion.substring(1).split('.').map(Number);
        const newVersion = `v${major}.${minor}.${patch + 1}`;

        const { error } = await supabase
          .from('changelogs')
          .insert([
            {
              type: formData.type,
              version: newVersion,
              description: formData.description,
            },
          ]);

        if (error) throw error;
        toast.success('Changelog added successfully');
      }

      setShowForm(false);
      setEditingLog(null);
      setFormData({ type: 'feature', description: '' });
      loadChangelogs();
    } catch (error) {
      console.error('Error saving changelog:', error);
      toast.error('Failed to save changelog');
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this changelog entry?')) {
      try {
        const { error } = await supabase
          .from('changelogs')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Changelog deleted successfully');
        loadChangelogs();
      } catch (error) {
        console.error('Error deleting changelog:', error);
        toast.error('Failed to delete changelog');
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <Bug className="text-red-500" />;
      case 'feature':
        return <Zap className="text-yellow-500" />;
      case 'performance':
        return <Gauge className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Changelog</h1>
        {userRole === 'admin' && (
          <button
            onClick={() => {
              setEditingLog(null);
              setFormData({ type: 'feature', description: '' });
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {/* Add/Edit Changelog Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingLog ? 'Edit Changelog Entry' : 'Add Changelog Entry'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingLog(null);
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug Fix</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description (Markdown supported)
                </label>
                <div className="border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="flex items-center space-x-2 p-2 border-b">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, description: formData.description + '# ' })}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, description: formData.description + '## ' })}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, description: formData.description + '- ' })}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      •
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, description: formData.description + '1. ' })}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      1.
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, description: formData.description + '**Bold**' })}
                      className="p-1 hover:bg-gray-100 rounded font-bold"
                    >
                      B
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={10}
                    className="w-full px-3 py-2 focus:outline-none"
                    placeholder="Write your changelog entry here..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLog(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingLog ? 'Update Entry' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Changelog Timeline */}
      <div className="space-y-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          changelogs.map((log, index) => (
            <div
              key={log.id}
              className="bg-white p-6 rounded-lg shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
            >
              {/* Version Badge and Date Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getTypeIcon(log.type)}
                  </div>
                  <span className="text-sm text-gray-500">
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    {log.version}
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingLog(log)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description with Markdown */}
              <div className="prose max-w-none">
                <ReactMarkdown>{log.description}</ReactMarkdown>
              </div>

              {/* Connection Line */}
              {index < changelogs.length - 1 && (
                <div className="absolute left-8 bottom-0 w-0.5 h-8 bg-gray-200"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}