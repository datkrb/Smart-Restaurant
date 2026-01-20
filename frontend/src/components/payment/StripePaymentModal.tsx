import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentApi } from '../../api/paymentApi';
import { X, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Initialize Stripe outside of component to avoid recreating it on every render
// Replace with your actual Publishable Key from env or constant
const stripePromise = loadStripe('pk_test_51QyD0eP9X3rL8z9X1QyD0eP9X3rL8z9X1QyD0eP9X3rL8z9X1QyD0eP9X3rL8z9X'); 

interface StripePaymentModalProps {
  orderId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutForm = ({ onSuccess, amount }: { onSuccess: () => void, amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required but we handle it via redirect or same page.
        // For simple integration, we can just use the current page or a specific success page.
        // using window.location.origin + '/tracking' to return to tracking page
        return_url: window.location.origin + '/tracking',
      },
      redirect: 'if_required' 
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      // Payment successful
      toast.success('Payment successful!');
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-gray-500">Total to pay</span>
          <span className="text-2xl font-black text-gray-900">{amount.toLocaleString('vi-VN')}đ</span>
        </div>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pay Now
          </>
        )}
      </button>
    </form>
  );
};

export default function StripePaymentModal({ orderId, amount, onClose, onSuccess }: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initPayment = async () => {
      try {
        const res: any = await paymentApi.createStripeIntent(orderId);
        // Backend returns { clientSecret, paymentId }
        // Ensure we check where clientSecret is in the response (res.data or res)
        const secret = res.clientSecret || res.data?.clientSecret;
        
        if (secret) {
            setClientSecret(secret);
        } else {
            console.error("Invalid response from createStripeIntent", res);
            setError("Could not initialize payment secure channel.");
        }
      } catch (err: any) {
        console.error("Stripe Intent Error", err);
        setError(err.response?.data?.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [orderId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
               <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Card Payment</h2>
              <p className="text-indigo-200 text-xs">Secured by Stripe</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={48} className="text-indigo-600 animate-spin" />
              <p className="text-gray-500 font-medium">Initializing secure checkout...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-600" />
                </div>
              <p className="text-red-600 font-bold">{error}</p>
              <button onClick={onClose} className="px-6 py-2 bg-gray-100 font-bold text-gray-600 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm onSuccess={onSuccess} amount={amount} />
            </Elements>
          ) : null}
        </div>
        
        <div className="bg-gray-50 p-3 text-center text-[10px] text-gray-400 border-t border-gray-100 shrink-0">
            Powered by Stripe. Your payment info is encrypted and secure.
        </div>
      </div>
    </div>
  );
}
