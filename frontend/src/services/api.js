import axios from 'axios';
import { supabase } from '../supabaseClient';

const API_URL = 'http://localhost:8000/api';
//TODO: Update Users table everytime a new user signs up. If not problems will arise when fetching user-related data.
async function authHeader() {
  const { data: { session} } = await supabase.auth.getSession();
  const token = session?.access_token;
  console.log("Bearer", token?.slice(0,12));
  return token ? { Authorization: `Bearer ${token}` } : {};
}
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
        const response = await axios.get(`${API_URL}/feedbacks/`);
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

export const getReplies = async (feedbackId) => {
  const { data } = await axios.get(`${API_URL}/feedbacks/${encodeURIComponent(feedbackId)}/replies`);
  return Array.isArray(data) ? data : [];
};

export const deleteReply= async (feedbackId,replyId) => {
  try {
    const response = await axios.delete(`${API_URL}/feedbacks/${feedbackId}/replies/${replyId}`, {
    });
    return response.status === 204 || response.data === "" ? null : response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.detail || error.message);
  }
};

export const postReply = async (feedbackId, content) => {
  const headers = await authHeader();
  const body = { content: String(content ?? '').trim() };
  if (!body.content) throw new Error('Reply content cannot be empty');
  const { data } = await axios.post(`${API_URL}/feedbacks/${encodeURIComponent(feedbackId)}/replies`, body, { headers });
  return data;
};