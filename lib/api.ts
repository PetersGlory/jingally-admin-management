import axios from "axios";


// Set the base URL for your API
const api = axios.create({
    baseURL: 'https://jingally-server.onrender.com/api/admin',
});

const authApi = axios.create({
    baseURL: 'https://jingally-server.onrender.com/api/auth',
});

export const generalApi = axios.create({
    baseURL: 'https://jingally-server.onrender.com/api',
});

export const bookingApi = axios.create({
    baseURL: 'https://jingally-server.onrender.com/api/booking',
});

export const login = async (email: string, password: string) => {
    const response = await authApi.post('/login', { email, password });
    return response.data;
};

export const getProfile = async (accessToken: string) => {
    const response = await authApi.get('/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};
// dashboard Stats
export const getDashboardStats = async (accessToken: string) => {
    const response = await api.get('/dashboard/stats', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

// users Section
export const getUsers = async (accessToken: string) => {
    const response = await api.get('/users', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

// drivers Section
export const getDrivers = async (accessToken: string) => {
    const response = await api.get('/drivers', {
        headers: {
            Authorization: `Bearer ${accessToken}`  
        }
    });
    return response.data;
};

// create Driver
export const createDriver = async (accessToken: string, driverData: any) => {
    const response = await api.post('/drivers', driverData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const getUserById = async (accessToken: string, userId: string) => {
    const response = await api.get(`/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }); 
    return response.data;
};

export const updateUser = async (accessToken: string, userId: string, userData: any) => {
    const response = await api.put(`/users/${userId}`, userData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

//  shipment section
export const getShipments = async (accessToken: string) => {
    const response = await api.get('/shipments', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const getShipmentById = async (accessToken: string, shipmentId: string) => {
    const response = await api.get(`/shipments/${shipmentId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }); 
    return response.data;
};

export const updateShipment = async (accessToken: string, shipmentId: string, shipmentData: any) => {
    const response = await api.put(`/shipments/${shipmentId}`, shipmentData, {
        headers: {  
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

// Address Section
export const getAddresses = async (accessToken: string) => {
    const response = await api.get('/addresses', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const getAddressById = async (accessToken: string, addressId: string) => {
    const response = await api.get(`/addresses/${addressId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const updateAddress = async (accessToken: string, addressId: string, addressData: any) => {
    const response = await api.put(`/addresses/${addressId}`, addressData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const updateShipmentStatus = async (accessToken: string, shipmentId: string, shipmentData: any) => {
    const response = await api.put(`/shipments/${shipmentId}/status`, shipmentData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const trackShipment = async (accessToken: string, trackingNumber: string) => {
    const response = await generalApi.get(`/shipments/track/${trackingNumber}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};  


// container section
export const getContainers = async (accessToken: string) => {
    const response = await api.get('/containers', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const assignContainerToShipment = async (accessToken: string, shipmentId: string, containerId: string) => {
    const response = await api.post(`/shipments/assign-container/`, {
        shipmentId: shipmentId,
        containerId: containerId
    },{
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

// update shipment payment status
export const updateShipmentPaymentStatus = async (accessToken: string, shipmentId: string, shipmentData: any) => {
    const response = await api.put(`/shipments/${shipmentId}/payment-status`, shipmentData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }); 
    return response.data;
};


export const createContainer = async (accessToken: string, containerData: any) => {
    const response = await api.post('/containers', containerData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const updateContainer = async (accessToken: string, containerId: string, containerData: any) => {
    const response = await api.put(`/containers/${containerId}`, containerData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const deleteContainer = async (accessToken: string, containerId: string) => {
    const response = await api.delete(`/containers/${containerId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

// Admins Section
export const getAdmins = async (accessToken: string) => {
    const response = await api.get('/admins', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};

export const createAdmin = async (accessToken: string, adminData: any) => {
    const response = await api.post('/admins', adminData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
};


