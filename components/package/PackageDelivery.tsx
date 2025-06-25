'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, Info, X, ChevronDown, ArrowRight, Loader, Check, ArrowLeft, AlertTriangle } from 'lucide-react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import styles from './PackageDelivery.module.css';
import { updateDeliveryAddress } from '@/lib/shipments';
import { getAllAddresses } from '@/lib/api';
import { validatePhoneNumber } from '@/lib/validatePhone';
import { CountryCode } from 'libphonenumber-js';

interface CountryCodes {
  code: string;
  name: string;
  flag: string;
  dial_code: string;
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

interface AddressFormProps {
  title: string;
  icon: React.ReactNode;
  address: Address;
  setAddress: (address: Address) => void;
  type: 'pickup' | 'delivery';
  formErrors?: Partial<DeliveryForm>;
  setMapLoaded?: (loaded: boolean) => void;
  setPickupAutocomplete?: (autocomplete: google.maps.places.Autocomplete | null) => void;
  setDeliveryAutocomplete?: (autocomplete: google.maps.places.Autocomplete | null) => void;
  handlePlaceSelect?: (type: 'pickup' | 'delivery') => void;
}

const countryCodes: CountryCodes[] = [
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial_code: '+44' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dial_code: '+234' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dial_code: '+220' },
];

// Move this outside of PackageDelivery component
const AddressForm: React.FC<AddressFormProps> = ({
  title,
  icon,
  address,
  setAddress,
  type,
  formErrors,
  setMapLoaded,
  setPickupAutocomplete,
  setDeliveryAutocomplete,
  handlePlaceSelect
}) => {
  return (
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
          <div className="relative items-center">
            <div className="relative w-6 inset-y-0 left-0 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <Autocomplete
              onLoad={(autocomplete: google.maps.places.Autocomplete) => {
                if (type === 'pickup') {
                  setPickupAutocomplete?.(autocomplete);
                } else {
                  setDeliveryAutocomplete?.(autocomplete);
                }
              }}
              onPlaceChanged={() => handlePlaceSelect?.(type)}
            >
              <input
                type="text"
                className={`${styles.input} ${formErrors?.[`${type}Address`]?.street ? styles.error : ''}`}
                placeholder="Enter street address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
            </Autocomplete>
          </div>
          {formErrors?.[`${type}Address`]?.street && (
            <span className={styles.errorMessage}>{formErrors?.[`${type}Address`]?.street}</span>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>City</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors?.[`${type}Address`]?.city ? styles.error : ''}`}
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            {formErrors?.[`${type}Address`]?.city && (
              <span className={styles.errorMessage}>{formErrors?.[`${type}Address`]?.city}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>State</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors?.[`${type}Address`]?.state ? styles.error : ''}`}
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
            {formErrors?.[`${type}Address`]?.state && (
              <span className={styles.errorMessage}>{formErrors?.[`${type}Address`]?.state}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Country</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors?.[`${type}Address`]?.country ? styles.error : ''}`}
              placeholder="Country"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
            />
            {formErrors?.[`${type}Address`]?.country && (
              <span className={styles.errorMessage}>{formErrors?.[`${type}Address`]?.country}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Postcode</label>
            <input
              type="text"
              className={`${styles.input} ${formErrors?.[`${type}Address`]?.postcode ? styles.error : ''}`}
              placeholder="Postcode"
              value={address.postcode}
              onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
            />
            {formErrors?.[`${type}Address`]?.postcode && (
              <span className={styles.errorMessage}>{formErrors?.[`${type}Address`]?.postcode}</span>
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
};

export default function PackageDelivery({ handleNextStep, handlePreviousStep }: { handleNextStep: () => void, handlePreviousStep: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [deliveryAutocomplete, setDeliveryAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'park'>('home');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<DeliveryForm>>({});
  const [allDresses, setAllAddresses] = useState([])
  const [shipInfo, setShipInfo] = useState<Shipment>();
  const [addressSelected, setAddressSelected] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");

  useEffect(()=>{
    const getAddresses = async () =>{
      const token = localStorage.getItem('token') || '';
      const response = await getAllAddresses(token);
      if(response && response.success){
        setAllAddresses(response.data)
      }
    }

    const accessToken = localStorage.getItem('token');
    const packageInfo = localStorage.getItem('packageInfo');
    
    if (accessToken) {
      setShipInfo(JSON.parse(packageInfo || '{}'));
    }

    getAddresses();
  },[])

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

  const handleValidation = async () =>{
    const phoneNumber = form.receiver.countryCode + form.receiver.phone;
    const validate = await validatePhoneNumber(phoneNumber,selectedCountryCode as CountryCode);

    console.log(validate)
    if(!validate.isValid){
      alert("Invalid Phone Number")
      setForm({
        ...form,
        receiver:{
          ...form.receiver,
          phone: ""
        }
      })
    }else{
      setForm({
        ...form,
        receiver:{
          ...form.receiver,
          phone: validate.formattedNumber || ""
        }
      })
      console.log("formatted.")
    }
  }
  // Default park address
  const defaultParkAddress: Address = {
    street: '1072 Tyburn Road',
    city: 'Birmingham',
    state: 'West Midlands',
    country: 'United Kingdom',
    postcode: 'B24 0SY',
    latitude: 52.5200,
    longitude: -1.8904,
    placeId: 'uk_office_address',
    type: 'business'
  };

  const handleDeliveryModeChange = async (mode: 'home' | 'park') => {
    setDeliveryMode(mode);

    const packageInfo = localStorage.getItem('packageInfo');
    const packageData = packageInfo ? JSON.parse(packageInfo) : {};
    
    if(mode === "home"){
      if(packageData?.serviceType == 'airfreight'){
      alert('Service charge for Pickup costs £20');
      }
      setForm({
        ...form,
        pickupAddress:{
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
      })
    }

    if (mode === 'park') {
      // Set default park address when park mode is selected
      setForm(prev => ({
        ...prev,
        // deliveryAddress: defaultParkAddress,
        deliveryMode: 'park'
      }));
    }
  };

  const handlePlaceSelect = (type: 'pickup' | 'delivery') => {
    const autocomplete = type === 'pickup' ? pickupAutocomplete : deliveryAutocomplete;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      console.log(place)
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
    const phoneRegex = /^[0-9]{4,15}$/;
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
      form.receiver.phone.trim() !== ''
      // phoneRegex.test(form.receiver.phone.trim())
    );
  };

  const handleSubmit = async () => {
    const phoneNumber = form.receiver.countryCode + form.receiver.phone;
    const validate = validatePhoneNumber(phoneNumber, selectedCountryCode as CountryCode);

    if(!validate.isValid){
      alert("Invalid Phone Number")
      setForm({
        ...form,
        receiver:{
          ...form.receiver,
          phone: ""
        }
      })
      return;
    }else{
      setForm({
        ...form,
        receiver:{
          ...form.receiver,
          phone: validate.formattedNumber || ""
        }
      })
      console.log("formatted.")
    }
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
      const token = localStorage.getItem('token');

      const response = await updateDeliveryAddress(packageInfo.id, {
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        receiverName: form.receiver.name,
        receiverEmail: form.receiver.email,
        receiverPhoneNumber: form.receiver.phone,
        deliveryMode: form.deliveryMode,
        deliveryType: deliveryMode === 'park' ? 'park' : 'home'
      }, JSON.parse(token as string));

      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '6')
        handleNextStep();
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

    return (
            <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? 'AIzaSyAZxFKvKwUfo5jMamjurbZzs_9u79UjWno'}
              libraries={["places"]}
      onLoad={() => setMapLoaded(true)}
      
    >
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex flex-row items-center gap-4">
          <button 
            type='button'
            className={styles.backButton}
            onClick={handlePreviousStep}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Delivery Details</h1>
        </div>
        <button 
          className={styles.cancelButton}
            onClick={()=>router.replace("/dashboard/shipments")}
        >
          Cancel
        </button>
      </header>

      <main className={styles.main}>
        {/* Delivery Mode */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <MapPin size={20} />
            <h2 className={styles.sectionTitle}>Delivery Mode</h2>
          </div>
          <div className={styles.deliveryModeButtons}>
            <button
              disabled={disabled}
              type='button'
              className={`${styles.modeButton} ${deliveryMode === 'home' ? styles.active : ''}`}
              onClick={() => handleDeliveryModeChange('home')}
            >
              Pick-up
            </button>
            <button
              type='button'
              className={`${styles.modeButton} ${deliveryMode === 'park' ? styles.active : ''}`}
              onClick={() => {
                handleDeliveryModeChange('park')
              }}
            >
              Drop Off
            </button>
          </div>

          {deliveryMode === 'home' && shipInfo?.serviceType == "airfreight" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                <p className="text-sm text-yellow-800">
                  A service charge of £20 will be applied for pickup service.
                </p>
              </div>
            </div>
          )}
        </div>

        {deliveryMode == 'park' && allDresses.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin size={20} />
              <h2 className={styles.sectionTitle}>Drop-off Addresses</h2>
            </div>
            <div className={styles.addressList}>
              {allDresses.map((address: any, index: number) => (
                <div key={index} className={`${styles.addressItem} ${addressSelected == address.id && styles.pickedAddress}`}>
                  <div className={styles.addressDetails}>
                    <p className={styles.addressStreet}>{address.street}</p>
                    <p className={styles.addressCity}>{address.city}, {address.state}</p>
                    <p className={styles.addressPostcode}>{address.zipCode}</p>
                  </div>
                  <button
                    className={styles.selectAddressButton}
                    type='button'
                    onClick={() => {
                      const updatedAddress = {
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postcode: address.zipCode,
                        latitude: address.latitude,
                        longitude: address.longitude,
                        placeId: address.placeId,
                        type: address.type
                      };
                      
                      setForm(prev => ({
                        ...prev,
                        pickupAddress: updatedAddress
                      }));
                      setAddressSelected(address.id);
                    }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pickup Address Form */}
        {deliveryMode === "home" && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconContainer}>
                  <Truck size={20} />
                </div>
                <h2 className={styles.sectionTitle}>{'Pickup Address'}</h2>
              </div>

              <div className={styles.addressForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Street Address</label>
                  <div className="relative items-center">
                    <div className="relative w-6 inset-y-0 left-0 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Autocomplete
                      onLoad={(autocomplete: google.maps.places.Autocomplete) => {
                        setPickupAutocomplete(autocomplete);
                      }}
                      onPlaceChanged={() => handlePlaceSelect("pickup")}
                    >
                      <input
                        type="text"
                        className={`${styles.input}`}
                        placeholder="Enter street address"
                        value={form.pickupAddress.street}
                        onChange={(e) => setForm({ ...form, pickupAddress:{
                          ...form.pickupAddress,
                          street: e.target.value
                        } })}
                      />
                    </Autocomplete>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>City</label>
                    <input
                      type="text"
                      className={`${styles.input}`}
                      placeholder="City"
                      value={form.pickupAddress.city}
                      onChange={(e) => setForm({ ...form, pickupAddress:{
                        ...form.pickupAddress,
                        city: e.target.value
                      } })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>State</label>
                    <input
                      type="text"
                      className={`${styles.input}`}
                      placeholder="State"
                      value={form.pickupAddress.state}
                      onChange={(e) => setForm({ ...form, pickupAddress:{
                        ...form.pickupAddress,
                        state: e.target.value
                      } })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Country</label>
                    <input
                      type="text"
                      className={`${styles.input} `}
                      placeholder="Country"
                      value={form.pickupAddress.country}
                      onChange={(e) => setForm({ ...form, pickupAddress:{
                        ...form.pickupAddress,
                        country: e.target.value
                      } })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Postcode</label>
                    <input
                      type="text"
                      className={`${styles.input}`}
                      placeholder="Postcode"
                      value={form.pickupAddress.postcode}
                      onChange={(e) => setForm({ ...form, pickupAddress:{
                        ...form.pickupAddress,
                        postcode: e.target.value
                      } })}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Address Type</label>
                  <div className={styles.addressTypeButtons}>
                    <button
                      className={`${styles.typeButton} ${form.pickupAddress.type === 'residential' ? styles.active : ''}`}
                      onClick={() => setForm({ ...form, pickupAddress:{
                        ...form.pickupAddress,
                        type: 'residential'
                      } })}
                    >
                      Residential
                    </button>
                    <button
                      className={`${styles.typeButton} ${form.pickupAddress.type === 'business' ? styles.active : ''}`}
                      onClick={() => setForm({ ...form, pickupAddress:{
                        ...form.pickupAddress,
                        type: 'business'
                      } })}
                    >
                      Business
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delivery Address Form - Only show for home delivery */}
        
            <>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconContainer}>
                    <MapPin size={20} />
                  </div>
                  <h2 className={styles.sectionTitle}>Delivery Address</h2>
                </div>

                <div className={styles.addressForm}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Street Address</label>
                    <div className="relative items-center">
                      <div className="relative w-6 inset-y-0 left-0 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Autocomplete
                        onLoad={(autocomplete: google.maps.places.Autocomplete) => {
                          setDeliveryAutocomplete(autocomplete);
                        }}
                        onPlaceChanged={() => handlePlaceSelect("delivery")}
                      >
                        <input
                          type="text"
                          className={`${styles.input}`}
                          placeholder="Enter street address"
                          value={form.deliveryAddress.street}
                          onChange={(e) => setForm({ ...form, deliveryAddress:{
                            ...form.deliveryAddress,
                            street: e.target.value
                          } })}
                        />
                      </Autocomplete>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>City</label>
                      <input
                        type="text"
                        className={`${styles.input}`}
                        placeholder="City"
                        value={form.deliveryAddress.city}
                        onChange={(e) => setForm({ ...form, deliveryAddress:{
                          ...form.deliveryAddress,
                          city: e.target.value
                        } })}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>State</label>
                      <input
                        type="text"
                        className={`${styles.input}`}
                        placeholder="State"
                        value={form.deliveryAddress.state}
                        onChange={(e) => setForm({ ...form, deliveryAddress:{
                          ...form.deliveryAddress,
                          state: e.target.value
                        } })}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Country</label>
                      <input
                        type="text"
                        className={`${styles.input}`}
                        placeholder="Country"
                        value={form.deliveryAddress.country}
                        onChange={(e) => setForm({ ...form, deliveryAddress:{
                          ...form.deliveryAddress,
                          country: e.target.value
                        } })}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Postcode</label>
                      <input
                        type="text"
                        className={`${styles.input}`}
                        placeholder="Postcode"
                        value={form.deliveryAddress.postcode}
                        onChange={(e) => setForm({ ...form, deliveryAddress:{
                          ...form.deliveryAddress,
                          postcode: e.target.value
                        } })}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Address Type</label>
                    <div className={styles.addressTypeButtons}>
                      <button
                        className={`${styles.typeButton} ${form.deliveryAddress.type === 'residential' ? styles.active : ''}`}
                        onClick={() => setForm({ ...form, deliveryAddress:{
                          ...form.deliveryAddress,
                          type: 'residential'
                        } })}
                      >
                        Residential
                      </button>
                      <button
                        className={`${styles.typeButton} ${form.deliveryAddress.type === 'business' ? styles.active : ''}`}
                        onClick={() => setForm({ ...form, deliveryAddress:{
                          ...form.deliveryAddress,
                          type: 'business'
                        } })}
                      >
                        Business
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
        {/* Receiver Details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Receiver Details</h2>
          
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
                onBlur={handleValidation}
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
                        setSelectedCountryCode(country.code)
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
    </LoadScript>
  );
}
