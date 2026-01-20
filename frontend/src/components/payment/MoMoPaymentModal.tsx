import React, { useState, useEffect } from 'react';
import { X, Smartphone, Check, Loader2, AlertCircle, QrCode } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

interface MoMoPaymentModalProps {
  orderId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentStatus = 'loading' | 'ready' | 'checking' | 'success' | 'error';

const MoMoPaymentModal: React.FC<MoMoPaymentModalProps> = ({
  orderId,
  amount,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [payUrl, setPayUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Create MoMo payment request
  useEffect(() => {
    const createPayment = async () => {
      try {
        const res: any = await axiosClient.post('/payment/momo/create', { orderId });
        
        // Handle both axios-wrapped and interceptor-unwrapped responses
        const data = res.data || res;

        console.log('DEBUG MOMO RESPONSE:', {
            isWrapped: !!res.data,
            hasPayUrl: !!data?.payUrl,
            keys: data ? Object.keys(data) : [],
            data
        });

        if (data && data.payUrl) {
          setPayUrl(data.payUrl);
          setQrCodeUrl(data.qrCodeUrl);
          setStatus('ready');
        } else {
            console.error('Invalid MoMo response structure:', data);
            setError('Phản hồi không hợp lệ từ hệ thống thanh toán');
            setStatus('error');
        }

      } catch (err: any) {
        console.error('MoMo Create Error:', err);
        setError(err.response?.data?.error || 'Không thể tạo thanh toán MoMo');
        setStatus('error');
      }
    };

    createPayment();
  }, [orderId]);

  // Poll for payment status
  useEffect(() => {
    if (status !== 'ready' && status !== 'checking') return;

    const interval = setInterval(async () => {
      try {
        const response = await axiosClient.get(`/payment/momo/status/${orderId}`);
        
        if (response.data.status === 'PAID' || response.data.orderStatus === 'COMPLETED') {
          setStatus('success');
          clearInterval(interval);
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [status, orderId, onSuccess]);

  const formatCurrency = (amount: number) => {
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  };

  const handleOpenMoMo = () => {
    setStatus('checking');
    window.open(payUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-pink-500 font-black text-lg">M</span>
            </div>
            <div>
              <h2 className="text-white font-bold">Thanh toán MoMo</h2>
              <p className="text-pink-100 text-xs">Quét mã hoặc mở ứng dụng</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 size={48} className="text-pink-500 animate-spin" />
              <p className="mt-4 text-gray-600">Đang tạo thanh toán...</p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="flex flex-col items-center py-8">
              <AlertCircle size={48} className="text-red-500" />
              <p className="mt-4 text-red-600 font-medium">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Ready State - Show QR and Pay Button */}
          {(status === 'ready' || status === 'checking') && (
            <div className="space-y-4">
              {/* Amount */}
              <div className="text-center">
                <p className="text-gray-500 text-sm">Số tiền thanh toán</p>
                <p className="text-3xl font-black text-gray-900">{formatCurrency(amount)}</p>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white border-2 border-pink-100 rounded-2xl">
                    <img
                      src={qrCodeUrl}
                      alt="MoMo QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="mt-2 text-gray-500 text-sm flex items-center gap-1">
                    <QrCode size={14} />
                    Quét bằng ứng dụng MoMo
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm">hoặc</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Open MoMo App Button */}
              <button
                onClick={handleOpenMoMo}
                disabled={status === 'checking'}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-70"
              >
                {status === 'checking' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang chờ thanh toán...
                  </>
                ) : (
                  <>
                    <Smartphone size={20} />
                    Mở ứng dụng MoMo
                  </>
                )}
              </button>

              {status === 'checking' && (
                <p className="text-center text-gray-500 text-sm">
                  Hoàn tất thanh toán trên ứng dụng MoMo
                </p>
              )}
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <p className="mt-4 text-xl font-bold text-green-600">Thanh toán thành công!</p>
              <p className="text-gray-500 text-sm mt-1">Cảm ơn bạn đã sử dụng dịch vụ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoMoPaymentModal;
