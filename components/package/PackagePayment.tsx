'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Shield, Check, X, Edit2, AlertCircle, Package, Truck, MapPin, Calendar, ArrowLeft, Banknote, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './PackagePayment.module.css';
import { updatePaymentStatus } from '@/lib/shipment';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Types
interface PaymentMethod {
  id: 'card' | 'paypal' | 'bank_transfer' | 'part_payment';
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

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  latitude: number;
  longitude: number;
  placeId: string;
  type: string;
}

interface PriceGuide {
  id: string;
  guideName: string;
  price: number;
  guideNumber: string;
}

export interface DimensionPallet{
  id: number;
  length: string;
  width: string;
  height: string;
  weight: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  packageType: string;
  serviceType: string;
  packageDescription: string;
  fragile: boolean;
  weight: number | null;
  dimensions: {
    width: number;
    height: number;
    length: number;
  } | null;
  priceGuides: string;
  pickupAddress: string | Address;
  deliveryAddress: string | Address;
  deliveryType: string;
  scheduledPickupTime: string;
  estimatedDeliveryTime: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverEmail: string;
  price: string | null;
  paymentStatus: string;
  paymentMethod: string;
  notes: string | null;
  driverId: string | null;
  containerID: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const PAYPAL_CLIENT_ID = "AUSe4Ql97Z0R9iuUNVepPih6A6ljVMQfI5IveM_9R0MxcPvGajQOFDYh0b6lrhWioNp6VRuupOOar3zv";

// Shipping method constants
const SHIPPING_METHODS = {
  AIR: 'airfreight',
  JINGSLY: 'jingsly',
  FROZEN: 'frozen',
  SEA: 'seafreight',
  PARCEL: 'parcel'
} as const;

// Price constants
const AIR_PRICE_PER_CUBIC_METER = 300; // £300 per cubic meter
const SEA_FREIGHT_PRICE_PER_CUBIC_METER = 300; // £300 per cubic meter
const FROZEN_PRICE_PER_KG = 1100; // £1100 per kg
const SEA_MAX_WEIGHT_PER_ITEM = 40; // kg

// Jingslly price tiers
const JINGSLY_PRICES = {
  TIER_1: { maxWeight: 50, pricePerKg: 650 },
  TIER_2: { maxWeight: 100, pricePerKg: 550 },
  TIER_3: { minWeight: 101, pricePerKg: 500 }
};

const calculateVolumetricWeight = (dimensions: { length: number; width: number; height: number }): number => {
  // Convert dimensions from cm to meters
  const lengthInMeters = dimensions.length / 100;
  const widthInMeters = dimensions.width / 100;
  const heightInMeters = dimensions.height / 100;
  
  // Calculate cubic meters
  return lengthInMeters * widthInMeters * heightInMeters;
};

const calculateAirFreightPrice = (weight: number, dimensions: { length: number; width: number; height: number }): number => {
  // Calculate volumetric weight
  const volumetricWeight = calculateVolumetricWeight(dimensions);
  
  // Calculate weight-based price
  const weightPrice = weight * 10; // £10 per kg
  
  // Calculate volumetric price
  const volumetricPrice = volumetricWeight * AIR_PRICE_PER_CUBIC_METER;
  
  // Return the greater of the two prices
  return Math.max(weightPrice, volumetricPrice);
};

const calculateJingsllyPrice = (weight: number): number => {
  if (weight <= JINGSLY_PRICES.TIER_1.maxWeight) {
    return weight * JINGSLY_PRICES.TIER_1.pricePerKg;
  } else if (weight <= JINGSLY_PRICES.TIER_2.maxWeight) {
    return weight * JINGSLY_PRICES.TIER_2.pricePerKg;
  } else {
    return weight * JINGSLY_PRICES.TIER_3.pricePerKg;
  }
};

const calculateSeaFreightPrice = (dimensions: { length: number; width: number; height: number }): number => {
  // Calculate volumetric weight
  const volumetricWeight = calculateVolumetricWeight(dimensions);
  
  // Calculate price based on cubic meters
  return volumetricWeight * SEA_FREIGHT_PRICE_PER_CUBIC_METER;
};

export default function PackagePayment({ handleNextStep, handlePreviousStep }: { handleNextStep: () => void, handlePreviousStep: () => void }) {
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
  const [selectedPaymentAmount,setSelectedPaymentAmount] = useState('0')

  const parseAddress = (addressString: string): Address => {
    console.log(addressString)
    try {
      return JSON.parse(addressString);
    } catch (error) {
      console.error('Error parsing address:', error);
      return {
        street: '',
        city: '',
        state: '',
        country: '',
        postcode: '',
        latitude: 0,
        longitude: 0,
        placeId: '',
        type: ''
      };
    }
  };

  const parsePriceGuides = (priceGuidesString: string): PriceGuide[] => {
    try {
      return JSON.parse(priceGuidesString);
    } catch (error) {
      console.error('Error parsing price guides:', error);
      return [];
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [shipmentStr, accessToken] = await Promise.all([
        localStorage.getItem('packageInfo'),
        localStorage.getItem('token')
      ]);

      if (shipmentStr && accessToken) {
        const parsedShipment: Shipment = JSON.parse(shipmentStr);
        setShipment(parsedShipment);
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
    // {
    //   id: 'part_payment',
    //   name: 'Part Payment',
    //   description: 'Pay via bank transfer',
    //   icon: <Banknote size={20} />,
    //   isEnabled: true
    // },
  ], []);


  const calculateCosts = useCallback((): CostItem[] => {
    if (!shipment) return [];
    
    const { serviceType, priceGuides, weight, dimensions, deliveryType } = shipment;
    let baseFee = 0;
    let methodName = '';

    // Parse price guides
    const parsedPriceGuides = parsePriceGuides(priceGuides);

    // Parse dimensions if they exist
    const parsedDimensions = dimensions ? 
      (typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions) : 
      null;

    switch (serviceType) {
      case SHIPPING_METHODS.SEA:
        if (parsedPriceGuides && parsedPriceGuides.length > 0) {
          // Sum up all price guide prices
          baseFee = parsedPriceGuides.reduce((sum, guide) => sum + guide.price, 0);
          methodName = 'Sea Freight (Price Guide)';
        } else if (parsedDimensions) {
          // Fallback to volumetric calculation if no price guides
          baseFee = calculateSeaFreightPrice(parsedDimensions);
          methodName = 'Sea Freight (Volumetric)';
        }
        break;
      case SHIPPING_METHODS.AIR:
        if (weight && parsedDimensions) {
          baseFee = calculateAirFreightPrice(weight, parsedDimensions);
          methodName = 'Air Freight';
        }
        break;
      case SHIPPING_METHODS.JINGSLY:
        if (weight) {
          baseFee = calculateJingsllyPrice(weight);
          methodName = 'Jingslly Logistics';
        }
        break;
      case SHIPPING_METHODS.FROZEN:
        if (weight) {
          baseFee = weight * FROZEN_PRICE_PER_KG;
          methodName = 'Frozen Food Shipping';
        }
        break;
      default:
        setError('Invalid shipping method');
        return [];
    }

    const serviceFee = serviceType === SHIPPING_METHODS.SEA ? 0 : 20;
    const total = baseFee + serviceFee;

    return [
      { label: `${methodName} Fee`, amount: `£${baseFee.toFixed(2)}`, type: 'regular' as const },
      ...(serviceType !== SHIPPING_METHODS.SEA && deliveryType == "home" ? [
        { label: 'Service Fee', amount: `£${20.00}`, type: 'regular' as const }
        // { label: 'Service Fee', amount: `£${serviceFee.toFixed(2)}`, type: 'regular' as const }
      ] : []),
      { label: 'Total', amount: `£${total.toFixed(2)}`, type: 'total' as const }
    ];
  }, [shipment]);

  const costs = useMemo(() => calculateCosts(), [calculateCosts]);

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails(prev => ({ ...prev, cardNumber: value }));
  }, []);

  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  }, []);

  const validateCard = useCallback(() => {
    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (cardDetails.cvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV');
      return false;
    }
    if (!cardDetails.cardHolderName.trim()) {
      setError('Please enter the cardholder name');
      return false;
    }
    return true;
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
        localStorage.removeItem('currentStep');
        
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
        localStorage.removeItem('currentStep');
        
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
        method: selectedMethod || 'bank_transfer',
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
        localStorage.removeItem('currentStep');
        
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
              onClick={handlePreviousStep}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
        <h1>Payment</h1>
          </div>
        <button 
          className={styles.cancelButton}
          onClick={handlePreviousStep}
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
              <span>{shipment?.trackingNumber}</span>
            </div>
            {shipment?.weight && (
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Weight</span>
                </div>
                <span>{shipment.weight}kg</span>
              </div>
            )}
            {shipment?.dimensions && (
              <div className={styles.summaryItem}>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Dimensions</span>
                </div>
                <span>
                  {(() => {
                    const dims = typeof shipment.dimensions === 'string' 
                      ? JSON.parse(shipment.dimensions) 
                      : shipment.dimensions;
                    return `${dims.length}x${dims.width}x${dims.height}cm`;
                  })()}
                </span>
              </div>
            )}
            <div className={styles.summaryItem}>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Service Type</span>
              </div>
              <span className="capitalize">{shipment?.serviceType}</span>
            </div>
            <div className={styles.summaryItem}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Pickup Date</span>
              </div>
              <span>
                {shipment?.scheduledPickupTime && new Date(shipment.scheduledPickupTime).toLocaleDateString('en-GB', {
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
                {shipment?.deliveryAddress && (
                  typeof shipment.deliveryAddress === 'string' 
                    ? `${parseAddress(shipment.deliveryAddress).street}, ${parseAddress(shipment.deliveryAddress).city}`
                    : `${shipment.deliveryAddress?.street}, ${shipment.deliveryAddress?.city}`
                )}
              </span>
            </div>
          </div>
        </div>

        {shipment?.priceGuides && (
          <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <List className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{shipment.packageType === "container" ? "Container" :"Price Guides"}</span>
            </div>
            <div className="flex flex-col gap-2">
              {(() => {
                const guides = typeof shipment.priceGuides === 'string' 
                  ? JSON.parse(shipment.priceGuides) 
                  : shipment.priceGuides;
                return guides.map((guide: PriceGuide) => (
                  <div key={guide.id} className="flex justify-between items-center text-sm text-gray-700 py-1 px-2 bg-gray-50 rounded">
                    <div className="flex flex-col">
                      <span>{guide.guideName}</span>
                      <span className="text-xs text-gray-500">{guide.guideNumber}</span>
                    </div>
                    <span className="font-medium text-blue-600">£{guide.price}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* {shipment?.priceGuides && shipment?.packageType ==="pallet" && (
          <div className="flex flex-col p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <List className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Pallet Information</span>
            </div>
            <div className="flex flex-col gap-3">
              {(() => {
                const guides = typeof shipment.priceGuides === 'string' 
                  ? JSON.parse(shipment.priceGuides) 
                  : shipment.priceGuides;
                return guides.map((guide: DimensionPallet, index: number) => (
                  <div 
                    key={guide.id} 
                    className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold text-gray-900">Pallet {index + 1}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-sm border border-blue-200">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium">
                              {guide.length} × {guide.width} × {guide.height} cm 
                            </span>
                            <span className="text-xs text-blue-600 mt-0.5">
                             (L × W × H)
                            </span>
                          </div>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                          {guide.weight} kg
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )} */}

        {/* Cost Breakdown */}
        <div className={styles.costSection}>
          <h2 className={styles.sectionTitle}>Cost Breakdown</h2>
          <div className={styles.costList}>
            {shipment?.packageType !== "pallet" && costs.map((item) => (
              <div 
                key={item.label}
                className={`${styles.costItem} ${item.type === 'total' ? styles.totalItem : ''}`}
              >
                <span className={item.type === 'total' ? styles.totalLabel : ''}>
                  {item.label}
                </span>
                <span className={item.type === 'total' ? styles.totalAmount : ''}>
                  {item.label === 'Total' ? "Will be communicated." : item.amount ? item?.amount : "0"}
                </span>
              </div>
            ))}

            {/* Part Payment */}
            {shipment?.serviceType !== "airfreight" && (
              <div className='w-full'>
              <h3 className='font-bold'>Part Payment</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pay70"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const total = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
                        const seventyPercent = (total * 0.7).toFixed(2);
                        setSelectedPaymentAmount(seventyPercent);
                      } else {
                        setSelectedPaymentAmount('0');
                      }
                    }}
                  />
                  <label htmlFor="pay70" className="text-sm font-medium text-gray-700">
                    Pay 70%{/*  (£{(parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0') * 0.7).toFixed(2)}) */}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pay50"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const total = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
                        const fiftyPercent = (total * 0.5).toFixed(2);
                        setSelectedPaymentAmount(fiftyPercent);
                      } else {
                        setSelectedPaymentAmount('0');
                      }
                    }}
                  />
                  <label htmlFor="pay50" className="text-sm font-medium text-gray-700">
                    Pay 50% {/* (£{(parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0') * 0.5).toFixed(2)}) */}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="payFull"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const total = parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0');
                        setSelectedPaymentAmount(total.toFixed(2));
                      } else {
                        setSelectedPaymentAmount('0');
                      }
                    }}
                  />
                  <label htmlFor="payFull" className="text-sm font-medium text-gray-700">
                    Pay in full upon delivery{/* (£{parseFloat(costs.find(c => c.type === 'total')?.amount.replace('£', '') || '0').toFixed(2)}) */}
                  </label>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Note:</span> Balance payment is to be made upon final delivery
                </p>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        {/* <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Select Payment Method</h2>
          <div className={styles.paymentMethods}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;
              // Only show bank transfer if partial payment is selected
              if (selectedPaymentAmount !== '0' && method.id !== 'bank_transfer') {
                return null;
              }
              return (
                <button
                  key={method.id}
                  className={`${styles.paymentMethod} ${isSelected ? styles.selected : ''}`}
                  onClick={() => {
                    if (method.id === 'card') {
                      setShowCardModal(true);
                    } else if (method.id === 'paypal') {
                      setSelectedMethod(method.id as PaymentMethod['id']);
                      setShowPayPalModal(true);
                    } else if (method.id === 'bank_transfer') {
                      setSelectedMethod(method.id as PaymentMethod['id']);
                      setShowBankModal(true);
                    } else if(method.id === 'part_payment'){
                      setSelectedMethod(method.id as PaymentMethod['id']);
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
        </div> */}

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
          className={`${styles.payButton} ${!isLoading ? styles.active : ''}`}
          disabled={isLoading}
          onClick={() => {
            if (shipment?.serviceType === 'airfreight' && shipment?.deliveryType === 'home') {
              setShowPayPalModal(true);
            } else {
              handleBankTransferConfirmation();
            }
          }}
        >
          {isLoading ? (
            'Processing...'
          ) : (
            // selectedMethod === 'paypal' ? 'Pay with PayPal' : (shipment?.serviceType === 'airfreight' && shipment?.deliveryType === 'home') ? 'Pay £20':
            // selectedMethod ? `Pay ${'£'+selectedPaymentAmount || costs.find(c => c.type === 'total')?.amount}` : 
            'Schedule Payment'
          )}
        </button>
      </footer>

      {/* Card Modal */}
      {showCardModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add Card Details</h2>
              <button onClick={() => setShowCardModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    maxLength={3}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="JOHN SMITH"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardHolderName: e.target.value }))}
                />
              </div>

              <button
                className={styles.saveButton}
                onClick={() => {
                  if (validateCard()) {
                    setSelectedMethod('card');
                    setShowCardModal(false);
                  }
                }}
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}

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
                  Total Amount: £20
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
                              value: '20',
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
                      Please use your tracking number as the payment reference. Your shipment will be processed once the payment is confirmed. For part payments, please Note that it's (70%/30%) and also indicate the amount paid in the reference.
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
                      {isLoading ? 'Processing...' : 'I Have Made Payment'}
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
              <Calendar size={32} />
            </div>
            <h2>Payment Scheduled!</h2>
            <p>
              Your payment has been scheduled successfully. You will be notified when the payment is processed.
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
