"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, Box, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import styles from './PackageDetails.module.css';
import { updateShipment } from '@/lib/shipments';

interface PackageDetails {
  type: string;
  description: string;
  isFragile: boolean;
}

interface FormErrors {
  type?: string;
  description?: string;
  general?: string;
}

const PACKAGE_TYPES = [
  { 
    id: 'items', 
    label: 'Item', 
    icon: FileText,
    description: 'Jingally Price guides',
    color: '#FFB156'
  },
  { 
    id: 'parcel', 
    label: 'Parcel', 
    icon: Package,
    description: 'Small to medium packages',
    color: '#56D4C1'
  },
  { 
    id: 'pallet', 
    label: 'Pallet', 
    icon: Box,
    description: 'Large items on pallets',
    color: '#0a3b6e'
  },
  { 
    id: 'container', 
    label: 'Container', 
    icon: Truck,
    description: 'Full container loads',
    color: '#4C51BF'
  },
] as const;

interface PackageDetailsProps {
  selectedType?: string;
  serviceType: string;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
}

export default function PackageDetails({ selectedType, serviceType, handleNextStep, handlePreviousStep }: PackageDetailsProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PackageDetails>({
    type: selectedType || '',
    description: serviceType === 'airfreight' ? 'this is airfrieght and its N/A' :'',
    isFragile: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.type) {
      newErrors.type = 'Please select a package type';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    setErrors(prev => ({ ...prev, type: undefined }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
    setErrors(prev => ({ ...prev, description: undefined }));
  };

  const handleFragileToggle = (value: boolean) => {
    setFormData(prev => ({ ...prev, isFragile: value }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});
      const dataBody={
        serviceType: serviceType,
        packageType: formData.type,
        packageDescription: formData.description,
        fragile: formData.isFragile.toString()
      }

      const token = localStorage.getItem('token');
      const packageInfo = localStorage.getItem('packageInfo');
      if (!token) {
        router.replace('/');
        return;
      }

      const response = await updateShipment(dataBody, token,JSON.parse(packageInfo || "{}").id);

      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '3')
        handleNextStep();
      } else {
        throw new Error(response.message || 'Failed to create shipment');
      }
    } catch (error: any) {
      console.error('Error saving package details:', error);
      setErrors({ 
        general: error.message || 'Failed to save package details. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-full bg-white'>
      <div className='flex flex-row items-center justify-start gap-4 px-4'>
        <button onClick={handlePreviousStep}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.header}>
          <h1>Package Information</h1>
          <p>Select your package type and provide details</p>
        </div>
      </div>

      {errors.general && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{errors.general}</span>
        </div>
      )}

      <div className={styles.section}>
        <h2>Package Type</h2>
        <div className={styles.typeGrid}>
          {PACKAGE_TYPES.map((type) => {
            // Skip items package type if service type is airfreight
            if (serviceType === 'airfreight' && type.id !== 'parcel') {
              return null;
            }

            if (serviceType === 'seafreight' && type.id === 'parcel') {
              return null;
            }
            
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                className={`${styles.typeCard} ${formData.type === type.id ? styles.selected : ''}`}
                onClick={() => handleTypeSelect(type.id)}
                style={{ '--type-color': type.color } as React.CSSProperties}
              >
                <div className={styles.iconContainer}>
                  <Icon size={24} />
                </div>
                <div className={styles.typeInfo}>
                  <h3>{type.label}</h3>
                  <p>{type.description}</p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.type && <span className={styles.error}>{errors.type}</span>}
      </div>

      {serviceType !== 'airfreight' && (

      <div className={styles.section}>
        <h2>Package Description</h2>
        <div className={styles.inputGroup}>
          <label>What are you sending?</label>
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter details about your package"
            className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
            rows={3}
          />
          {errors.description && <span className={styles.error}>{errors.description}</span>}
        </div>
      </div>
      )}

      <div className={styles.section}>
        <h2>Fragile Package</h2>
        <div className={styles.fragileOptions}>
          <button
            className={`${styles.fragileButton} ${!formData.isFragile ? styles.selected : ''}`}
            onClick={() => handleFragileToggle(false)}
          >
            No
          </button>
          <button
            className={`${styles.fragileButton} ${formData.isFragile ? styles.selected : ''}`}
            onClick={() => handleFragileToggle(true)}
          >
            Yes
          </button>
        </div>
      </div>

      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Processing...</span>
          </div>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  );
}
