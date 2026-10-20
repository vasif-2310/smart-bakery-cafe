import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
  X,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Clock,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC', badgeColor: '#004c8f' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC', badgeColor: '#b02a30' },
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN', badgeColor: '#280071' },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB', badgeColor: '#97144d' },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KKBK', badgeColor: '#e31837' },
  { id: 'PNB', name: 'Punjab National Bank', code: 'PUNB', badgeColor: '#9e1b32' },
];

const OTHER_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Federal Bank',
  'Yes Bank',
  'Standard Chartered',
  'Central Bank of India',
];

export const PaymentGatewayModal = ({
  isOpen,
  onClose,
  order,
  paymentGateway,
  user,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'razorpay'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // UPI State
  const [upiId, setUpiId] = useState('');
  const [upiCountdown, setUpiCountdown] = useState(null);
  const [modalQrUrl, setModalQrUrl] = useState('');

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Gourmet Guest');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('1234');

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  useEffect(() => {
    if (order) {
      const upiUri = `upi://pay?pa=smartbakery@upi&pn=Smart%20Bakery%20and%20Cafe&am=${(order.totalAmount || 0).toFixed(2)}&cu=INR&tn=Order%20${order.orderNumber || ''}`;
      QRCode.toDataURL(upiUri, {
        width: 260,
        margin: 1,
        color: { dark: '#2C1810', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      })
        .then(setModalQrUrl)
        .catch(console.error);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const totalAmount = order.totalAmount || 0;
  const orderNumber = order.orderNumber || 'SBK-ORD';

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Quick fill test card
  const fillTestCard = (type) => {
    if (type === 'visa') {
      setCardNumber('4000 0012 3456 7890');
      setCardHolder(user?.name || 'Artisan Baker');
      setCardExpiry('12/28');
      setCardCvv('789');
    } else if (type === 'mastercard') {
      setCardNumber('5123 4567 8901 2345');
      setCardHolder(user?.name || 'Coffee Connoisseur');
      setCardExpiry('10/29');
      setCardCvv('456');
    } else if (type === 'rupay') {
      setCardNumber('6071 2345 6789 0123');
      setCardHolder(user?.name || 'Pastry Lover');
      setCardExpiry('08/27');
      setCardCvv('321');
    }
  };

  // Detect card network
  const getCardNetwork = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', color: '#1A1F71' };
    if (clean.startsWith('5')) return { name: 'MASTERCARD', color: '#EB001B' };
    if (clean.startsWith('6')) return { name: 'RUPAY', color: '#097939' };
    return { name: 'CARD', color: '#64748B' };
  };

  // Finalize payment verification with backend
  const finalizePayment = async (methodDetails) => {
    setIsProcessing(true);
    setProcessingStage('Contacting bank payment gateway...');

    try {
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStage('Authenticating cryptographic payment token...');
      await new Promise((r) => setTimeout(r, 700));

      const verificationPayload = {
        orderId: order._id,
        razorpayOrderId: paymentGateway?.orderId || `order_sbk_${Date.now()}`,
        razorpayPaymentId: `pay_sbk_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        razorpaySignature: 'simulated_success',
        paymentMethodDetails: methodDetails,
      };

      const res = await api.post('/payments/verify', verificationPayload);

      setProcessingStage('Payment captured successfully!');
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#F59E0B', '#10B981', '#2C1810'],
        });
      } catch {
        // Fallback if canvas blocked
      }

      await new Promise((r) => setTimeout(r, 600));
      onPaymentSuccess(res.data);
    } catch (err) {
      console.error('Payment verification failure:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Payment processing failed.');
      setIsProcessing(false);
      setShowOtpModal(false);
    }
  };

  // 1. Process UPI Payment
  const handleUpiPay = async (appId = null) => {
    setErrorMessage('');
    const targetUpi = appId ? `${appId}.user@upi` : upiId.trim();

    if (!appId && (!targetUpi || !targetUpi.includes('@'))) {
      setErrorMessage('Please enter a valid UPI Virtual Payment Address (e.g. name@okhdfcbank)');
      return;
    }

    setIsProcessing(true);
    setProcessingStage(`Sending payment authorization request to ${targetUpi}...`);

    let secondsLeft = 3;
    setUpiCountdown(secondsLeft);

    const interval = setInterval(() => {
      secondsLeft -= 1;
      setUpiCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        setUpiCountdown(null);
        finalizePayment({
          type: 'UPI',
          upiId: targetUpi,
          app: appId || 'UPI App',
          timestamp: new Date().toISOString(),
        });
      }
    }, 1000);
  };

  // 2. Process Card Payment (Trigger OTP Modal)
  const handleCardPay = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 15) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setErrorMessage('Please enter card expiry in MM/YY format.');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setErrorMessage('Please enter a valid 3-digit CVV.');
      return;
    }

    setShowOtpModal(true);
  };

  // Submit Card OTP
  const handleVerifyOtp = () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setErrorMessage('Please enter the 4-digit bank verification OTP.');
      return;
    }
    setShowOtpModal(false);
    const network = getCardNetwork();
    finalizePayment({
      type: 'CARD',
      cardNetwork: network.name,
      cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
      cardHolder,
      timestamp: new Date().toISOString(),
    });
  };

  // 3. Process NetBanking Payment
  const handleNetBankingPay = () => {
    setErrorMessage('');
    if (!selectedBank) {
      setErrorMessage('Please select a bank to proceed.');
      return;
    }
    finalizePayment({
      type: 'NETBANKING',
      bank: selectedBank,
      timestamp: new Date().toISOString(),
    });
  };

  // 4. Launch Official Razorpay SDK Modal (if real keys provided)
  const handleLaunchOfficialRazorpay = () => {
    if (typeof window.Razorpay !== 'function') {
      setErrorMessage('Razorpay SDK is not loaded. Please use the interactive sandbox gateway.');
      return;
    }

    try {
      const options = {
        key: paymentGateway?.keyId || 'rzp_test_mock_bakery_key',
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'Smart Bakery & Café',
        description: `Order ${orderNumber} - Artisanal Bakery`,
        image: '/favicon.svg',
        order_id: paymentGateway?.mode === 'razorpay' ? paymentGateway.orderId : undefined,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#2C1810',
        },
        handler: async (response) => {
          setIsProcessing(true);
          setProcessingStage('Validating Razorpay cryptographic signature...');
          try {
            const res = await api.post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onPaymentSuccess(res.data);
          } catch (err) {
            setErrorMessage('Razorpay signature verification failed.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed Razorpay modal
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay popup error:', err);
      setErrorMessage('Could not open Razorpay window. Please use our instant payment tabs.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '780px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: 'var(--primary-espresso)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--accent-gold)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                border: '1px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              🥐
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, letterSpacing: '0.3px' }}>
                  Smart Bakery Secure Gateway
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(217, 119, 6, 0.3)',
                    color: '#FDE68A',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}
                >
                  256-BIT SSL
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#D6D3D1' }}>
                Order Ref: <strong style={{ color: '#FCD34D' }}>{orderNumber}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Amount to Pay
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1.1 }}>
                {formatCurrency(totalAmount)}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#E7E5E4',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing ? (
          <div
            style={{
              padding: '4rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: '360px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid #F3ECE2',
                borderTopColor: 'var(--accent-amber)',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '1.5rem',
              }}
            />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--primary-espresso)', marginBottom: '8px' }}>
              Processing Secure Payment
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '360px' }}>
              {processingStage || 'Please do not refresh or close this window...'}
            </p>
            {upiCountdown !== null && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '8px 16px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '20px',
                  color: '#92400E',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Auto-approving simulator in {upiCountdown}s...
              </div>
            )}
          </div>
        ) : (
          /* Main Gateway Workspace */
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, minHeight: '380px' }}>
            {/* Sidebar Tabs */}
            <div
              style={{
                backgroundColor: '#FAF7F2',
                borderRight: '1px solid var(--border-subtle)',
                padding: '1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'upi' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'upi' ? 'var(--primary-espresso)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'upi' ? 700 : 500,
                  boxShadow: activeTab === 'upi' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Smartphone size={18} color={activeTab === 'upi' ? 'var(--accent-amber)' : 'currentColor'} />
                <div style={{ flex: 1 }}>
                  <span>UPI & QR</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--veg-green)', fontWeight: 600 }}>
                    Fastest
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'card' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'card' ? 'var(--primary-espresso)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'card' ? 700 : 500,
                  boxShadow: activeTab === 'card' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <CreditCard size={18} color={activeTab === 'card' ? 'var(--accent-amber)' : 'currentColor'} />
                <div style={{ flex: 1 }}>
                  <span>Credit / Debit Card</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)' }}>
                    Visa, MC, RuPay
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'netbanking' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'netbanking' ? 'var(--primary-espresso)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'netbanking' ? 700 : 500,
                  boxShadow: activeTab === 'netbanking' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Building2 size={18} color={activeTab === 'netbanking' ? 'var(--accent-amber)' : 'currentColor'} />
                <div style={{ flex: 1 }}>
                  <span>Net Banking</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)' }}>
                    All Major Banks
                  </span>
                </div>
              </button>

              <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={handleLaunchOfficialRazorpay}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--accent-amber)',
                    backgroundColor: '#FFFBEB',
                    color: 'var(--accent-amber)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ExternalLink size={13} />
                  Razorpay Modal
                </button>
              </div>
            </div>

            {/* Tab Content Panel */}
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {/* TAB 1: UPI & QR */}
              {activeTab === 'upi' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-espresso)', margin: 0 }}>
                        UPI Instant Payment
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Scan the dynamic bakery QR code or enter your VPA.
                      </p>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      Zero Processing Fee
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    {/* Simulated Dynamic UPI QR */}
                    <div
                      style={{
                        padding: '12px',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {/* Real Dynamic UPI QR Code Image */}
                      <div
                        style={{
                          width: '140px',
                          height: '140px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #E5E7EB',
                        }}
                      >
                        {modalQrUrl ? (
                          <img
                            src={modalQrUrl}
                            alt="Dynamic UPI QR"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <QrCode size={70} color="var(--accent-amber)" />
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '8px' }}>
                        Scan &amp; Pay <strong>{formatCurrency(totalAmount)}</strong>
                      </span>
                    </div>

                    {/* Quick App Select */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                          Pay with installed UPI App:
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpiPay('gpay')}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: '#4285F4', fontWeight: 800 }}>G</span> Google Pay
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpiPay('phonepe')}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: '#5F259F', fontWeight: 800 }}>पे</span> PhonePe
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpiPay('paytm')}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: '#00BAF2', fontWeight: 800 }}>Paytm</span> Paytm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpiPay('bhim')}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: '#2C1810', fontWeight: 800 }}>BHIM</span> UPI
                          </button>
                        </div>
                      </div>

                      {/* Manual UPI ID input */}
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                          Or enter UPI ID / VPA:
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="username@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1.5px solid var(--border-subtle)',
                              fontSize: '0.85rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleUpiPay()}
                            className="btn btn-primary btn-sm"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            Verify & Pay
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-light)', backgroundColor: '#FAF7F2', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <ShieldCheck size={16} color="var(--veg-green)" />
                    <span>Instant payment notification automatically synchronizes with the kitchen display screen.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div>
                  {/* Virtual Credit Card Display */}
                  <div
                    style={{
                      height: '170px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #2C1810 0%, #5B2C1A 50%, #D97706 100%)',
                      color: '#FFFFFF',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 20px rgba(44, 24, 16, 0.25)',
                      marginBottom: '1.25rem',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85 }}>
                        Artisanal Bakery Pass
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '1.5px', color: '#FDE68A' }}>
                        {getCardNetwork().name}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.2rem', letterSpacing: '2.5px', fontFamily: 'monospace', fontWeight: 600 }}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.62rem', opacity: 0.7, textTransform: 'uppercase' }}>
                          Cardholder
                        </span>
                        <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                          {cardHolder.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.62rem', opacity: 0.7, textTransform: 'uppercase' }}>
                          Expires
                        </span>
                        <span style={{ fontWeight: 700 }}>
                          {cardExpiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Test Card Quick Fill Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>
                      Test Cards:
                    </span>
                    <button
                      type="button"
                      onClick={() => fillTestCard('visa')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#F8FAFC',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#1E3A8A',
                      }}
                    >
                      + Visa (4000)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillTestCard('mastercard')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#F8FAFC',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#B91C1C',
                      }}
                    >
                      + Mastercard (5123)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillTestCard('rupay')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#F8FAFC',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#065F46',
                      }}
                    >
                      + RuPay (6071)
                    </button>
                  </div>

                  {/* Card Form */}
                  <form onSubmit={handleCardPay}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="4000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border-subtle)',
                          fontSize: '0.88rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.5px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          Valid Thru
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          required
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          required
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: 700,
                      }}
                    >
                      <Lock size={16} /> Pay {formatCurrency(totalAmount)} with 3D Secure
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === 'netbanking' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-espresso)', marginBottom: '4px' }}>
                    Select Your Bank
                  </h4>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Secure direct bank redirection simulator with instantaneous reconciliation.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
                    {POPULAR_BANKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b.name)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${selectedBank === b.name ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                          backgroundColor: selectedBank === b.name ? '#FFFBEB' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: b.badgeColor,
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {b.code}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-espresso)', textAlign: 'center' }}>
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Or choose from all other banks:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {OTHER_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleNetBankingPay}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '11px', fontWeight: 700 }}
                  >
                    Proceed with {selectedBank} • {formatCurrency(totalAmount)}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3D Secure Bank OTP Modal Simulation */}
        {showOtpModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(28, 25, 23, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1050,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <ShieldCheck size={24} />
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-espresso)', marginBottom: '4px' }}>
                3D Secure Verification
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Bank SMS OTP sent to registered mobile ending in <strong>••88</strong> for authorization of{' '}
                <strong style={{ color: 'var(--accent-amber)' }}>{formatCurrency(totalAmount)}</strong>.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{
                    fontSize: '1.5rem',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontWeight: 700,
                    width: '160px',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--accent-amber)',
                    outline: 'none',
                  }}
                />
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '6px' }}>
                  Demo Sandbox Hint: Enter <strong>1234</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
