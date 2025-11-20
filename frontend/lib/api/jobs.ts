import apiClient from './client';

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  address: string;
  latitude?: number;
  longitude?: number;
  category: {
    id: string;
    name: string;
  };
  city: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name?: string;
    avatar?: string;
  };
  photos?: any[];
  skills?: any[];
  createdAt: string;
  _count?: {
    proposals: number;
  };
}

export interface CreateJobDto {
  title: string;
  description: string;
  categoryId: string;
  skillIds?: string[];
  budget: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  cityId: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface SearchJobsParams {
  categoryId?: string;
  cityId?: string;
  urgency?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
}

export const jobsApi = {
  create: async (data: CreateJobDto): Promise<Job> => {
    const response = await apiClient.post('/api/jobs', data);
    return response.data;
  },

  findAll: async (params?: SearchJobsParams) => {
    const response = await apiClient.get('/api/jobs', { params });
    return response.data;
  },

  findMyJobs: async (status?: string) => {
    const response = await apiClient.get('/api/jobs/my-jobs', {
      params: { status },
    });
    return response.data;
  },

  findOne: async (id: string): Promise<Job> => {
    const response = await apiClient.get(`/api/jobs/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateJobDto>): Promise<Job> => {
    const response = await apiClient.patch(`/api/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/jobs/${id}`);
  },
};

// Export convenience functions
export const createJob = jobsApi.create;
export const getMyJobs = jobsApi.findMyJobs;
export const getJobById = jobsApi.findOne;
export const updateJob = jobsApi.update;
export const deleteJob = jobsApi.delete;
