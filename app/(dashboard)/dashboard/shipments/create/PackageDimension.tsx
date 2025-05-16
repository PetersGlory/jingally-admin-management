"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Package, Maximize2, Box, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './PackageDimension.module.css';
import { useRouter } from 'next/navigation';
import { updatePackageDimensions } from '@/lib/shipment';

// Constants
const MAX_DIMENSION = 1000;

// Types
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

// Component: DimensionInput
const DimensionInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon: React.ReactNode;
  placeholder: string;
}> = ({ label, value, onChange, error, icon, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
    const finalValue = numericValue.replace(/(\..*)\./g, '$1');
    if(label === "Weight"){
      if (parseFloat(numericValue) > 40) {
        alert('Weight cannot exceed 40kg');
        return;
      }
    }
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

interface PackageDimensionProps {
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
  initialData?: any;
}

export default function PackageDimension({ onNext, onBack, onUpdate, initialData }: PackageDimensionProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PackageDimensions>({
    weight: initialData?.weight || '',
    length: initialData?.length || '',
    width: initialData?.width || '',
    height: initialData?.height || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const numericFields = ['weight', 'length', 'width', 'height'] as const;
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (!value.trim()) {
        newErrors[field] = `Please enter package ${field}`;
      } else if (isNaN(Number(value)) || Number(value) <= 0) {
        newErrors[field] = `Please enter a valid ${field}`;
      } else if (Number(value) > MAX_DIMENSION) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${MAX_DIMENSION}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: keyof PackageDimensions, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.general;
      return newErrors;
    });
  };

  const calculateVolume = useCallback((): string => {
    const { length, width, height } = formData;
    if (length && width && height) {
      const volume = Number(length) * Number(width) * Number(height);
      return volume.toFixed(2);
    }
    return '0.00';
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});

      const packageInfo = localStorage.getItem('packageInfo');
      const packageId = JSON.parse(packageInfo || '{}').id;
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/');
        return;
      }

      // Update dimensions in the backend
      const response = await updatePackageDimensions(
        packageId,
        {
          weight: parseFloat(formData.weight.toString()),
          dimensions: {
            length: parseFloat(formData.length.toString()),
            width: parseFloat(formData.width.toString()),
            height: parseFloat(formData.height.toString()),
          }
        },
        token
      );
      
      if(response.success) {
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            className={styles.backButton}
            onClick={onBack}
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

          <div className={styles.section}>
            <h2>Weight</h2>
            <DimensionInput
              label="Weight (kg)"
              value={formData.weight}
              onChange={(value) => handleInputChange('weight', value)}
              error={errors.weight}
              icon={<Package size={20} />}
              placeholder="Enter weight in kilograms"
            />
          </div>

          <div className={styles.section}>
            <h2>Dimensions (cm)</h2>
            <div className={styles.dimensionsGrid}>
              <DimensionInput
                label="Length"
                value={formData.length}
                onChange={(value) => handleInputChange('length', value)}
                error={errors.length}
                icon={<Maximize2 size={20} />}
                placeholder="Enter length"
              />

              <DimensionInput
                label="Width"
                value={formData.width}
                onChange={(value) => handleInputChange('width', value)}
                error={errors.width}
                icon={<Maximize2 size={20} />}
                placeholder="Enter width"
              />

              <DimensionInput
                label="Height"
                value={formData.height}
                onChange={(value) => handleInputChange('height', value)}
                error={errors.height}
                icon={<Maximize2 size={20} />}
                placeholder="Enter height"
              />
            </div>
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

          <div className={styles.footer}>
            <button
              type="submit"
              className={styles.submitButton}
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