import apiClient from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  isActive: boolean;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  isActive: boolean;
}

export const categoriesApi = {
  findAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/categories');
    return response.data;
  },

  findOne: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/${id}`);
    return response.data;
  },

  findBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/slug/${slug}`);
    return response.data;
  },

  getSkills: async (categoryId: string): Promise<Skill[]> => {
    const response = await apiClient.get(`/api/categories/${categoryId}/skills`);
    return response.data;
  },
};

// Export helper functions for convenience
export const getAllCategories = categoriesApi.findAll;
export const getCategoryById = categoriesApi.findOne;
export const getCategoryBySlug = categoriesApi.findBySlug;
export const getCategorySkills = categoriesApi.getSkills;
