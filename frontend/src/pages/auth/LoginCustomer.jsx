import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginCustomer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPw, setShowPw] = useState(false); // For password visibility toggle (not used in OTP mode but kept for consistency)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError(t('auth.phoneRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(phone.trim());
      setOtpSent(true);
    } catch (e) {
      setError(e.response?.data?.message || t('auth.otpSendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let payload;
      // Customer login is OTP-only
      if (!phone || !otp) {
        setError(t('auth.phoneOtpRequired'));
        setLoading(false);
        return;
      }
      payload = { phone: phone.trim(), otp };
      const data = await authApi.login(payload);
      dispatch(setAuth({
        token: data.token,
        role: data.role,
        userId: data.userId,
        storeId: data.storeId
      }));

      // Redirect based on role
      switch (data.role) {
        case 'CUSTOMER': navigate('/'); break;
        case 'STORE_ADMIN': navigate('/shopkeeper/dashboard'); break;
        case 'DELIVERY_PARTNER': navigate('/delivery/dashboard'); break;
        case 'SYSTEM_ADMIN': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (e) {
      setError(e.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.customerSubtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.phone')}
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                id="login-customer-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
                autoComplete="tel"
                placeholder="+919876543210"
                className="block w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {!otpSent ? (
            <>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <span className="mr-2"><Loader2 size={20} className="animate-spin" /></span>
                    {t('auth.sendingOtp')}
                  </>
                ) : (
                  t('auth.sendOtp')
                )}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.otp')}
                </label>
                <div className="relative">
                  <MessageSquare size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="login-customer-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="block w-full pl-10 pr-4 py-3 text-sm font-mono text-center text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <span className="mr-2"><Loader2 size={20} className="animate-spin" /></span>
                    {t('auth.loggingIn')}
                  </>
                ) : (
                  t('auth.login')
                )}
              </button>
            </>
          )}

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('auth.dontHaveAccount')}
            <Link to="/register/customer" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {t('auth.signUp')}
            </Link>
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-md">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginCustomer;