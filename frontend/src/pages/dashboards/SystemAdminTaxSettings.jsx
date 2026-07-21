import React, { useState, useEffect } from 'react';
import { Percent, Save, RefreshCw, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export function SystemAdminTaxSettings() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const defaultCategories = [
    { categoryName: 'Vegetables', taxPercentage: 0.0 },
    { categoryName: 'Fruits', taxPercentage: 0.0 },
    { categoryName: 'Dairy', taxPercentage: 5.0 },
    { categoryName: 'Non-Veg', taxPercentage: 5.0 },
    { categoryName: 'Snacks', taxPercentage: 12.0 },
    { categoryName: 'Beverages', taxPercentage: 18.0 },
    { categoryName: 'Household', taxPercentage: 18.0 },
  ];

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/category-taxes');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTaxes(res.data);
      } else {
        setTaxes(defaultCategories);
      }
    } catch (err) {
      setTaxes(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleTaxChange = (categoryName, value) => {
    const numericVal = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setTaxes((prev) =>
      prev.map((item) =>
        item.categoryName.toLowerCase() === categoryName.toLowerCase()
          ? { ...item, taxPercentage: numericVal }
          : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/admin/category-taxes', taxes);
      setMessage({ type: 'success', text: 'Category taxes updated successfully!' });
    } catch (err) {
      console.error('Failed to save category taxes', err);
      setMessage({ type: 'error', text: 'Failed to update taxes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="font-bold text-2xl text-ink tracking-tight flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" /> Category Tax Control
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Configure dynamic tax percentages per category based on season and market availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchTaxes} disabled={loading || saving} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-white">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tax Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taxes.map((taxItem) => (
          <div key={taxItem.categoryName} className="bg-surface p-5 rounded-xl border border-border shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-base text-ink">{taxItem.categoryName}</span>
              <span className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                GST / Tax
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink-muted block font-bold">
                Tax Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={taxItem.taxPercentage}
                  onChange={(e) => handleTaxChange(taxItem.categoryName, e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-lg px-4 pr-10 font-mono font-bold text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-ink-muted">
                  %
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Fee Slab Reference Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-ink mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" /> Dynamic Delivery Fee Rules
        </h3>
        <p className="text-sm text-ink-muted mb-4">
          Delivery charges are automatically computed based on straight-line distance driven between store and customer location:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs font-bold text-ink">
          <div className="bg-surface p-3 rounded-lg border border-border">0 – 1 km: ₹10</div>
          <div className="bg-surface p-3 rounded-lg border border-border">1 – 2 km: ₹15</div>
          <div className="bg-surface p-3 rounded-lg border border-border">2 – 3 km: ₹20</div>
          <div className="bg-surface p-3 rounded-lg border border-border">3 – 5 km: ₹30</div>
        </div>
      </div>
    </div>
  );
}

export default SystemAdminTaxSettings;
