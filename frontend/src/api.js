import axios from 'axios';

const API = axios.create({
  baseURL: 'https://datastraw-crm-backend-n9ca.onrender.com/api',
});

export default API;