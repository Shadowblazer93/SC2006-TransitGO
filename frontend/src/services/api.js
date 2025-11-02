import axios from 'axios';
import { supabase } from '../supabaseClient';

const API_URL = 'http://localhost:8000/api';

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

export async function deleteAccount() {
  if (!confirm("This will permanently delete your account. Continue?")) return;

  // get bearer header using helper
  const headers = await authHeader();
  if (!headers.Authorization) {
    alert("Please sign in again.");
    return;
  }

  try {
    // no userId in URL or body — backend derives it from the token
    const res = await axios.delete(`${API_URL}/UserProfile`, { headers });

    // handle 200/204 or empty body
    if (res.status === 200 || res.status === 204) {
      await supabase.auth.signOut({ scope: "global" });
      window.location.assign("/login"); // or /login
      return;
    }
    // fallback if some other 2xx with body
    console.log("Delete response:", res.data);
    await supabase.auth.signOut({ scope: "global" });
    window.location.assign("/goodbye");
  } catch (err) {
    console.error("Delete failed:", err);
    const msg = err?.response?.data?.detail || err?.message || "Failed to delete account.";
    alert(msg);
  }
}