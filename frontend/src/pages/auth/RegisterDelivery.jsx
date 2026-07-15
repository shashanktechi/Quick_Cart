import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/authSlice';
import { authApi } from '../../api/authApi';
import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, Loader2, User, Eye, EyeOff } from 'lucide-react';

const RegisterDelivery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=done
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!phone || !otp) {
        setError(t('auth.phoneOtpRequired'));
        setLoading(false);
        return;
      }
      // Verify OTP first, then proceed to registration details
      const verifyPayload = {
        phone: phone.trim(),
        otp
      };
      // For now, we'll simulate verification by moving to next step
      // In a real app, you'd have a verify OTP endpoint
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.message || t('auth.otpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!form.name || !form.email || !form.password) {
        setError(t('auth.allFieldsRequired'));
        setLoading(false);
        return;
      }
      const payload = {
        phone: phone.trim(),
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        role: 'DELIVERY_PARTNER',
        otp: otp // Include OTP for verification
      };
      const data = await authApi.register(payload);
      dispatch(setAuth({
        token: data.token,
        role: data.role,
        userId: data.userId,
        storeId: data.storeId
      }));

      // Delivery partner registration requires admin approval
      setStep(3); // Go to pending approval screen
    } catch (e) {
      setError(e.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.deliveryRegisterSubtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={step === 2 ? handleVerifyOtp : (step === 3 ? null : handleRegister)}>
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="register-delivery-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
                    autoComplete="tel"
                    placeholder="+919876543210"
                    className="block w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.phoneWillBeUsed')}
                </p>
              </div>

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
                  t('auth.sendOtp'))
                }
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.otp')}
                </label>
                <div className="relative">
                  <MessageSquare size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="register-delivery-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="block w-full pl-10 pr-4 py-3 text-sm font-mono text-center text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.otpWillExpire')}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500"
                >
                  {t('auth.back')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <>
                      <span className="mr-2"><Loader2 size={20} className="animate-spin" /></span>
                      {t('auth.verifyOtp')}
                    </>
                  ) : (
                    t('auth.verifyOtp'))
                  }
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    id="register-delivery-name"
                    className="block w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    id="register-delivery-email"
                    type="email"
                    className="block w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password"
                    id="register-delivery-password"
                    type={showPw ? 'text' : 'password'}
                    className="block w-full pl-10 pr-10 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  >
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500"
                >
                  {t('auth.back')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <>
                      <span className="mr-2"><Loader2 size={20} className="animate-spin" /></span>
                      {t('auth.submitting')}
                    </>
                  ) : (
                    t('auth.register'))
                  }
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-600 text-white mx-auto mb-4">
                <Truck size={18} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('auth.registrationPendingApproval')}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('auth.approvalNeeded')}
              </p>
              <Link
                to="/login/delivery"
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2"
              >
                {t('auth.goToLogin')}
              </Link>
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('auth.alreadyHaveAccount')} {' '}
          <Link to="/login/delivery" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {t('auth.signIn')}
          </Link>
        </p>

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-md">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterDelivery;