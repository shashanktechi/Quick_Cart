import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Lock, User, Store, Truck, Shield, ShoppingBag, Eye, EyeOff, Loader2, MapPin } from 'lucide-react';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'Browse & order groceries', icon: ShoppingBag, color: 'teal' },
  { value: 'STORE_ADMIN', label: 'Shopkeeper', desc: 'Manage your store', icon: Store, color: 'blue' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner', desc: 'Deliver orders & earn', icon: Truck, color: 'coral' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin', desc: 'Platform management', icon: Shield, color: 'gray' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1); // 1=role, 2=details
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    phone: '', email: '', password: '', name: '',
    storeName: '', storeAddress: '', storeLat: '', storeLng: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (r) => {
    setRole(r);
    setStep(2);
    setError('');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, storeLat: pos.coords.latitude.toString(), storeLng: pos.coords.longitude.toString() })),
      () => setError('Location access denied. Please enter coordinates manually.')
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.phone || !form.name) { setError('Name and phone are required.'); return; }
    setLoading(true);
    try {
      const payload = {
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password || undefined,
        name: form.name.trim(),
        role,
        storeName: role === 'STORE_ADMIN' ? form.storeName : undefined,
        storeAddress: role === 'STORE_ADMIN' ? form.storeAddress : undefined,
        storeLat: role === 'STORE_ADMIN' && form.storeLat ? parseFloat(form.storeLat) : undefined,
        storeLng: role === 'STORE_ADMIN' && form.storeLng ? parseFloat(form.storeLng) : undefined,
      };
      const data = await authApi.register(payload);
      dispatch(setAuth({ token: data.token, role: data.role, userId: data.userId, storeId: data.storeId }));
      switch (data.role) {
        case 'CUSTOMER': navigate('/'); break;
        case 'STORE_ADMIN': navigate('/shopkeeper/dashboard'); break;
        case 'DELIVERY_PARTNER': navigate('/delivery/dashboard'); break;
        case 'SYSTEM_ADMIN': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{t('auth.registerTitle')}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Join the QuickCart community.</p>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('auth.selectRole')}</p>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                id={`role-${r.value.toLowerCase()}`}
                onClick={() => handleRoleSelect(r.value)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal dark:hover:border-teal-light bg-white dark:bg-gray-800 hover:bg-teal/5 dark:hover:bg-teal-dark/10 text-left transition-all duration-200 group"
              >
                <div className="w-11 h-11 rounded-xl bg-teal/10 dark:bg-teal-light/10 text-teal dark:text-teal-light flex items-center justify-center group-hover:bg-teal group-hover:text-white transition-all duration-200">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{r.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <button type="button" onClick={() => setStep(1)} className="text-xs text-teal dark:text-teal-light font-semibold hover:underline mb-2">← Back to role selection</button>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.fullName')} *</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" id="reg-name"
                className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.phone')} *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" id="reg-phone"
                className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.email')} <span className="text-gray-400">(optional)</span></label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" id="reg-email"
                className={`${inputClass} pl-10`} type="email" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.password')} <span className="text-gray-400">(optional)</span></label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="password" value={form.password} onChange={handleChange} placeholder="Create a password" id="reg-password"
                type={showPw ? 'text' : 'password'} className={`${inputClass} pl-10 pr-10`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {role === 'STORE_ADMIN' && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Store Details</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.storeName')} *</label>
                <input name="storeName" value={form.storeName} onChange={handleChange} placeholder="e.g. Fresh Mart" id="reg-storeName" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.storeAddress')} *</label>
                <input name="storeAddress" value={form.storeAddress} onChange={handleChange} placeholder="Full store address" id="reg-storeAddress" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Latitude</label>
                  <input name="storeLat" value={form.storeLat} onChange={handleChange} placeholder="e.g. 12.9716" id="reg-storeLat" className={inputClass} type="number" step="any" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Longitude</label>
                  <input name="storeLng" value={form.storeLng} onChange={handleChange} placeholder="e.g. 77.5946" id="reg-storeLng" className={inputClass} type="number" step="any" />
                </div>
              </div>
              <button type="button" onClick={handleGetLocation}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-teal dark:text-teal-light border border-teal/30 dark:border-teal-light/30 rounded-xl hover:bg-teal/5 transition-all">
                <MapPin size={15} /> Use my current location
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-all duration-200 shadow-lg shadow-teal/25 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t('auth.register')}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-teal dark:text-teal-light font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default Register;
