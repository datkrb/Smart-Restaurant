import axiosClient from './axiosClient';

/*
  Payment API for handling Payment Intents (Stripe) and other payment methods.
*/

export const paymentApi = {
  // Create Stripe Payment Intent
  createStripeIntent: (orderId: string) => {
    return axiosClient.post('/payment/create-payment-intent', { orderId });
  },

  // Confirm Cash/Other Payment (if needed for manual flow)
  confirmPayment: (data: {
    orderId: string;
    paymentMethod: 'CASH' | 'STRIPE' | 'MOMO' | 'VNPAY' | 'ZALOPAY';
    discountAmount?: number;
    discountType?: string;
    finalAmount?: number;
  }) => {
    return axiosClient.post('/payment/confirm', data);
  }
};
