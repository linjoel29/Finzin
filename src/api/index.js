import axios from 'axios';

const api = axios.create({
  baseURL: 'https://finzen-ty46.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
