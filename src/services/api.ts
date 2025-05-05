import axios from 'axios';
import { Resident, Concern } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Resident services
export const residentService = {
  // Get all residents
  getAll: async (): Promise<Resident[]> => {
    const response = await api.get('/residents');
    return response.data.data;
  },
  
  // Get resident by ID
  getById: async (id: string): Promise<Resident> => {
    const response = await api.get(`/residents/${id}`);
    return response.data.data;
  },
  
  // Create a new resident
  create: async (resident: { name: string, email: string }): Promise<Resident> => {
    const response = await api.post('/residents', resident);
    return response.data.data;
  },
  
  // Create a test resident (for development)
  createTest: async (): Promise<Resident> => {
    const response = await api.post('/residents/create-test');
    return response.data.data;
  }
};

// Concern services
export const concernService = {
  // Get all concerns
  getAll: async (filters?: { status?: string, residentId?: string }): Promise<Concern[]> => {
    const response = await api.get('/concerns', { params: filters });
    return response.data.data;
  },
  
  // Get concern by ID
  getById: async (id: string): Promise<Concern> => {
    const response = await api.get(`/concerns/${id}`);
    return response.data.data;
  },
  
  // Create a new concern
  create: async (concern: { text: string, residentId: string }): Promise<Concern> => {
    const response = await api.post('/concerns', concern);
    return response.data.data;
  },
  
  // Update a concern (for admin overrides)
  update: async (id: string, data: { verification: { status: 'pending' | 'approved' | 'rejected' } }): Promise<Concern> => {
    const response = await api.put(`/concerns/${id}`, data);
    return response.data.data;
  },
  
  // Trigger AI processing for all pending concerns
  processAll: async (): Promise<any> => {
    const response = await api.post('/concerns/process-all');
    return response.data;
  }
};

export default {
  residentService,
  concernService
}; 