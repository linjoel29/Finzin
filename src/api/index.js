import axios from 'axios';

export const API_URL = "https://finzin.onrender.com";

// Wake-up request to reduce Render cold start delay
fetch(API_URL).catch(() => console.log('Wake-up request failed'));

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
