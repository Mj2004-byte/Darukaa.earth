export type Role = 'ADMIN' | 'ANALYST';

export interface User {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: Role;
  created_at: string;
  last_login: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: string;
  status: 'ACTIVE' | 'PLANNING' | 'COMPLETED' | 'PAUSED';
  country: string;
  region: string;
  total_area: number;
  owner_id?: string;
  created_at: string;
  updated_at?: string;
  site_count?: number;
}

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
}

export interface Site {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  geometry: GeoJSONGeometry;
  area_hectares: number;
  status: 'ACTIVE' | 'MONITORING' | 'RESTORATION' | 'INACTIVE';
  created_at: string;
  updated_at?: string;
}

export interface Analytics {
  id: string;
  site_id: string;
  recorded_at: string;
  carbon_stock: number;
  carbon_sequestration: number;
  biodiversity_score: number;
  tree_cover_percentage: number;
  biomass: number;
  rainfall: number;
  temperature: number;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_sites: number;
  total_area_ha: number;
  total_carbon_sequestered: number;
  avg_biodiversity_score: number;
  recent_insights: Array<{
    title: string;
    content: string;
    type: 'POSITIVE' | 'NEUTRAL' | 'INFO';
  }>;
}

export interface SiteAnalysisResponse {
  executive_summary: string;
  carbon_analysis: string;
  biodiversity_analysis: string;
  environmental_factors: string;
  areas_to_monitor: string[];
  recommendations: string[];
  is_demo_data: boolean;
  grounding_note: string;
}

export interface CompareSitesResponse {
  site_a_name: string;
  site_b_name: string;
  metrics_comparison: Record<string, { 'Site A': number; 'Site B': number }>;
  ai_summary: string;
  is_demo_data: boolean;
}

export interface ToolExecutionLog {
  tool_name: string;
  arguments: Record<string, any>;
  output: any;
}

export interface AgentQueryResponse {
  query: string;
  final_answer: string;
  tool_logs: ToolExecutionLog[];
  data_points_used: number;
}

export interface RiskPredictionResponse {
  site_id: string;
  site_name: string;
  risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  feature_contributions: Record<string, number>;
  ai_explanation: string;
  model_version: string;
  is_experimental: boolean;
}

export interface AIReportResponse {
  site_id: string;
  site_name: string;
  report_title: string;
  report_content: string;
  generated_at: string;
  is_demo_data: boolean;
}
