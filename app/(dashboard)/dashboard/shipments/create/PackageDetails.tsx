"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Truck, Box, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import styles from './PackageDetails.module.css';
import { useRouter } from 'next/navigation';
import { createShipment } from '@/lib/shipment';

const PACKAGE_TYPES = [
  { 
    id: 'document', 
    label: 'Document', 
    icon: FileText,
    description: 'Letters, papers, contracts',
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
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
  initialData?: any;
}

export default function PackageDetails({ onNext, onBack, onUpdate, initialData }: PackageDetailsProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    packageType: initialData?.packageType || '',
    description: initialData?.description || '',
    isFragile: initialData?.isFragile || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.packageType) {
      newErrors.packageType = 'Please select a package type';
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
    setFormData(prev => ({ ...prev, packageType: type }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.packageType;
      return newErrors;
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.description;
      return newErrors;
    });
  };

  const handleFragileToggle = (value: boolean) => {
    setFormData(prev => ({ ...prev, isFragile: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const serviceType = localStorage.getItem('selectedService');
      try {
        setIsLoading(true);
        setErrors({});
        
        const dataBody = {
          serviceType: serviceType,
          packageType: formData.packageType,
          packageDescription: formData.description,
          fragile: formData.isFragile.toString()
        };

        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/');
          return;
        }

        const response = await createShipment(dataBody, token);

        if (response.success) {
          localStorage.setItem('packageInfo', JSON.stringify(response.data));
          localStorage.setItem('currentStep', '2');
          onNext();
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
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerContent}>
          <h1>Package Information</h1>
          <p>Select your package type and provide details</p>
        </div>
      </header>

      {errors.general && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{errors.general}</span>
        </div>
      )}

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2>Package Type</h2>
            <div className={styles.typeGrid}>
              {PACKAGE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={`${styles.typeCard} ${formData.packageType === type.id ? styles.selected : ''}`}
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
            {errors.packageType && <span className={styles.error}>{errors.packageType}</span>}
          </div>

          <div className={styles.section}>
            <h2>Package Description</h2>
            <div className={styles.inputGroup}>
              <label>What are you sending?</label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Enter details about your package"
                className={`${styles.textarea} text-black ${errors.description ? styles.error : ''}`}
                rows={3}
              />
              {errors.description && <span className={styles.error}>{errors.description}</span>}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Fragile Package</h2>
            <div className={styles.fragileOptions}>
              <button
                type="button"
                className={`${styles.fragileButton} ${!formData.isFragile ? styles.selected : ''}`}
                onClick={() => handleFragileToggle(false)}
              >
                No
              </button>
              <button
                type="button"
                className={`${styles.fragileButton} ${formData.isFragile ? styles.selected : ''}`}
                onClick={() => handleFragileToggle(true)}
              >
                Yes
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="submit"
              className={styles.submitButton}
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
        </form>
      </main>
    </div>
  );
}