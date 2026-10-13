import React, { useState } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Shield,
  Smartphone,
  Building,
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error: toastError } = useToast();

  if (!isOpen || !booking) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Create payment initiation on backend
      const createRes = await paymentApi.createPayment({
        booking_id: booking.booking_id,
        amount: Number(booking.total_amount),
        payment_method: paymentMethod,
      });

      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.message || 'Payment initiation failed.');
      }

      const paymentRecord = createRes.data;

      // 2. Complete MVP simulated confirmation on backend
      const confirmRes = await paymentApi.confirmPayment(paymentRecord.payment_id);

      if (confirmRes.success) {
        success(
          `Payment of $${Number(booking.total_amount).toFixed(2)} confirmed! Booking is secured.`,
          'Payment Successful'
        );
        if (onSuccess) {
          onSuccess(confirmRes.data);
        }
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment processing failed.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const methods = [
    { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI / Instant Payment', icon: Smartphone },
    { id: 'NET_BANKING', label: 'Net Banking / Wire', icon: Building },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Secure Checkout
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                Complete Booking Payment
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Booking #{booking.booking_id}</span>
              <span className="font-bold text-sm text-slate-800">{booking.resource_name || 'Equipment'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Due</span>
              <span className="text-xl font-extrabold text-amber-600 font-heading">
                ${Number(booking.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 text-slate-950 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span>{m.label}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </p>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Integrated MVP payment simulation. Instant gateway confirmation.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? 'Confirming Payment...' : `Pay $${Number(booking.total_amount).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
