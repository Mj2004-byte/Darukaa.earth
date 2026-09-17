import axios from 'axios';
import {
  User,
  Project,
  Site,
  Analytics,
  DashboardStats,
  SiteAnalysisResponse,
  CompareSitesResponse,
  AgentQueryResponse,
  RiskPredictionResponse,
  AIReportResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('darukaa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const authService = {
  loginWithGoogle: async (payload: { id_token?: string; access_token?: string; email?: string; name?: string; picture?: string }) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/google', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

export const projectService = {
  getProjects: async (params?: { search?: string; status?: string; project_type?: string }) => {
    const res = await api.get<Project[]>('/projects', { params });
    return res.data;
  },
  getProject: async (id: string) => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },
  createProject: async (data: { name: string; description?: string; project_type: string; status: string; country: string; region: string }) => {
    const res = await api.post<Project>('/projects', data);
    return res.data;
  },
  updateProject: async (id: string, data: Partial<Project>) => {
    const res = await api.put<Project>(`/projects/${id}`, data);
    return res.data;
  },
  deleteProject: async (id: string) => {
    await api.delete(`/projects/${id}`);
  },
};

export const siteService = {
  getProjectSites: async (projectId: string) => {
    const res = await api.get<Site[]>(`/projects/${projectId}/sites`);
    return res.data;
  },
  getSite: async (id: string) => {
    const res = await api.get<Site>(`/sites/${id}`);
    return res.data;
  },
  createSite: async (projectId: string, data: { name: string; description?: string; geometry: any; status: string }) => {
    const res = await api.post<Site>(`/projects/${projectId}/sites`, data);
    return res.data;
  },
  updateSite: async (id: string, data: Partial<Site>) => {
    const res = await api.put<Site>(`/sites/${id}`, data);
    return res.data;
  },
  deleteSite: async (id: string) => {
    await api.delete(`/sites/${id}`);
  },
};

export const analyticsService = {
  getSiteAnalytics: async (siteId: string) => {
    const res = await api.get<Analytics[]>(`/sites/${siteId}/analytics`);
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};

export const aiService = {
  analyzeSite: async (siteId: string) => {
    const res = await api.post<SiteAnalysisResponse>('/ai/site-analysis', { site_id: siteId });
    return res.data;
  },
  compareSites: async (siteAId: string, siteBId: string) => {
    const res = await api.post<CompareSitesResponse>('/ai/compare-sites', { site_a_id: siteAId, site_b_id: siteBId });
    return res.data;
  },
  chat: async (message: string, siteId?: string) => {
    const res = await api.post<{ reply: string; referenced_sites: string[]; referenced_metrics: any }>('/ai/chat', { message, site_id: siteId });
    return res.data;
  },
  generateReport: async (siteId: string) => {
    const res = await api.post<AIReportResponse>('/ai/generate-report', { site_id: siteId });
    return res.data;
  },
};

export const agentService = {
  queryAgent: async (query: string) => {
    const res = await api.post<AgentQueryResponse>('/agent/query', { query });
    return res.data;
  },
};

export const mlService = {
  predictRisk: async (siteId: string) => {
    const res = await api.post<RiskPredictionResponse>('/ml/risk-prediction', { site_id: siteId });
    return res.data;
  },
};
