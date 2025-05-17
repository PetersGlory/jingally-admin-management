
import { bookingApi } from './api';

const generalApi = bookingApi

export const createShipment = async (shippingData: any, token: string) => {
  const response = await generalApi.post('/shipments', shippingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getShipments = async (token: string) => {
  const response = await generalApi.get('/shipments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Package Photo Upload Section
export const uploadPackagePhotos = async (photos: any, token: string) => {
  const response = await generalApi.post('/shipping/upload-photos', photos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


// Delivery Details Section
// import { DeliveryDetails } from '../../types/shipping';

export const updateDeliveryDetails = async (packageId: string, deliveryDetails: any, token: string) => {
  const response = await generalApi.put(`/shipping/${packageId}/delivery`, deliveryDetails, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get Shipping Quote
export const getShippingQuote = async (shippingData: any, token: string) => {
  const response = await generalApi.post('/shipping/quote', shippingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Process Payment
export const processShippingPayment = async (packageId: string, paymentDetails: any, token: string) => {
  const response = await generalApi.post(`/shipping/${packageId}/payment`, paymentDetails, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Track Shipment
export const trackShipment = async (trackingNumber: string, token: string) => {
  const response = await generalApi.get(`/shipping/track/${trackingNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get Shipment Details
export const getShipmentDetails = async (packageId: string, token: string) => {
  const response = await generalApi.get(`/shipments/${packageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update Package Dimensions
export const updatePackageDimensions = async (packageId: string, dimensions: any, token: string) => {
  const response = await generalApi.put(`/shipments/${packageId}/dimensions`, dimensions, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};

// Update Shipment Photos
export const updateShipmentPhotos = async (packageId: string, photos: any, token: string) => {
  const response = await generalApi.put(`/shipments/${packageId}/photos`, photos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update Delivery Address
export const updateDeliveryAddress = async (packageId: string, address: any, token: string) => {
  const response = await generalApi.put(`/shipments/${packageId}/delivery-address`, address, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update Payment Status
export const updatePaymentStatus = async (packageId: string, status: any, token: string) => {
  const response = await generalApi.put(`/shipments/${packageId}/payment`, status, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update Pickup Date/Time
export const updatePickupDateTime = async (packageId: string, dateTime: any, token: string) => {
  const response = await generalApi.put(`/shipments/${packageId}/pickup-time`, dateTime, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Cancel Shipment
export const cancelShipment = async (packageId: string, token: string) => {
  const response = await generalApi.get(`/shipments/${packageId}/cancel`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


// tracking shipment
export const trackingShipment = async (trackingNumber: string, token: string) => {
  const response = await generalApi.get(`/shipments/track/${trackingNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
