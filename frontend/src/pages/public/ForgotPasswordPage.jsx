import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import AppLayout from '../../components/common/AppLayout';
import { KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenHint, setTokenHint] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword(email.trim());
      setSubmitted(true);
      if (response.reset_token) {
        setTokenHint(response.reset_token);
      }
      success('Password reset instructions generated.', 'Request Processed');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to request reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900">
              Reset Your Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered email address to receive password reset authorization.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Generating Token...' : 'Send Reset Instructions'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
                <p className="font-bold mb-1">Reset Request Received</p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  If the account exists, a secure token has been dispatched.
                </p>
              </div>

              {tokenHint && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                  <span className="font-semibold block text-slate-800 mb-1">
                    Environment Reset Token:
                  </span>
                  <p className="font-mono text-[10px] bg-white p-2 rounded border break-all text-slate-700 select-all">
                    {tokenHint}
                  </p>
                </div>
              )}

              <Link
                to={`/reset-password${tokenHint ? `?token=${tokenHint}` : ''}`}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Continue to Set New Password
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ForgotPasswordPage;
