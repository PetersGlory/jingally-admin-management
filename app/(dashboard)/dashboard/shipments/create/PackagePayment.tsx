"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Shield, Check, X, Edit2, AlertCircle, Package, Truck, MapPin, Calendar, ArrowLeft, Banknote, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './PackagePayment.module.css';
import { updatePaymentStatus } from '@/lib/shipment';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Types
interface PaymentMethod {
  id: 'card' | 'paypal' | 'bank_transfer';
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

interface CostItem {
  label: string;
  amount: string;
  type: 'regular' | 'total';
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  packageType: string;
  serviceType: string;
  packageDescription: string;
  fragile: boolean;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    length: number;
  };
  pickupAddress: {
    city: string;
    type: string;
    state: string;
    street: string;
    country: string;
    postcode: string;
  };
  deliveryAddress: {
    city: string;
    type: string;
    state: string;
    street: string;
    country: string;
    postcode: string;
  };
  deliveryType: string;
  scheduledPickupTime: string;
  estimatedDeliveryTime: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverEmail: string;
  price: number | null;
  paymentStatus: string;
  notes: string | null;
  driverId: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AUSe4Ql97Z0R9iuUNVepPih6A6ljVMQfI5IveM_9R0MxcPvGajQOFDYh0b6lrhWioNp6VRuupOOar3zv";

// Shipping method constants
const SHIPPING_METHODS = {
  AIR: 'airfreight',
  JINGSLY: 'jingsly',
  FROZEN: 'frozen',
  SEA: 'seafreight',
  PARCEL: 'parcel'
} as const;

// Air freight price per kg
const AIR_PRICE_PER_KG = 10; // £10 per kg

// Jingslly price tiers
const JINGSLY_PRICES = {
  TIER_1: { maxWeight: 50, pricePerKg: 650 },
  TIER_2: { maxWeight: 100, pricePerKg: 550 },
  TIER_3: { minWeight: 101, pricePerKg: 500 }
};

// Frozen food price
const FROZEN_PRICE_PER_KG = 1100;
// Air freight price per cubic meter
const AIR_PRICE_PER_CUBIC_METER = 10; // £300 per cubic meter

// Sea freight constants
const SEA_FREIGHT_PRICE_PER_CUBIC_METER = 300; // £300 per cubic meter
const SEA_MAX_WEIGHT_PER_ITEM = 40; // kg

export default function PackagePayment({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['id'] | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });
  const [showBankModal, setShowBankModal] = useState(false);
  const [cardErrors, setCardErrors] = useState<Partial<CardDetails>>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [shipmentStr, accessToken] = await Promise.all([
        localStorage.getItem('packageInfo'),
        localStorage.getItem('token')
      ]);

      if (shipmentStr && accessToken) {
        setShipment(JSON.parse(shipmentStr));
        setToken(accessToken);
      } else {
        setError('No shipment information found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load shipment information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const paymentMethods = useMemo(() => [
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: <CreditCard size={20} />,
      isEnabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer',
      icon: <Banknote size={20} />,
      isEnabled: true
    },
  ], []);

  const calculateVolumetricWeight = useCallback((dimensions: { length: number; width: number; height: number }) => {
    return (dimensions.length * dimensions.width * dimensions.height) / 6000;
  }, []);

  const calculateAirFreightPrice = useCallback((weight: number, dimensions: { length: number; width: number; height: number }) => {
    // Convert dimensions from cm to meters
    const lengthInMeters = dimensions.length;
    const widthInMeters = dimensions.width;
    const heightInMeters = dimensions.height;
    
    // Calculate cubic meters
    const cubicMeters = lengthInMeters * widthInMeters * heightInMeters;
    
    // Calculate price based on cubic meters
    const price = cubicMeters / 6000;
    
    // Round to 2 decimal places
    return Math.round(price * AIR_PRICE_PER_CUBIC_METER);
  }, []);

  const calculateJingsllyPrice = useCallback((weight: number) => {
    if (weight <= JINGSLY_PRICES.TIER_1.maxWeight) {
      return weight * JINGSLY_PRICES.TIER_1.pricePerKg;
    } else if (weight <= JINGSLY_PRICES.TIER_2.maxWeight) {
      return weight * JINGSLY_PRICES.TIER_2.pricePerKg;
    } else {
      return weight * JINGSLY_PRICES.TIER_3.pricePerKg;
    }
  }, []);

  const calculateSeaFreightPrice = useCallback((dimensions: { length: number; width: number; height: number }) => {
    const lengthInMeters = dimensions.length / 100;
    const widthInMeters = dimensions.width / 100;
    const heightInMeters = dimensions.height / 100;
    
    const cubicMeters = lengthInMeters * widthInMeters * heightInMeters;
    const price = cubicMeters * SEA_FREIGHT_PRICE_PER_CUBIC_METER;
    
    return Math.round(price * 100) / 100;
  }, []);

  const calculateCosts = useCallback((): CostItem[] => {
    if (!shipment) return [];
    
    const { weight, dimensions, serviceType } = shipment;
    let baseFee = 0;
    let methodName = '';

    switch (serviceType) {
      case SHIPPING_METHODS.AIR:
        baseFee = calculateAirFreightPrice(weight, dimensions);
        methodName = 'Air Freight';
        break;
      case SHIPPING_METHODS.JINGSLY:
        baseFee = calculateJingsllyPrice(weight);
        methodName = 'Jingslly Logistics';
        break;
      case SHIPPING_METHODS.FROZEN:
        baseFee = weight * FROZEN_PRICE_PER_KG;
        methodName = 'Frozen Food Shipping';
        break;
      case SHIPPING_METHODS.SEA:
        if (weight > SEA_MAX_WEIGHT_PER_ITEM) {
          setError(`Sea freight items cannot exceed ${SEA_MAX_WEIGHT_PER_ITEM}kg per item`);
          return [];
        }
        baseFee = calculateSeaFreightPrice(dimensions);
        methodName = 'Sea Freight';
        break;
      default:
        setError('Invalid shipping method');
        return [];
    }

    const serviceFee = 20;
    // const vat = Math.round((baseFee + serviceFee) * 0.2 * 100) / 100;
    const total = Math.round((baseFee + serviceFee) * 100) / 100;

    return [
      { label: `${methodName} Fee`, amount: `£${baseFee.toFixed(2)}`, type: 'regular' },
      { label: 'Service Fee', amount: `£${serviceFee.toFixed(2)}`, type: 'regular' },
      { label: 'Total', amount: `£${total.toFixed(2)}`, type: 'total' }
    ];
  }, [shipment, calculateAirFreightPrice, calculateJingsllyPrice, calculateSeaFreightPrice]);

  const costs = useMemo(() => calculateCosts(), [calculateCosts]);

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails(prev => ({ ...prev, cardNumber: value }));
    setCardErrors(prev => ({ ...prev, cardNumber: '' }));
  }, []);

  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
    setCardErrors(prev => ({ ...prev, expiryDate: '' }));
  }, []);

  const validateCard = useCallback(() => {
    const errors: Partial<CardDetails> = {};
    let isValid = true;

    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
      isValid = false;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      isValid = false;
    }

    if (cardDetails.cvv.length !== 3) {
      errors.cvv = 'Please enter a valid 3-digit CVV';
      isValid = false;
    }

    if (!cardDetails.cardHolderName.trim()) {
      errors.cardHolderName = 'Please enter the cardholder name';
      isValid = false;
    }

    setCardErrors(errors);
    return isValid;
  }, [cardDetails]);

  const handlePayment = useCallback(async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setIsLoading(true);

      if (selectedMethod === 'paypal') {
        setShowPayPalModal(true);
        return;
      }

      if (selectedMethod === 'bank_transfer') {
        setShowBankModal(true);
        return;
      }

      if (!validateCard()) {
        return;
      }

      const amount = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
      const paymentDetails = {
        method: 'card',
        amount,
        paymentStatus: 'paid',
        currency: 'GBP',
        card: {
          ...cardDetails,
          cardNumber: cardDetails.cardNumber.replace(/\s/g, '')
        }
      };

      const paymentResponse = await updatePaymentStatus(
        shipment?.id || '',
        paymentDetails,
        token
      );

      if (paymentResponse.success) {
        localStorage.setItem('packageInfo', JSON.stringify(paymentResponse.data));
        localStorage.removeItem('currentStep')
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          router.replace("/dashboard/shipments");
        }, 2000);
      } else {
        setError(paymentResponse.message || 'Payment failed');
      }
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMethod, validateCard, costs, shipment, token, router, cardDetails]);

  const handlePayPalPayment = useCallback(async () => {
    try {
      setIsLoading(true);
      const amount = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
      
      const paymentDetails = {
        method: 'paypal',
        amount,
        currency: 'GBP',
        paymentStatus: 'paid'
      };

      const paymentResponse = await updatePaymentStatus(
        shipment?.id || '',
        paymentDetails,
        token
      );

      if (paymentResponse.success) {
        localStorage.setItem('packageInfo', JSON.stringify(paymentResponse.data));
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          router.replace("/dashboard/shipments");
        }, 2000);
      } else {
        setError(paymentResponse.message || 'Payment failed');
      }
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
      setShowPayPalModal(false);
    }
  }, [costs, shipment, token, router]);

  const handleBankTransferConfirmation = useCallback(async () => {
    try {
      setIsLoading(true);
      const amount = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
      
      const paymentDetails = {
        method: 'bank_transfer',
        amount,
        paymentStatus: 'pending',
        currency: 'GBP'
      };

      const paymentResponse = await updatePaymentStatus(
        shipment?.id || '',
        paymentDetails,
        token
      );

      if (paymentResponse.success) {
        localStorage.setItem('packageInfo', JSON.stringify(paymentResponse.data));
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          router.replace("/dashboard/shipments/manual");
        }, 2000);
      } else {
        setError(paymentResponse.message || 'Payment failed');
      }
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
      setShowBankModal(false);
    }
  }, [costs, shipment, token, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-2xl font-bold">Payment Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setError('');
              fetchData();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-gray-500 text-4xl">📦</div>
          <h2 className="text-2xl font-bold">No Shipment Found</h2>
          <p className="text-muted-foreground">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ 
      clientId: PAYPAL_CLIENT_ID,
      currency: "GBP",
      intent: "capture",
    }}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className="flex flex-row items-center gap-4">
            <button 
              className={styles.backButton}
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1>Payment</h1>
          </div>
          <button 
            className={styles.cancelButton}
            onClick={onBack}
          >
            Cancel
          </button>
        </header>

        <main className={styles.main}>
          {/* Package Summary */}
          <div className={styles.summarySection}>
            <h2 className={styles.sectionTitle}>Package Summary</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Tracking Number</span>
                </div>
                <span>{shipment.trackingNumber}</span>
              </div>
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Weight</span>
                </div>
                <span>{shipment.weight}kg</span>
              </div>
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Dimensions</span>
                </div>
                <span>
                  {shipment.dimensions.length}x{shipment.dimensions.width}x{shipment.dimensions.height}cm
                </span>
              </div>
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Service Type</span>
                </div>
                <span>{shipment.serviceType}</span>
              </div>
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Pickup Date</span>
                </div>
                <span>
                  {new Date(shipment.scheduledPickupTime).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Delivery Address</span>
                </div>
                <span>
                  {shipment.deliveryAddress.street}, {shipment.deliveryAddress.city}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className={styles.costSection}>
            <h2 className={styles.sectionTitle}>Cost Breakdown</h2>
            <div className={styles.costList}>
              {costs.map((item) => (
                <div 
                  key={item.label}
                  className={`${styles.costItem} ${item.type === 'total' ? styles.totalItem : ''}`}
                >
                  <span className={item.type === 'total' ? styles.totalLabel : ''}>
                    {item.label}
                  </span>
                  <span className={item.type === 'total' ? styles.totalAmount : ''}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className={styles.paymentSection}>
            <h2 className={styles.sectionTitle}>Select Payment Method</h2>
            <div className={styles.paymentMethods}>
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    className={`${styles.paymentMethod} ${isSelected ? styles.selected : ''}`}
                    onClick={() => {
                      if (method.id === 'paypal') {
                        setSelectedMethod(method.id as PaymentMethod['id']);
                        setShowPayPalModal(true);
                      } else if (method.id === 'bank_transfer') {
                        setSelectedMethod(method.id as PaymentMethod['id']);
                        setShowBankModal(true);
                      } else {
                        setSelectedMethod(method.id as PaymentMethod['id']);
                      }
                    }}
                    disabled={!method.isEnabled}
                  >
                    <div className={styles.methodContent}>
                      <div className={`${styles.methodIcon} ${isSelected ? styles.selectedIcon : ''}`}>
                        {method.icon}
                      </div>
                      <div className={styles.methodInfo}>
                        <h3>{method.name}</h3>
                        <p>{method.description}</p>
                      </div>
                      {isSelected && <Check size={20} className={styles.checkIcon} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Note */}
          <div className={styles.securityNote}>
            <Shield size={20} />
            <div>
              <h3>Secure Payment</h3>
              <p>
                Your payment information is encrypted and securely processed. We never store your complete card details.
              </p>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <button
            className={`${styles.payButton} ${selectedMethod && !isLoading ? styles.active : ''}`}
            disabled={!selectedMethod || isLoading}
            onClick={handlePayment}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader size={20} className="animate-spin" />
                Processing...
              </div>
            ) : (
              selectedMethod === 'paypal' ? 'Pay with PayPal' : 
              selectedMethod ? `Pay ${costs.find(c => c.type === 'total')?.amount}` : 
              'Select Payment Method'
            )}
          </button>
        </footer>

        {/* PayPal Modal */}
        {showPayPalModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Pay with PayPal</h2>
                <button onClick={() => setShowPayPalModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className="flex flex-col items-center justify-center p-6">
                  <p className="text-center mb-4">You will be redirected to PayPal to complete your payment.</p>
                  <p className="text-center mb-6 font-semibold">
                    Total Amount: {costs.find(c => c.type === 'total')?.amount}
                  </p>
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "pay"
                    }}
                    createOrder={(data, actions) => {
                      const amount = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: amount.toString(),
                              currency_code: "GBP"
                            },
                            description: `Payment for shipment ${shipment?.trackingNumber}`
                          }
                        ],
                        intent: 'CAPTURE',
                        application_context:{
                          shipping_preference: "NO_SHIPPING"
                        }
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const details = await actions.order?.capture();
                        if (details?.status === "COMPLETED") {
                          await handlePayPalPayment();
                        }
                      } catch (error) {
                        setError("Payment failed. Please try again.");
                      }
                    }}
                    onError={(err) => {
                      setError("An error occurred with PayPal. Please try again.");
                      console.error("PayPal Error:", err);
                    }}
                    onCancel={() => {
                      setShowPayPalModal(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Modal */}
        {showBankModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Bank Transfer Details</h2>
                <button onClick={() => setShowBankModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Bank Account Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Account Name:</span> Jingally logistics ltd</p>
                      <p><span className="font-medium">Account Number:</span> 29944068</p>
                      <p><span className="font-medium">Sort Code:</span> 305466</p>
                      <p><span className="font-medium">Bank Name:</span> Llyods Bank</p>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Important Information</h3>
                    <p className="text-sm text-orange-800">
                      Please use your tracking number as the payment reference. Your shipment will be processed once the payment is confirmed.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBankModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleBankTransferConfirmation}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        'I Have Made Payment'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.successModal}>
              <div className={styles.successIcon}>
                <Check size={32} />
              </div>
              <h2>Payment Successful!</h2>
              <p>
                Your payment has been processed successfully. You will be redirected to tracking shortly.
              </p>
              <div className={styles.progressBar}>
                <div className={styles.progress} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
}