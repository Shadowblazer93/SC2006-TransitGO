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

export const getBusArrivals = async (busStopCode) => {
    try {
        const encoded = encodeURIComponent(busStopCode);
        const response = await axios.get(`${API_URL}/busarrivals/${encoded}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const getBusServices = async () => {
    try {
        const response = await axios.get(`${API_URL}/busservices`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const getBusRoutes = async () => {
    try {
        const response = await axios.get(`${API_URL}/busroutes`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const getStationCrowdDensityRealtime = async (trainLine) => {
    try {
        const encoded = encodeURIComponent(trainLine);
        const response = await axios.get(`${API_URL}/stationcrowddensityrealtime/${encoded}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const getStationCrowdDensityForecast = async (trainLine) => {
    try {
        const encoded = encodeURIComponent(trainLine);
        const response = await axios.get(`${API_URL}/stationcrowddensityforecast/${encoded}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const taxiAvailability = async () => {
    try {
        const response = await axios.get(`${API_URL}/taxiavailability`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const taxiStands = async () => {
    try {
        const response = await axios.get(`${API_URL}/taxistands`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const trainServiceAlerts = async () => {
    try {
        const response = await axios.get(`${API_URL}/trainservicealerts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const estimatedTravelTimes = async () => {
    try {
        const response = await axios.get(`${API_URL}/estimatedtraveltimes`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const trafficImages = async () => {
    try {
        const response = await axios.get(`${API_URL}/trafficimages`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const trafficIncidents = async () => {
    try {
        const response = await axios.get(`${API_URL}/trafficincidents`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const getFeedbacks= async () => {
    try {
        const response = await axios.get(`${API_URL}/feedbacks`);
        return response.data;
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
}

export const deleteFeedback = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/feedbacks/${id}`, {
    });
    return response.status === 204 || response.data === "" ? null : response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.detail || error.message);
  }
};