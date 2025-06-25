
import axios from 'axios';

const generalApi = axios.create({
    baseURL: "https://jingally-server.onrender.com/api",
});

export const createShipment = async (shippingData: any, token: string) => {
  const response = await generalApi.post('/guest-shipments', shippingData);
  return response.data;
};

export const getShipments = async (token: string) => {
  const response = await generalApi.get('/guest-shipments');
  return response.data;
};

export const assignContainerToBooking = async (bookingId: string, containerData: any, token: string) => {
  const response = await generalApi.post(`/guest-shipments/${bookingId}/assign-container`, containerData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateBookingPayment = async (bookingId: string, paymentData: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${bookingId}/payment`, paymentData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateBookingStatus = async (bookingId: string, status: string, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${bookingId}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};


export const updateBookingUser = async (userData: any, token: string) => {
  const response = await generalApi.put(`/guest-shipments/${userData.shipmentId}/user`, userData.userInfo, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getShipmentDetails = async (shipmentId: string | string [], token: string) => {
  const response = await generalApi.get(`/guest-shipments/${shipmentId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const assignDriverToBooking = async (bookingId: string, driverId: string, token: string) => {
  const response = await generalApi.post(`/guest-shipments/${bookingId}/assign-driver`, { driverId }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
