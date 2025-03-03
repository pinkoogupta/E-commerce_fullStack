import axios from 'axios';

export const token = localStorage.getItem('token');

export const getRequest = async (url) => {
    try {
        const res = await axios.get(`${backendUrl}/${url}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (error) {
        console.error('GET request error:', error);
        throw error;
    }
};

export const postRequest = async (url, data) => {
    try {
        const res = await axios.post(`${backendUrl}/${url}`, data, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (error) {
        console.error('POST request error:', error);
        throw error;
    }
};

export const putRequest = async (url, data) => {
    try {
        const res = await axios.put(`${backendUrl}/${url}`, data, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (error) {
        console.error('PUT request error:', error);
        throw error;
    }
};

export const patchRequest = async (url, data) => {
    try {
        const res = await axios.patch(`${backendUrl}/${url}`, data, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (error) {
        console.error('PATCH request error:', error);
        throw error;
    }
};

export const deleteRequest = async (url) => {
    try {
        const res = await axios.delete(`${backendUrl}/${url}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (error) {
        console.error('DELETE request error:', error);
        throw error;
    }
};
