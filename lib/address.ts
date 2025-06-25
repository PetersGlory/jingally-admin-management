import axios from 'axios';

const generalApi = axios.create({
    baseURL: "https://jingally-server.onrender.com/api",
});

export const getAddresses = async (accessToken: string) => {
    const response = await generalApi.get('/addresses', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const createAddress = async (addressData: any, accessToken: string) => {
    const response = await generalApi.post('/addresses', addressData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const updateAddress = async (addressId: string, addressData: any, accessToken: string) => {
    const response = await generalApi.put(`/addresses/${addressId}`, addressData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const deleteAddress = async (addressId: string, accessToken: string) => {
    const response = await generalApi.delete(`/addresses/${addressId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};


