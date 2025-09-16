import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import Swal from 'sweetalert2';
import { 
  BookOpen,
  Plus,
  ArrowLeft,
  Save,
  X,
  RotateCcw,
  Trash2,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';

const LedgerPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // State management
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'bydate'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({
    totalDr: 0,
    totalCr: 0,
    currentBalance: 0,
    totalEntries: 0
  });
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    particulars: '',
    amount: '',
    type: 'debit'
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      await Promise.all([fetchLedgerData(), fetchSummary()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchLedgerData = async () => {
    try {
      const response = await axios.get('/ledger');
      if (response.data.success) {
        setEntries(response.data.data);
        // The useEffect will handle applying the filter automatically
      } else {
        console.error('❌ Failed to fetch data:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/ledger/summary');
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Filter entries based on selected filter type and date
  const applyFilter = (entriesData, filterType, selectedDate) => {
    if (entriesData.length === 0) {
      setFilteredEntries([]);
      return;
    }
    
    let filtered = [...entriesData];
    
    if (filterType === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = entriesData.filter(entry => {
        // Try multiple date formatting approaches to handle timezone issues
        let entryDate;
        if (entry.entry_date instanceof Date) {
          entryDate = entry.entry_date.toISOString().split('T')[0];
        } else {
          entryDate = new Date(entry.entry_date).toISOString().split('T')[0];
        }
        
        // Also try local date comparison
        const entryLocalDate = new Date(entry.entry_date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
        const todayLocal = new Date().toLocaleDateString('en-CA');
        
        const matches = entryDate === today || entryLocalDate === todayLocal;
        return matches;
      });
    } else if (filterType === 'bydate') {
      filtered = entriesData.filter(entry => {
        // Try multiple date formatting approaches to handle timezone issues
        let entryDate;
        if (entry.entry_date instanceof Date) {
          entryDate = entry.entry_date.toISOString().split('T')[0];
        } else {
          entryDate = new Date(entry.entry_date).toISOString().split('T')[0];
        }
        
        // Also try local date comparison
        const entryLocalDate = new Date(entry.entry_date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
        
        const matches = entryDate === selectedDate || entryLocalDate === selectedDate;
        return matches;
      });
    }
    
    setFilteredEntries(filtered);
  };

  // Handle filter change
  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    // Apply filter immediately with the new filter type
    applyFilter(entries, newFilterType, selectedDate);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // Apply filter immediately with the new date
    applyFilter(entries, filterType, newDate);
  };

  // Use effect to apply filter when entries change or filter parameters change
  useEffect(() => {
    if (entries.length > 0) {
      applyFilter(entries, filterType, selectedDate);
    } else {
      setFilteredEntries([]);
    }
  }, [entries, filterType, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showAddEntryForm = async () => {
    const { value: formValues } = await Swal.fire({
      title: '💰 Add New Ledger Entry',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Date</label>
            <input id="entry_date" type="date" value="${new Date().toISOString().split('T')[0]}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Particulars</label>
            <input id="particulars" type="text" placeholder="Enter transaction details" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Type</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input type="radio" name="type" value="debit" checked class="text-green-600 focus:ring-green-500 mr-2">
                <span class="text-sm font-medium text-green-700">💰 Debit (Dr)</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="type" value="credit" class="text-red-600 focus:ring-red-500 mr-2">
                <span class="text-sm font-medium text-red-700">💸 Credit (Cr)</span>
              </label>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Amount (Rs.)</label>
            <input id="amount" type="number" step="0.01" min="0" placeholder="Enter amount" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Add Entry',
      cancelButtonText: '❌ Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const entry_date = document.getElementById('entry_date').value;
        const particulars = document.getElementById('particulars').value;
        const amount = document.getElementById('amount').value;
        const type = document.querySelector('input[name="type"]:checked').value;
        
        if (!entry_date || !particulars || !amount) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        
        return { entry_date, particulars, amount, type };
      }
    });

    if (formValues) {
      await handleFormSubmit(formValues);
    }
  };

  const handleFormSubmit = async (formValues) => {
    try {
      const submitData = {
        entry_date: formValues.entry_date,
        particulars: formValues.particulars.trim(),
        dr_amount: formValues.type === 'debit' ? parseFloat(formValues.amount) : 0,
        cr_amount: formValues.type === 'credit' ? parseFloat(formValues.amount) : 0
      };

      const response = await axios.post('/ledger', submitData);
      
      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: '✅ Success!',
          text: 'Entry added successfully!',
          confirmButtonColor: '#10b981'
        });
        fetchData();
      } else {
        Swal.fire({
          icon: 'error',
          title: '❌ Failed',
          text: response.data.message || 'Failed to add entry',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      Swal.fire({
        icon: 'error',
        title: '🚫 Error',
        text: error.response?.data?.message || 'Failed to connect to server',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '🗑️ Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🗑️ Yes, delete it!',
      cancelButtonText: '❌ Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      const response = await axios.delete(`/ledger/${id}`);
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: '✅ Deleted!',
          text: 'Entry deleted successfully!',
          confirmButtonColor: '#10b981'
        });
        fetchData();
      } else {
        Swal.fire({
          icon: 'error',
          title: '❌ Failed',
          text: 'Failed to delete entry',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      Swal.fire({
        icon: 'error',
        title: '🚫 Error',
        text: 'Failed to delete entry',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Loading screen
  if (authLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RotateCcw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
                  <p className="text-gray-600">Record all accounting transactions</p>
                </div>
              </div>
            </div>
            <button
              onClick={showAddEntryForm}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Debits</h3>
            <p className="text-2xl font-bold text-green-600">Rs. {summary.totalDr.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Credits</h3>
            <p className="text-2xl font-bold text-red-600">Rs. {summary.totalCr.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Balance</h3>
            <p className={`text-2xl font-bold ${summary.currentBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Rs. {Math.abs(summary.currentBalance).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Entries</h3>
            <p className="text-2xl font-bold text-purple-600">{summary.totalEntries}</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Entries</h3>
            </div>
            <span className="text-sm text-gray-500">
              Showing {filteredEntries.length} of {entries.length} entries
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Filter Type Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleFilterChange('all')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 All Entries
              </button>
              
              <button
                onClick={() => handleFilterChange('today')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'today'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Today
              </button>
              
              <button
                onClick={() => handleFilterChange('bydate')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'bydate'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                By Date
              </button>
            </div>

            {/* Date Picker - Only show when 'bydate' filter is selected */}
            {filterType === 'bydate' && (
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Select Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <button
                  onClick={() => applyFilter(entries, filterType, selectedDate)}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Ledger Entries</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filterType === 'all' && `${filteredEntries.length} total entries`}
              {filterType === 'today' && `${filteredEntries.length} entries for today`}
              {filterType === 'bydate' && `${filteredEntries.length} entries for ${new Date(selectedDate).toLocaleDateString()}`}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (Dr)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (Cr)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        {entry.particulars}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 border-r border-gray-200">
                        {entry.dr_amount > 0 ? `Rs. ${entry.dr_amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 border-r border-gray-200">
                        {entry.cr_amount > 0 ? `Rs. ${entry.cr_amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600 border-r border-gray-200">
                        Rs. {Math.abs(entry.balance).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium">No entries found</p>
                        <p className="text-sm">
                          {filterType === 'today' && 'No transactions recorded for today'}
                          {filterType === 'bydate' && `No transactions found for ${new Date(selectedDate).toLocaleDateString()}`}
                          {filterType === 'all' && 'No ledger entries available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
