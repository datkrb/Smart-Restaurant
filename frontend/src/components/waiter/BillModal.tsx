import React, { useRef, useState } from 'react';
import { X, Printer, Download, Percent, DollarSign, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    menuItem: { name: string };
    modifiers: { modifierOption: { name: string; priceDelta?: number } }[];
    status: string;
}

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    tableSession: {
        table: { name: string };
    };
    items: OrderItem[];
}

interface BillModalProps {
    order: Order;
    onClose: () => void;
    onConfirmPayment?: (orderId: string, paymentData: PaymentData) => void;
}

type PaymentMethodType = 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';

interface PaymentData {
    paymentMethod: PaymentMethodType;
    discountAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED' | null;
    finalAmount: number;
}

const TAX_RATE = 0.1; // 10% VAT

const BillModal: React.FC<BillModalProps> = ({ order, onClose, onConfirmPayment }) => {
    const billRef = useRef<HTMLDivElement>(null);

    // States
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');

    // Calculate subtotal (only non-cancelled items)
    const activeItems = order.items.filter(item => item.status !== 'CANCELLED');
    const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const subtotalWithTax = subtotal + tax;

    // Calculate discount
    const discountAmount = discountType === 'PERCENTAGE'
        ? (subtotalWithTax * discountValue / 100)
        : discountValue;

    const total = Math.max(0, subtotalWithTax - discountAmount);

    const formatCurrency = (amount: number, isPdf = false) => {
        const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return isPdf ? `${formatted} VND` : `${formatted}đ`;
    };

    const handlePrintBill = () => {
        const printContent = billRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${order.tableSession.table.name}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { margin: 5px 0; font-size: 12px; }
            .items { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; font-size: 12px; }
            .item-name { flex: 1; }
            .item-qty { width: 30px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .modifiers { font-size: 10px; color: #666; padding-left: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .totals { font-size: 12px; }
            .totals .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .totals .total { font-size: 16px; font-weight: bold; }
            .discount { color: #dc2626; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${billRef.current?.innerHTML}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 220] // Receipt size
        });

        const marginLeft = 5;
        let yPos = 10;

        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SMART RESTAURANT', 40, yPos, { align: 'center' });
        yPos += 6;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('123 Food Street, City', 40, yPos, { align: 'center' });
        yPos += 4;
        doc.text('Tel: 0123-456-789', 40, yPos, { align: 'center' });
        yPos += 6;

        // Table & Date
        doc.setFontSize(10);
        doc.text(`Table: ${order.tableSession.table.name}`, marginLeft, yPos);
        yPos += 4;
        doc.setFontSize(8);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, marginLeft, yPos);
        yPos += 4;
        doc.text(`Bill #: ${order.id.slice(-8).toUpperCase()}`, marginLeft, yPos);
        yPos += 6;

        // Divider
        doc.setDrawColor(0);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(marginLeft, yPos, 75, yPos);
        yPos += 4;

        // Items Header
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Item', marginLeft, yPos);
        doc.text('Qty', 50, yPos);
        doc.text('Price', 75, yPos, { align: 'right' });
        yPos += 4;

        // Items
        doc.setFont('helvetica', 'normal');
        activeItems.forEach(item => {
            doc.text(item.menuItem.name.substring(0, 25), marginLeft, yPos);
            doc.text(item.quantity.toString(), 52, yPos);
            doc.text(formatCurrency(item.price * item.quantity, true), 75, yPos, { align: 'right' });
            yPos += 4;

            if (item.modifiers.length > 0) {
                doc.setFontSize(7);
                const modText = '  + ' + item.modifiers.map(m => m.modifierOption.name).join(', ');
                doc.text(modText.substring(0, 35), marginLeft, yPos);
                yPos += 3;
                doc.setFontSize(8);
            }
        });

        yPos += 2;
        doc.line(marginLeft, yPos, 75, yPos);
        yPos += 4;

        // Totals
        doc.text('Subtotal:', marginLeft, yPos);
        doc.text(formatCurrency(subtotal, true), 75, yPos, { align: 'right' });
        yPos += 4;

        doc.text(`VAT (${TAX_RATE * 100}%):`, marginLeft, yPos);
        doc.text(formatCurrency(tax, true), 75, yPos, { align: 'right' });
        yPos += 4;

        if (discountAmount > 0) {
            doc.setTextColor(220, 38, 38); // Red
            const discountLabel = discountType === 'PERCENTAGE' ? `Discount (${discountValue}%):` : 'Discount:';
            doc.text(discountLabel, marginLeft, yPos);
            doc.text(`-${formatCurrency(discountAmount, true)}`, 75, yPos, { align: 'right' });
            yPos += 4;
            doc.setTextColor(0, 0, 0);
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('TOTAL:', marginLeft, yPos);
        doc.text(formatCurrency(total, true), 75, yPos, { align: 'right' });
        yPos += 4;

        // Payment Method
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Payment: ${paymentMethod}`, marginLeft, yPos);
        yPos += 8;

        // Footer
        doc.text('Thank you for dining with us!', 40, yPos, { align: 'center' });
        yPos += 4;
        doc.text('Please come again', 40, yPos, { align: 'center' });

        doc.save(`bill_${order.tableSession.table.name}_${order.id.slice(-6)}.pdf`);
    };

    const handleComplete = () => {
        if (onConfirmPayment) {
            onConfirmPayment(order.id, {
                paymentMethod: paymentMethod,
                discountAmount: discountAmount,
                discountType: discountAmount > 0 ? discountType : null,
                finalAmount: total
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Bill Preview & Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Bill Preview */}
                    <div ref={billRef} className="bg-gray-50 rounded-xl p-4 font-mono text-sm border border-gray-100 shadow-sm">
                        {/* Restaurant Info */}
                        <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                            <h1 className="text-lg font-bold">SMART RESTAURANT</h1>
                            <p className="text-xs text-gray-500">123 Food Street, City</p>
                        </div>

                        {/* Table & Order Info */}
                        <div className="mb-3 text-xs">
                            <p><strong>Table:</strong> {order.tableSession.table.name}</p>
                            <p><strong>Bill #:</strong> {order.id.slice(-8).toUpperCase()}</p>
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-3 mb-3"></div>

                        {/* Items */}
                        <div className="space-y-2 mb-3">
                            {activeItems.map(item => (
                                <div key={item.id} className="flex justify-between text-xs">
                                    <div className="flex-1">
                                        <span>{item.menuItem.name}</span>
                                        {item.modifiers.length > 0 && (
                                            <p className="text-[10px] text-gray-400 pl-2">
                                                + {item.modifiers.map(m => m.modifierOption.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <span className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>VAT ({TAX_RATE * 100}%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Discount {discountType === 'PERCENTAGE' ? `(${discountValue}%)` : ''}</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
                                <span>TOTAL</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-2 mt-2 border-t border-dashed border-gray-300">
                                <span>Method</span>
                                <span className='font-bold'>{paymentMethod}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-300 text-xs text-gray-500">
                            <p>Thank you for dining with us!</p>
                        </div>
                    </div>

                    {/* Controls Container */}
                    <div className="space-y-4 mt-6">

                        {/* Payment Method Selector */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {(['CASH', 'CARD', 'MOMO', 'ZALOPAY', 'VNPAY'] as PaymentMethodType[]).map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${paymentMethod === method
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Discount Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discount</h3>
                            <div className="flex gap-2 mb-2">
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setDiscountType('PERCENTAGE')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${discountType === 'PERCENTAGE' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                    >
                                        %
                                    </button>
                                    <button
                                        onClick={() => setDiscountType('FIXED')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${discountType === 'FIXED' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                    >
                                        $
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={discountValue || ''}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                    placeholder={discountType === 'PERCENTAGE' ? '%' : 'Amount'}
                                    className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(discountType === 'PERCENTAGE' ? [5, 10, 15, 20] : [10000, 20000, 50000]).map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setDiscountValue(val)}
                                        className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50"
                                    >
                                        {discountType === 'PERCENTAGE' ? `${val}%` : `${val / 1000}k`}
                                    </button>
                                ))}
                                <button onClick={() => setDiscountValue(0)} className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold border border-red-100">X</button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-gray-50 space-y-3">
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrintBill}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition shadow-sm"
                        >
                            <Printer size={18} />
                            <span className="text-sm">Print</span>
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition shadow-sm"
                        >
                            <Download size={18} />
                            <span className="text-sm">PDF</span>
                        </button>
                    </div>

                    <button
                        onClick={handleComplete}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <span>Complete Order</span>
                        <Check size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillModal;
