import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Lock, MessageSquare, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [mode, setMode] = useState('otp'); // 'otp' | 'password'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone.trim()) { setError('Phone number is required'); return; }
    setLoading(true); setError('');
    try {
      await authApi.sendOtp(phone.trim());
      setOtpSent(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send OTP. Check the phone number.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let payload;
      if (mode === 'otp') {
        if (!phone || !otp) { setError('Phone and OTP are required'); setLoading(false); return; }
        payload = { phone: phone.trim(), otp };
      } else {
        if (!email || !password) { setError('Email and password are required'); setLoading(false); return; }
        payload = { email: email.trim(), password };
      }
      const data = await authApi.login(payload);
      dispatch(setAuth({ token: data.token, role: data.role, userId: data.userId, storeId: data.storeId }));

      switch (data.role) {
        case 'CUSTOMER': navigate('/'); break;
        case 'STORE_ADMIN': navigate('/shopkeeper/dashboard'); break;
        case 'DELIVERY_PARTNER': navigate('/delivery/dashboard'); break;
        case 'SYSTEM_ADMIN': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{t('auth.loginTitle')}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Fresh groceries at your doorstep.</p>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 gap-1">
        <button
          onClick={() => { setMode('otp'); setError(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'otp' ? 'bg-white dark:bg-gray-700 text-teal shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <span className="flex items-center justify-center gap-1.5"><MessageSquare size={14} /> OTP Login</span>
        </button>
        <button
          onClick={() => { setMode('password'); setError(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'password' ? 'bg-white dark:bg-gray-700 text-teal shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <span className="flex items-center justify-center gap-1.5"><Lock size={14} /> Password</span>
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {mode === 'otp' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.phone')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210" id="login-phone"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all"
                />
              </div>
            </div>

            {!otpSent ? (
              <button type="button" onClick={handleSendOtp} disabled={loading}
                className="w-full py-3 rounded-xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-all duration-200 shadow-md shadow-teal/20 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {t('auth.sendOtp')}
              </button>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.otp')}</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP" maxLength={6} id="login-otp"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all" />
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" id="login-email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" id="login-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>}

        {(otpSent || mode === 'password') && (
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-all duration-200 shadow-lg shadow-teal/25 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t('auth.login')}
          </button>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        {t('auth.dontHaveAccount')}{' '}
        <Link to="/register" className="text-teal dark:text-teal-light font-bold hover:underline">Register</Link>
      </p>
    </div>
  );
};

export default Login;
