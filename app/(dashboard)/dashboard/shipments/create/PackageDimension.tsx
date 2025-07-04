"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Package, Maximize2, Box, AlertCircle, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import styles from './PackageDimension.module.css';
import { useRouter } from 'next/navigation';
import { updatePackageDimensions } from '@/lib/shipment';
import { getPriceGuides } from '@/lib/shipments';

// Constants
const MAX_DIMENSION = 1000;
const MAX_WEIGHT = 40;

interface PackageDimensions {
  weight: string;
  length: string;
  width: string;
  height: string;
}

interface FormErrors {
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  general?: string;
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

interface PriceGuide {
  id: string;
  guideName: string;
  guideNumber: string;
  price: number;
}

const DimensionInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon: React.ReactNode;
  placeholder: string;
  max?: number;
}> = ({ label, value, onChange, error, icon, placeholder, max }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
    const finalValue = numericValue.replace(/(\..*)\./g, '$1');
    onChange(finalValue);
  };

  return (
    <div className={`${styles.inputContainer} ${error ? styles.error : ''} ${isFocused ? styles.focused : ''}`}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <input
          type="number"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface DimensionSet {
  id: number;
  length: string;
  width: string;
  height: string;
  weight: string;
}

interface PackageDimensionProps {
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
  initialData?: any;
}

export default function PackageDimension({ onBack, onNext, onUpdate }: PackageDimensionProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Support for multiple dimension sets
  const [dimensions, setDimensions] = useState<DimensionSet[]>([{
    id: Date.now(),
    length: '',
    width: '',
    height: '',
    weight: ''
  }]);

  // Add missing state
  const [guides, setGuides] = useState<PriceGuide[]>([]);
  const [extraguides, setExtraguides] = useState<PriceGuide[]>([]);
  const [shipInfo, setShipInfo] = useState<Shipment>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);

  // On mount, load from localStorage if available
  useEffect(() => {
    const packageInfo = localStorage.getItem('packageInfo');
    if (packageInfo) {
      try {
        const parsed = JSON.parse(packageInfo);
        if (parsed && parsed.dimensions && typeof parsed.dimensions === 'object') {
          setDimensions([{
            id: Date.now(),
            length: parsed.dimensions.length?.toString() || '',
            width: parsed.dimensions.width?.toString() || '',
            height: parsed.dimensions.height?.toString() || '',
            weight: parsed.weight?.toString() || ''
          }]);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Add useEffect to load shipment info and guides
  useEffect(() => {
    const packageInfo = localStorage.getItem('packageInfo');
    if (packageInfo) {
      setShipInfo(JSON.parse(packageInfo));
    }
    // If you have a getPriceGuides API, fetch guides here
    // Example:
    const token = localStorage.getItem('token');
    if (token) getPricings(token);
  }, []);


  const getPricings = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await getPriceGuides(token);
      if (response) {
        setGuides(response);
      }
    } catch (err) {
      console.error('Error fetching price guides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDimensionChange = (dimensionId: number, field: keyof Omit<DimensionSet, 'id'>, value: string) => {
    setDimensions(prev =>
      prev.map(dim =>
        dim.id === dimensionId
          ? { ...dim, [field]: value }
          : dim
      )
    );
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.general;
      return newErrors;
    });
  };

  const addDimensionSet = () => {
    setDimensions(prev => [
      ...prev,
      {
        id: Date.now(),
        length: '',
        width: '',
        height: '',
        weight: ''
      }
    ]);
  };

  const removeDimensionSet = (id: number) => {
    setDimensions(prev => prev.filter(dim => dim.id !== id));
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    dimensions.forEach((dimension, index) => {
      (['weight', 'length', 'width', 'height'] as const).forEach(field => {
        const value = dimension[field];
        if (!value.trim()) {
          newErrors[field] = `Please enter ${field} for dimension set ${index + 1}`;
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          newErrors[field] = `Please enter a valid ${field} for dimension set ${index + 1}`;
        } else if (field === 'weight' && Number(value) > MAX_WEIGHT) {
          newErrors[field] = `Weight cannot exceed ${MAX_WEIGHT}kg`;
        } else if (field !== 'weight' && Number(value) > MAX_DIMENSION) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${MAX_DIMENSION}cm`;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [dimensions]);

  const calculateVolume = useCallback((): string => {
    // Sum all dimension sets
    let total = 0;
    dimensions.forEach(({ length, width, height }) => {
      if (length && width && height) {
        total += Number(length) * Number(width) * Number(height);
      }
    });
    return total.toFixed(2);
  }, [dimensions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If no guides are selected, validate dimensions
    if (!validateForm() && selectedGuides.length === 0) return;

    const packageInfo = localStorage.getItem('packageInfo');
    const shipment = JSON.parse(packageInfo || '{}');

    try {
      setIsLoading(true);
      setErrors({});

      const packageId = shipment.id;
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/');
        return;
      }

      let response;

      // If user entered dimensions, use those
      if (dimensions[0].weight !== "" && dimensions[0].length !== "") {
        // Calculate total weight
        const totalWeight = dimensions.reduce((sum, dim) => sum + (parseFloat(dim.weight) || 0), 0);

        if (totalWeight > MAX_WEIGHT && shipment.serviceType !== 'airfreight') {
          setErrors(prev => ({ ...prev, weight: `Total weight cannot exceed ${MAX_WEIGHT}kg` }));
          return;
        }

        response = await updatePackageDimensions(
          packageId,
          {
            priceGuides: dimensions,
          },
          token
        );
      } else {
        // Use selected price guides
        const selectedPriceGuides = selectedGuides.map(guideId => {
          const guide = guides.find(g => g.id === guideId);
          if (!guide) return null;
          return {
            id: guide.id,
            guideName: guide.guideName,
            price: guide.price,
            guideNumber: guide.guideNumber
          };
        }).filter(Boolean);

        response = await updatePackageDimensions(
          packageId,
          {
            priceGuides: selectedPriceGuides,
          },
          token
        );
      }

      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '3');
        onNext();
      } else {
        throw new Error(response.message || 'Failed to update package dimensions');
      }
    } catch (error: any) {
      console.error('Error updating package dimensions:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'An error occurred while updating package dimensions'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Add toggleGuideSelection handler
  const toggleGuideSelection = (guideId: string) => {
    setSelectedGuides(prev =>
      prev.includes(guideId)
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button
            className={styles.backButton}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.headerText}>
            <h1>Package Dimensions</h1>
            <p>Enter the dimensions and weight of your package</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorAlert}>
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          {shipInfo?.serviceType === "seafreight" && shipInfo.packageType == "items" ? (
            <div className={styles.priceGuideSection}>
              <h3 className={styles.sectionTitle}>Item Selection</h3>
              <div className={styles.filterSection}>
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="Search price guides..."
                    className={styles.searchInput}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className={styles.priceGuideList}>
                <div className={styles.addNewItem}>
                  <button 
                    className={styles.addButton}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      const itemName = prompt('Enter item name:');
                      if (itemName) {
                        const newGuide: PriceGuide = {
                          id: 'custom-extraguide-'+Date.now().toString(),
                          guideName: itemName,
                          guideNumber: `CUSTOM-${Date.now()}`,
                          price: 0
                        };
                        setExtraguides(prev => [...prev, newGuide]);
                      }
                    }}
                  >
                    <Plus size={20} />
                    Add New Item
                  </button>
                </div>

                
                <div className={styles.extraItemsSection}>
                  <h4 className={styles.extraItemsTitle}>Extra Items Added</h4>
                  {extraguides.map((guide: PriceGuide) => (
                    <div 
                      key={guide.id} 
                      className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        toggleGuideSelection(guide.id);
                      }}
                    >
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedGuides.includes(guide.id)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.stopPropagation();
                            toggleGuideSelection(guide.id);
                          }}
                        />
                      </div>
                      <div className={styles.guideInfo}>
                        <h4>{guide.guideName}</h4>
                        <p>{guide.guideNumber}</p>
                        <span className={styles.price}>${guide.price}</span>
                      </div>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            const currentCount = selectedGuides.filter(id => id === guide.id).length;
                            if (currentCount > 0) {
                              const index = selectedGuides.indexOf(guide.id);
                              const newSelectedGuides = [...selectedGuides];
                              newSelectedGuides.splice(index, 1);
                              setSelectedGuides(newSelectedGuides);
                            }
                          }}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>
                          {selectedGuides.filter(id => id === guide.id).length}
                        </span>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            toggleGuideSelection(guide.id);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                
                <h4 className={styles.extraItemsTitle}>Item List</h4>

                {guides
                  .filter((guide: PriceGuide) => 
                    guide.guideName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((guide: PriceGuide) => (
                    <div 
                      key={guide.id} 
                      className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        toggleGuideSelection(guide.id);
                      }}
                    >
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedGuides.includes(guide.id)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.stopPropagation();
                            toggleGuideSelection(guide.id);
                          }}
                        />
                      </div>
                      <div className={styles.guideInfo}>
                        <h4>{guide.guideName}</h4>
                        <p>{guide.guideNumber}</p>
                        <span className={styles.price}>£{guide.price}</span>
                      </div>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            const currentCount = selectedGuides.filter(id => id === guide.id).length;
                            if (currentCount > 0) {
                              const index = selectedGuides.indexOf(guide.id);
                              const newSelectedGuides = [...selectedGuides];
                              newSelectedGuides.splice(index, 1);
                              setSelectedGuides(newSelectedGuides);
                            }
                          }}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>
                          {selectedGuides.filter(id => id === guide.id).length}
                        </span>
                        <button 
                          className={styles.quantityButton}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            toggleGuideSelection(guide.id);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ): shipInfo?.serviceType === "airfreight" ? (
            <>
              <div className={styles.priceGuideSection}>
                <h3 className={styles.sectionTitle}>Add Item</h3>
                
                <div className={styles.priceGuideList}>
                  <div className={styles.addNewItem}>
                    <button 
                      className={styles.addButton}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                          <div class="bg-white rounded-lg w-full max-w-md p-6">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4">Add New Item</h3>
                            <div class="mb-4">
                              <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                              <input type="text" id="itemName" placeholder="Enter item name" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div class="mb-4">
                              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea id="itemDescription" placeholder="Enter item description"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <div class="flex justify-end gap-3">
                              <button class="cancleButton px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                              <button class="confirmButton px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Item</button>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);

                        const closeModal = () => {
                          document.body.removeChild(modal);
                        };

                        const cancelButton = modal.querySelector(`.cancleButton`);
                        const confirmButton = modal.querySelector(`.confirmButton`);
                        const itemNameInput = modal.querySelector('#itemName') as HTMLInputElement;
                        const itemDescriptionInput = modal.querySelector('#itemDescription') as HTMLTextAreaElement;

                        cancelButton?.addEventListener('click', closeModal);
                        confirmButton?.addEventListener('click', () => {
                          const itemName = itemNameInput.value.trim();
                          const description = itemDescriptionInput.value.trim();
                          
                          if (itemName) {
                            const newGuide: PriceGuide = {
                              id: 'custom-extraguide-'+Date.now().toString(),
                              guideName: itemName,
                              guideNumber: description || `CUSTOM-${Date.now()}`,
                              price: 0
                            };
                            setExtraguides(prev => [...prev, newGuide]);
                            toggleGuideSelection(newGuide.id)
                            closeModal();
                          }
                        });
                      }}
                    >
                      <Plus size={20} />
                      Add New Item
                    </button>
                  </div>

                  
                  <div className={styles.extraItemsSection}>
                    <h4 className={styles.extraItemsTitle}>Added Items</h4>
                    {extraguides.map((guide: PriceGuide) => (
                      <div 
                        key={guide.id} 
                        className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          toggleGuideSelection(guide.id);
                        }}
                      >
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedGuides.includes(guide.id)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              toggleGuideSelection(guide.id);
                            }}
                          />
                        </div>
                        <div className={styles.guideInfo}>
                          <h4>{guide.guideName}</h4>
                          <p>{guide.guideNumber}</p>
                          <span className={styles.price}>£{guide.price}</span>
                        </div>
                        <div className={styles.quantityControls}>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              const currentCount = selectedGuides.filter(id => id === guide.id).length;
                              if (currentCount > 0) {
                                const index = selectedGuides.indexOf(guide.id);
                                const newSelectedGuides = [...selectedGuides];
                                newSelectedGuides.splice(index, 1);
                                setSelectedGuides(newSelectedGuides);
                              }
                            }}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>
                            {selectedGuides.filter(id => id === guide.id).length}
                          </span>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              toggleGuideSelection(guide.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ): shipInfo?.packageType === "container" ? (
            <>
              <div className={styles.priceGuideSection}>
                <h3 className={styles.sectionTitle}>Select Container Type</h3>
                
                <div className={styles.priceGuideList}>
                  <div className={styles.addNewItem}>
                    <select 
                      className={styles.containerSelect}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const selectedOption = e.target.value;
                        if (selectedOption) {
                          const [size, type] = selectedOption.split('-');
                          const isHighCube = type === 'highcube';
                          const newGuide: PriceGuide = {
                            id: 'container-' + Date.now().toString(),
                            guideName: `${size} Container${isHighCube ? ' (High Cube)' : ''}`,
                            guideNumber: `${size}${isHighCube ? '-HC' : ''}-${Math.floor(Math.random() * 1000)}`,
                            price: 0
                          };
                          setExtraguides(prev => [...prev, newGuide]);
                          e.target.value = ''; // Reset select after adding
                          toggleGuideSelection(newGuide.id)
                        }
                      }}
                    >
                      <option value="">Select a container type</option>
                      <option value="20ft-standard">20ft Container</option>
                      <option value="40ft-standard">40ft Container</option>
                      <option value="40ft-highcube">40ft High Cube Container</option>
                      <option value="45ft-highcube">45ft High Cube Container</option>
                    </select>
                  </div>

                  <div className={styles.extraItemsSection}>
                    <h4 className={styles.extraItemsTitle}>Selected Containers</h4>
                    {extraguides.map((guide: PriceGuide) => (
                      <div 
                        key={guide.id} 
                        className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          toggleGuideSelection(guide.id);
                        }}
                      >
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedGuides.includes(guide.id)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              toggleGuideSelection(guide.id);
                            }}
                          />
                        </div>
                        <div className={styles.guideInfo}>
                          <h4>{guide.guideName}</h4>
                          <p>{guide.guideNumber}</p>
                          <span className={styles.price}>${guide.price}</span>
                        </div>
                        <div className={styles.quantityControls}>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              const currentCount = selectedGuides.filter(id => id === guide.id).length;
                              if (currentCount > 0) {
                                const index = selectedGuides.indexOf(guide.id);
                                const newSelectedGuides = [...selectedGuides];
                                newSelectedGuides.splice(index, 1);
                                setSelectedGuides(newSelectedGuides);
                              }
                            }}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>
                            {selectedGuides.filter(id => id === guide.id).length}
                          </span>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              toggleGuideSelection(guide.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : shipInfo?.serviceType === "seafreight" && shipInfo.packageType == "pallet" ?(
            <>
              <div className={styles.priceGuideSection}>
                <h3 className={styles.sectionTitle}>Add Pallet Items</h3>
                
                <div className={styles.priceGuideList}>
                  <div className={styles.addNewItem}>
                    <button 
                      className={styles.addButton}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                        modal.innerHTML = `
                          <div class="bg-white rounded-lg w-full max-w-md p-6">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4">Add New Pallet</h3>
                            <div class="mb-4">
                              <label class="block text-sm font-medium text-gray-700 mb-1">Pallet Name</label>
                              <input type="text" id="itemName" placeholder="Enter item name" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div class="mb-4">
                              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea id="itemDescription" placeholder="Enter pallet description"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <div class="flex justify-end gap-3">
                              <button class="cancleButton px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                              <button class="confirmButton px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Item</button>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);

                        const closeModal = () => {
                          document.body.removeChild(modal);
                        };

                        const cancelButton = modal.querySelector(`.cancleButton`);
                        const confirmButton = modal.querySelector(`.confirmButton`);
                        const itemNameInput = modal.querySelector('#itemName') as HTMLInputElement;
                        const itemDescriptionInput = modal.querySelector('#itemDescription') as HTMLTextAreaElement;

                        cancelButton?.addEventListener('click', closeModal);
                        confirmButton?.addEventListener('click', () => {
                          const itemName = itemNameInput.value.trim();
                          const description = itemDescriptionInput.value.trim();
                          
                          if (itemName) {
                            const newGuide: PriceGuide = {
                              id: 'custom-extraguide-'+Date.now().toString(),
                              guideName: itemName,
                              guideNumber: description || `CUSTOM-${Date.now()}`,
                              price: 0
                            };
                            setExtraguides(prev => [...prev, newGuide]);
                            toggleGuideSelection(newGuide.id)
                            closeModal();
                          }
                        });
                      }}
                    >
                      <Plus size={20} />
                      Add New Item
                    </button>
                  </div>

                  
                  <div className={styles.extraItemsSection}>
                    <h4 className={styles.extraItemsTitle}>Added Items</h4>
                    {extraguides.map((guide: PriceGuide) => (
                      <div 
                        key={guide.id} 
                        className={`${styles.priceGuideItem} ${selectedGuides.includes(guide.id) ? styles.selected : ''} gap-3`}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          toggleGuideSelection(guide.id);
                        }}
                      >
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedGuides.includes(guide.id)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              toggleGuideSelection(guide.id);
                            }}
                          />
                        </div>
                        <div className={styles.guideInfo}>
                          <h4>{guide.guideName}</h4>
                          <p>{guide.guideNumber}</p>
                          <span className={styles.price}>£{guide.price}</span>
                        </div>
                        <div className={styles.quantityControls}>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              const currentCount = selectedGuides.filter(id => id === guide.id).length;
                              if (currentCount > 0) {
                                const index = selectedGuides.indexOf(guide.id);
                                const newSelectedGuides = [...selectedGuides];
                                newSelectedGuides.splice(index, 1);
                                setSelectedGuides(newSelectedGuides);
                              }
                            }}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>
                            {selectedGuides.filter(id => id === guide.id).length}
                          </span>
                          <button 
                            className={styles.quantityButton}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              toggleGuideSelection(guide.id);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) :(
            <>
          <div className={styles.section}>
            <div className="flex justify-between items-center mb-4">
              <h2>Dimensions (cm)</h2>
              <button
                type="button"
                onClick={addDimensionSet}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={20} className="mr-2" />
                Add Dimension
              </button>
            </div>
            {dimensions.map((dimension, index) => (
              <div key={dimension.id} className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-700">Dimension Set {index + 1}</h4>
                  {dimensions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        removeDimensionSet(dimension.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <DimensionInput
                    label="Weight (kg)"
                    value={dimension.weight}
                    onChange={(value) => handleDimensionChange(dimension.id, 'weight', value)}
                    error={errors.weight}
                    icon={<Package size={20} />}
                    max={MAX_WEIGHT}
                    placeholder="Enter weight"
                  />
                  <DimensionInput
                    label="Length"
                    value={dimension.length}
                    onChange={(value) => handleDimensionChange(dimension.id, 'length', value)}
                    error={errors.length}
                    icon={<Maximize2 size={20} />}
                    placeholder="Enter length"
                  />
                  <DimensionInput
                    label="Width"
                    value={dimension.width}
                    onChange={(value) => handleDimensionChange(dimension.id, 'width', value)}
                    error={errors.width}
                    icon={<Maximize2 size={20} />}
                    placeholder="Enter width"
                  />
                  <DimensionInput
                    label="Height"
                    value={dimension.height}
                    onChange={(value) => handleDimensionChange(dimension.id, 'height', value)}
                    error={errors.height}
                    icon={<Maximize2 size={20} />}
                    placeholder="Enter height"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.volumeSection}>
            <div className={styles.volumeHeader}>
              <div className={styles.volumeIcon}>
                <Box size={20} />
              </div>
              <h3>Total Volume</h3>
            </div>
            <p className={styles.volumeValue}>
              {calculateVolume()} cm³
            </p>
            <p className={styles.volumeSubtitle}>
              Calculated based on length × width × height
            </p>
          </div>

          </>
          )}

          <div className={styles.footer}>
            <button
              type="submit"
              className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className={styles.buttonContent}>
                  Continue
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}