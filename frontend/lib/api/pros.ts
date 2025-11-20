import apiClient from './client';

export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  completedJobs?: number;
  responseTime?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isAvailable: boolean;
  city?: {
    id: string;
    name: string;
  };
  categories?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  skills?: Array<{
    id: string;
    name: string;
  }>;
  portfolio?: Array<{
    id: string;
    imageUrl: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchProsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  cityId?: string;
  minRating?: number;
  maxHourlyRate?: number;
  skills?: string[];
  search?: string;
  isAvailable?: boolean;
  sortBy?: 'rating' | 'hourlyRate' | 'completedJobs' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProsResponse {
  data: Professional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const prosApi = {
  /**
   * Search for professionals with filters
   */
  async search(params: SearchProsParams = {}): Promise<ProsResponse> {
    const response = await apiClient.get('/pros/search', { params });
    return response.data;
  },

  /**
   * Get a single professional by ID
   */
  async findOne(id: string): Promise<Professional> {
    const response = await apiClient.get(`/pros/${id}`);
    return response.data;
  },

  /**
   * Get featured professionals (top rated, most active)
   */
  async getFeatured(limit: number = 6): Promise<Professional[]> {
    const response = await apiClient.get('/pros/featured', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get professionals by category
   */
  async getByCategory(categoryId: string, params: SearchProsParams = {}): Promise<ProsResponse> {
    const response = await apiClient.get(`/pros/category/${categoryId}`, { params });
    return response.data;
  },

  /**
   * Get professional's reviews
   */
  async getReviews(proId: string, page: number = 1, limit: number = 10) {
    const response = await apiClient.get(`/pros/${proId}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get professional's portfolio
   */
  async getPortfolio(proId: string) {
    const response = await apiClient.get(`/pros/${proId}/portfolio`);
    return response.data;
  },
};

export default prosApi;
