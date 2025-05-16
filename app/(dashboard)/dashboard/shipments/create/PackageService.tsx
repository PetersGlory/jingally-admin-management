"use client"

import React, { useState } from 'react';
import { Package, Send, Anchor, ChevronRight, HelpCircle } from 'lucide-react';
import styles from './PackageService.module.css';

// Types
interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  image: string;
}

// Services Data
const SERVICES: Service[] = [
  // {
  //   id: 'parcel',
  //   title: 'Parcel',
  //   description: 'Send packages up to 30kg',
  //   icon: <Package />,
  //   color: '#FFB156',
  //   image: '/images/shipping-icons/parcel.png',
  // },
  {
    id: 'airfreight',
    title: 'Air Freight',
    description: 'Fast international shipping',
    icon: <Send />,
    color: '#56D4C1',
    image: '/images/shipping-icons/flight.png',
  },
  {
    id: 'seafreight',
    title: 'Sea Freight',
    description: 'Cost-effective bulk shipping',
    icon: <Anchor />,
    color: '#0a3b6e',
    image: '/images/shipping-icons/shipping.png',
  }
];

// Component: ServiceCard
const ServiceCard: React.FC<{ 
  service: Service; 
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ service, isSelected, onSelect }) => {
  return (
    <div 
      className={`${styles.cardContainer} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(service.id)}
      style={{
        borderColor: isSelected ? service.color : '#e5e7eb',
        borderWidth: isSelected ? '2px' : '1px',
      }}
    >
      <div className={styles.cardContent}>
        <div 
          className={styles.iconContainer}
          style={{ backgroundColor: `${service.color}20` }}
        >
          {service.icon}
        </div>

        <div className={styles.textContainer}>
          <h3 className={styles.title}>{service.title}</h3>
          <p className={styles.description}>{service.description}</p>
        </div>

        <div 
          className={styles.arrowButton}
          style={{ backgroundColor: service.color }}
        >
          <ChevronRight />
        </div>
      </div>
    </div>
  );
};

interface PackageServiceProps {
  onNext: () => void;
  onSelectType: (type: string) => void;
  handleNextStep: () => void;
}

export default function PackageService({ onNext,onSelectType, handleNextStep }: PackageServiceProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    onSelectType(serviceId);
  };

  const handleContinue = () => {
    try {
      if (!selectedService) {
        alert('Please select a shipping service');
        return;
      }

      localStorage.setItem('selectedService', selectedService);

      onNext();
    } catch (error) {
      console.error('Error in handleContinue:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Send Package</h1>
        <button 
          className={styles.helpButton}
          onClick={() => {/* TODO: Add help action */}}
        >
          <HelpCircle />
        </button>
      </header>
      
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <h2 className={styles.heading}>
            What would you like to send?
          </h2>
          <p className={styles.subheading}>
            Choose a shipping service that best fits your needs
          </p>

          <div className={styles.servicesGrid}>
            {SERVICES.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service}
                isSelected={selectedService === service.id}
                onSelect={handleServiceSelect}
              />
            ))}
          </div>
        </div>
      </main>

      {selectedService && (
        <footer className={styles.footer}>
          <button
            className={styles.continueButton}
            onClick={handleContinue}
          >
            Continue
            <ChevronRight />
          </button>
        </footer>
      )}
    </div>
  );
} 