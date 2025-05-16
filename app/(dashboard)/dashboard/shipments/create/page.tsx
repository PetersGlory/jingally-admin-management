"use client"

import React, { useState, useEffect } from 'react';
import PackageDimension from './PackageDimension';
import PackagePhoto from './PackagePhoto';
import PackageDelivery from './PackageDelivery';
import styles from './page.module.css';
import PackageService from './PackageService';
import PackageDetails from './PackageDetails';
import PackagePayment from './PackagePayment';
import { createShipment } from '@/lib/shipment';

const STEPS = [
  {
    id: 'service',
    title: 'Service Type',
    component: PackageService,
  },
  {
    id: 'details',
    title: 'Package Details',
    component: PackageDetails,
  },
  {
    id: 'dimensions',
    title: 'Package Dimensions',
    component: PackageDimension,
  },
  {
    id: 'photos',
    title: 'Package Photos',
    component: PackagePhoto,
  },
  {
    id: 'delivery',
    title: 'Delivery Information',
    component: PackageDelivery,
  },
  {
    id: 'payment',
    title: 'Payment',
    component: PackagePayment,
  },
];

export default function CreateShipmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load the current step from localStorage
    const savedStep = localStorage.getItem('shipmentCreationStep');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }

    // Load saved form data
    const savedData = localStorage.getItem('shipmentFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    localStorage.setItem('shipmentCreationStep', nextStep.toString());
  };

  const handlePreviousStep = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    localStorage.setItem('shipmentCreationStep', prevStep.toString());
  };

  const handleUpdateData = (data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    localStorage.setItem('shipmentFormData', JSON.stringify(updatedData));
  };

  const handleComplete = async () => {
    const token = localStorage.getItem("token") || ""
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare the shipment data
      const shipmentData = {
        serviceType: formData.serviceType,
        packageDetails: {
          type: formData.packageType,
          quantity: formData.quantity,
          description: formData.description,
          value: formData.value,
          currency: formData.currency
        },
        dimensions: {
          length: formData.length,
          width: formData.width,
          height: formData.height,
          weight: formData.weight,
          unit: formData.unit,
          weightUnit: formData.weightUnit
        },
        photos: formData.photos,
        delivery: {
          address: formData.deliveryAddress,
          city: formData.deliveryCity,
          state: formData.deliveryState,
          zipCode: formData.deliveryZipCode,
          country: formData.deliveryCountry,
          instructions: formData.deliveryInstructions,
          date: formData.deliveryDate,
          time: formData.deliveryTime
        },
        payment: {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          billingAddress: formData.billingAddress,
          billingCity: formData.billingCity,
          billingState: formData.billingState,
          billingZipCode: formData.billingZipCode,
          billingCountry: formData.billingCountry,
          saveCard: formData.saveCard
        }
      };

      // Create the shipment
      const response = await createShipment(shipmentData, token);
      
      // Clear the saved data
      localStorage.removeItem('shipmentCreationStep');
      localStorage.removeItem('shipmentFormData');
      
      // Redirect to the shipments list page
      window.location.href = '/dashboard/shipments';
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Failed to create shipment. Please try again.');
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`${styles.step} ${
                index === currentStep
                  ? styles.active
                  : index < currentStep
                  ? styles.completed
                  : ''
              }`}
            >
              <div className={styles.stepNumber}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${
                  index < currentStep ? styles.completed : ''
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <CurrentStepComponent
              onNext={handleNextStep}
              onBack={handlePreviousStep}
              onUpdate={handleUpdateData}
              initialData={formData} onSelectType={function (type: string): void {
                  throw new Error('Function not implemented.');
              } } handleNextStep={function (): void {
                  throw new Error('Function not implemented.');
              } }      />
    </div>
  );
}
