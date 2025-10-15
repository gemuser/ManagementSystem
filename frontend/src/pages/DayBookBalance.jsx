import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import DHISidebar from '../components/DHISidebar';
import { dataRefreshEmitter } from '../hooks/useDataRefresh';

const DayBookBalance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState({ opening: 0, closing: 0, totalDebit: 0, totalCredit: 0 });
  const [error, setError] = useState(null);
  const [entriesOnDate, setEntriesOnDate] = useState([]);

  const fetchBalances = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/ledger');
      const entries = res.data.data || [];

      const target = new Date(date);
      const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

      // last balance before target date
      const entriesBefore = entries.filter(e => new Date(e.entry_date) < targetStart);
      let opening = 0;
      if (entriesBefore.length > 0) {
        const lastBefore = entriesBefore[entriesBefore.length - 1];
        opening = parseFloat(lastBefore.balance) || 0;
      }

      // entries on date
      const entriesOnDate = entries.filter(e => {
        const d = new Date(e.entry_date);
        return (
          d.getFullYear() === target.getFullYear() &&
          d.getMonth() === target.getMonth() &&
          d.getDate() === target.getDate()
        );
      });

      const totalDr = entriesOnDate.reduce((s, e) => s + (parseFloat(e.dr_amount) || 0), 0);
      const totalCr = entriesOnDate.reduce((s, e) => s + (parseFloat(e.cr_amount) || 0), 0);
  const totalDebit = entriesOnDate.reduce((s, e) => s + (parseFloat(e.dr_amount) || 0), 0);
  const totalCredit = entriesOnDate.reduce((s, e) => s + (parseFloat(e.cr_amount) || 0), 0);
  // Business rule: closing = opening + credit - debit
  const closing = opening + totalCredit - totalDebit;

      setBalanceInfo({ opening, closing, totalDr, totalCr });
      setEntriesOnDate(entriesOnDate);
    } catch (err) {
      console.error('Failed to fetch ledger for balances', err);
      setError('Failed to fetch balances');
      setBalanceInfo({ opening: 0, closing: 0, totalDr: 0, totalCr: 0 });
      setEntriesOnDate([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances(selectedDate);
  }, [selectedDate, fetchBalances]);

  // subscribe to cross-component data refreshes (e.g., after creating ledger entries)
  useEffect(() => {
    const unsub = dataRefreshEmitter.subscribe(() => {
      fetchBalances(selectedDate);
    });
    return unsub;
  }, [selectedDate, fetchBalances]);

  const formatCurrency = (amount) => `Rs. ${parseFloat(amount || 0).toFixed(2)}`;

  return (
    <div className="flex">
      <DHISidebar />
      <main className="flex-1 ml-72 p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DayBook Balances</h1>
              <p className="text-gray-600">Opening and Closing balances for selected date</p>
            </div>
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Opening Balance</h2>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(balanceInfo.opening)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Closing Balance</h2>
            <p className={`text-3xl font-bold ${balanceInfo.closing >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balanceInfo.closing)}</p>
            <p className="text-sm text-gray-500 mt-2">Debit: {formatCurrency(balanceInfo.totalDebit)} • Credit: {formatCurrency(balanceInfo.totalCredit)}</p>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Entries on {new Date(selectedDate).toLocaleDateString()}</h3>
          <div className="bg-white rounded shadow p-4">
            {loading ? (
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-2">Date</th>
                    <th className="py-2">Particulars</th>
                    <th className="py-2">Debit</th>
                    <th className="py-2">Credit</th>
                    <th className="py-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {entriesOnDate.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">No entries for this date</td>
                    </tr>
                  ) : (
                    entriesOnDate.map((e) => (
                      <tr key={e.id} className="text-sm text-gray-700">
                        <td className="py-2">{new Date(e.entry_date).toLocaleDateString()}</td>
                        <td className="py-2">{e.particulars}</td>
                        <td className="py-2">{e.dr_amount ? `Rs. ${parseFloat(e.dr_amount).toFixed(2)}` : '-'}</td>
                        <td className="py-2">{e.cr_amount ? `Rs. ${parseFloat(e.cr_amount).toFixed(2)}` : '-'}</td>
                        <td className="py-2">{e.balance ? `Rs. ${parseFloat(e.balance).toFixed(2)}` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DayBookBalance;
