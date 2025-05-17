"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, Info, X, ChevronDown, ArrowRight, Loader, Check, ArrowLeft } from 'lucide-react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import styles from './PackageDelivery.module.css';
import { updateDeliveryAddress } from '@/lib/shipment';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dial_code: string;
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
  type: 'residential' | 'business';
}

interface Receiver {
  name: string;
  phone: string;
  email: string;
  countryCode: string;
}

interface DeliveryForm {
  pickupAddress: Address;
  deliveryAddress: Address;
  receiver: Receiver;
  deliveryMode: 'home' | 'park';
}

const countryCodes: CountryCode[] = [
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial_code: '+44' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dial_code: '+234' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dial_code: '+220' },
];

const DEFAULT_PARK_ADDRESS = {
  street: 'Park Delivery Point',
  city: 'London',
  state: 'Greater London',
  country: 'United Kingdom',
  postcode: 'SW1A 1AA',
  latitude: 51.5074,
  longitude: -0.1278,
  placeId: 'park_delivery_point',
  type: 'business' as const
};

interface PackageDeliveryProps {
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
  initialData?: any;
}


export default function PackageDelivery({ onNext, onBack, onUpdate, initialData }: PackageDeliveryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [deliveryAutocomplete, setDeliveryAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'park'>('home');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<DeliveryForm>>({});

  const [form, setForm] = useState<DeliveryForm>({
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
      latitude: 0,
      longitude: 0,
      placeId: '',
      type: 'residential'
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
      latitude: 0,
      longitude: 0,
      placeId: '',
      type: 'residential'
    },
    receiver: {
      name: '',
      phone: '',
      email: '',
      countryCode: '+44'
    },
    deliveryMode: 'home'
  });

  const handlePlaceSelect = (type: 'pickup' | 'delivery') => {
    const autocomplete = type === 'pickup' ? pickupAutocomplete : deliveryAutocomplete;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const addressComponents = place.address_components || [];
        
        const street = place.formatted_address || '';
        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
        const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
        const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
        const postcode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
        
        const address = {
          street,
          city,
          state,
          country,
          postcode,
          latitude: place.geometry?.location?.lat() || 0,
          longitude: place.geometry?.location?.lng() || 0,
          placeId: place.place_id || '',
          type: type === 'pickup' ? form.pickupAddress.type : form.deliveryAddress.type
        };

        setForm(prev => ({
          ...prev,
          [`${type}Address`]: address
        }));

        setFormErrors(prev => ({
          ...prev,
          [`${type}Address`]: undefined
        }));
      }
    }
  };

  const isValidForm = () => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return (
      form.pickupAddress.street.trim() !== '' &&
      form.pickupAddress.city.trim() !== '' &&
      form.pickupAddress.state.trim() !== '' &&
      form.pickupAddress.country.trim() !== '' &&
      form.pickupAddress.postcode.trim() !== '' &&
      form.deliveryAddress.street.trim() !== '' &&
      form.deliveryAddress.city.trim() !== '' &&
      form.deliveryAddress.state.trim() !== '' &&
      form.deliveryAddress.country.trim() !== '' &&
      form.deliveryAddress.postcode.trim() !== '' &&
      form.receiver.name.trim() !== '' &&
      form.receiver.phone.trim() !== '' &&
      phoneRegex.test(form.receiver.phone.trim())
    );
  };

  const handleSubmit = async () => {
    if (!isValidForm()) {
      setFormErrors({
        pickupAddress: {
          street: 'Please fill in all required fields',
          city: '',
          state: '',
          country: '',
          postcode: '',
          latitude: 0,
          longitude: 0,
          placeId: '',
          type: 'residential'
        },
        deliveryAddress: {
          street: 'Please fill in all required fields',
          city: '',
          state: '',
          country: '',
          postcode: '',
          latitude: 0,
          longitude: 0,
          placeId: '',
          type: 'residential'
        },
        receiver: {
          name: 'Please fill in all required fields',
          phone: '',
          email: '',
          countryCode: ''
        }
      });
      return;
    }

    try {
      setIsLoading(true);
      const packageInfoStr = localStorage.getItem('packageInfo');
      if (!packageInfoStr) {
        alert('Package information not found');
        return;
      }

      const packageInfo = JSON.parse(packageInfoStr);
      const token = localStorage.getItem('token') || "";

      const response = await updateDeliveryAddress(packageInfo.id, {
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        receiverName: form.receiver.name,
        receiverEmail: form.receiver.email,
        receiverPhoneNumber: form.receiver.phone,
        deliveryMode: form.deliveryMode
      }, token);

      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '6')
        onNext();
      } else {
        throw new Error(response.message || 'Failed to update delivery details');
      }
    } catch (error: any) {
      console.error('Error saving delivery details:', error);
      alert(error.message || 'Failed to save delivery details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressForm = (
    title: string,
    icon: React.ReactNode,
    address: Address,
    setAddress: (address: Address) => void,
    type: 'pickup' | 'delivery'
  ) => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>

      <div className={styles.addressForm}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Street Address</label>
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            libraries={["places"]}
            onLoad={() => setMapLoaded(true)}
          >
            <div className="relative items-center">
              <div className="relative w-6 inset-y-0 left-0 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Autocomplete
                onLoad={(autocomplete: google.maps.places.Autocomplete) => {
                  if (type === 'pickup') {
                    setPickupAutocomplete(autocomplete);
                  } else {
                    setDeliveryAutocomplete(autocomplete);
                  }
                }}
                onPlaceChanged={() => handlePlaceSelect(type)}
              >
                <input
                  type="text"
                  className={`${styles.input} ${formErrors[`${type}Address`]?.street ? styles.error : ''}`}
                  placeholder="Enter street address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </Autocomplete>
            </div>
          </LoadScript>
          {formErrors[`${type}Address`]?.street && (
            <span className={styles.errorMessage}>{formErrors[`${type}Address`]?.street}</span>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>City</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors[`${type}Address`]?.city ? styles.error : ''}`}
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            {formErrors[`${type}Address`]?.city && (
              <span className={styles.errorMessage}>{formErrors[`${type}Address`]?.city}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>State</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors[`${type}Address`]?.state ? styles.error : ''}`}
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
            {formErrors[`${type}Address`]?.state && (
              <span className={styles.errorMessage}>{formErrors[`${type}Address`]?.state}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Country</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors[`${type}Address`]?.country ? styles.error : ''}`}
              placeholder="Country"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
            />
            {formErrors[`${type}Address`]?.country && (
              <span className={styles.errorMessage}>{formErrors[`${type}Address`]?.country}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Postcode</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors[`${type}Address`]?.postcode ? styles.error : ''}`}
              placeholder="Postcode"
              value={address.postcode}
              onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
            />
            {formErrors[`${type}Address`]?.postcode && (
              <span className={styles.errorMessage}>{formErrors[`${type}Address`]?.postcode}</span>
            )}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Address Type</label>
          <div className={styles.addressTypeButtons}>
            <button
              className={`${styles.typeButton} ${address.type === 'residential' ? styles.active : ''}`}
              onClick={() => setAddress({ ...address, type: 'residential' })}
            >
              Residential
            </button>
            <button
              className={`${styles.typeButton} ${address.type === 'business' ? styles.active : ''}`}
              onClick={() => setAddress({ ...address, type: 'business' })}
            >
              Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex flex-row items-center gap-4">
          <button 
            className={styles.backButton}
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Delivery Details</h1>
        </div>
        <button 
          className={styles.cancelButton}
          onClick={onBack}
        >
          Cancel
        </button>
      </header>

      <main className={styles.main}>
        {/* Delivery Mode */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconContainer}>
              <MapPin size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Delivery Mode</h2>
          </div>
          <div className={styles.deliveryModeButtons}>
            <button
              className={`${styles.modeButton} ${deliveryMode === 'home' ? styles.active : ''}`}
              onClick={() => {
                setDeliveryMode('home');
                setForm(prev => ({
                  ...prev,
                  deliveryAddress: {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    postcode: '',
                    latitude: 0,
                    longitude: 0,
                    placeId: '',
                    type: 'residential'
                  }
                }));
              }}
            >
              Home
            </button>
            <button
              className={`${styles.modeButton} ${deliveryMode === 'park' ? styles.active : ''}`}
              onClick={() => {
                setDeliveryMode('park');
                setForm(prev => ({
                  ...prev,
                  deliveryAddress: DEFAULT_PARK_ADDRESS
                }));
              }}
            >
              Park
            </button>
          </div>
        </div>

        {/* Pickup Address Form */}
        {renderAddressForm(
          'Pickup Address',
          <Truck size={20} />,
          form.pickupAddress,
          (address) => setForm({ ...form, pickupAddress: address }),
          'pickup'
        )}

        {/* Delivery Address Form - Only show for home delivery */}
        {deliveryMode === 'home' && renderAddressForm(
          'Delivery Address',
          <MapPin size={20} />,
          form.deliveryAddress,
          (address) => setForm({ ...form, deliveryAddress: address }),
          'delivery'
        )}

        {/* Show park delivery info when park mode is selected */}
        {deliveryMode === 'park' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconContainer}>
                <MapPin size={20} />
              </div>
              <h2 className={styles.sectionTitle}>Park Delivery Point</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Your package will be delivered to our designated park delivery point. 
                You will be notified when your package arrives and can collect it at your convenience.
              </p>
              <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{DEFAULT_PARK_ADDRESS.street}</p>
                <p className="text-sm text-gray-600">
                  {DEFAULT_PARK_ADDRESS.city}, {DEFAULT_PARK_ADDRESS.state}
                </p>
                <p className="text-sm text-gray-600">
                  {DEFAULT_PARK_ADDRESS.country} {DEFAULT_PARK_ADDRESS.postcode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Receiver Details */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconContainer}>
              <Info size={20} />
            </div>
            <h2 className={styles.sectionTitle}>Receiver Details</h2>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors.receiver?.name ? styles.error : ''}`}
              placeholder="Enter receiver's full name"
              value={form.receiver.name}
              onChange={(e) => setForm({ ...form, receiver: { ...form.receiver, name: e.target.value } })}
            />
            {formErrors.receiver?.name && (
              <span className={styles.errorMessage}>{formErrors.receiver?.name}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter receiver's email address"
              value={form.receiver.email}
              onChange={(e) => setForm({ ...form, receiver: { ...form.receiver, email: e.target.value } })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.phoneInput}>
              <button
                className={styles.countryCodeButton}
                onClick={() => setShowCountryModal(true)}
              >
                <span className={styles.flag}>
                  {countryCodes.find(c => c.dial_code === form.receiver.countryCode)?.flag}
                </span>
                <span className={styles.dialCode}>{form.receiver.countryCode}</span>
                <ChevronDown size={16} />
              </button>
              <input
                type="tel"
                className={`${styles.phoneNumberInput} ${formErrors.receiver?.phone ? styles.error : ''}`}
                placeholder="Enter phone number"
                value={form.receiver.phone}
                onChange={(e) => setForm({ ...form, receiver: { ...form.receiver, phone: e.target.value } })}
              />
            </div>
            {formErrors.receiver?.phone && (
              <span className={styles.errorMessage}>{formErrors.receiver?.phone}</span>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className={styles.infoNote}>
          <Info size={20} />
          <div>
            <h3>Important Note</h3>
            <p>
              Please ensure all address details are accurate. The driver will contact the receiver before delivery.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <button
          className={`${styles.continueButton} ${!isValidForm() || isLoading ? styles.disabled : ''}`}
          onClick={handleSubmit}
          disabled={!isValidForm() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={20} className={styles.spinner} />
              Saving...
            </>
          ) : (
            <div className="flex flex-row items-center gap-2">
              Continue
              <ArrowRight size={20} />
            </div>
          )}
        </button>
      </footer>

      {/* Country Code Modal */}
      {showCountryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Select Country</h2>
              <button onClick={() => setShowCountryModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search countries"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className={styles.countryList}>
                {countryCodes
                  .filter(country => 
                    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    country.dial_code.includes(searchQuery)
                  )
                  .map(country => (
                    <button
                      key={country.code}
                      className={`${styles.countryItem} ${form.receiver.countryCode === country.dial_code ? styles.selected : ''}`}
                      onClick={() => {
                        setForm({ ...form, receiver: { ...form.receiver, countryCode: country.dial_code } });
                        setShowCountryModal(false);
                      }}
                    >
                      <span className={styles.flag}>{country.flag}</span>
                      <div className={styles.countryInfo}>
                        <span className={styles.countryName}>{country.name}</span>
                        <span className={styles.dialCode}>{country.dial_code}</span>
                      </div>
                      {form.receiver.countryCode === country.dial_code && (
                        <div className={styles.checkIcon}>
                          <Check size={20} />
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 