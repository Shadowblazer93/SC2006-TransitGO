import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users`, userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const getBusStops = async () => {
    try {
        const response = await axios.get(`${API_URL}/busstops`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bus stops:', error);
        throw error;
    }
}

// Add more API functions as needed for your application