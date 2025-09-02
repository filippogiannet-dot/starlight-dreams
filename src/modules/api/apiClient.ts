// API Client Module with comprehensive error handling for Replit integration
import { toast } from '@/hooks/use-toast';

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  body?: any;
}

class APIClient {
  private baseURL: string;
  private defaultTimeout = 15000; // 15 seconds
  private defaultRetries = 3;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      headers = {},
      body
    } = config;

    let attempt = 0;
    
    while (attempt <= retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestConfig: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          signal: controller.signal
        };

        if (body && method !== 'GET') {
          requestConfig.body = JSON.stringify(body);
        }

        console.log(`[API] ${method} ${endpoint} - Attempt ${attempt + 1}`);
        
        const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log(`[API] ${method} ${endpoint} - Success`);
        return { data, success: true };

      } catch (error: any) {
        attempt++;
        console.error(`[API] ${method} ${endpoint} - Error (attempt ${attempt}):`, error);

        if (attempt > retries) {
          const errorMessage = error.name === 'AbortError' 
            ? 'Request timed out' 
            : error.message || 'Network error';

          toast({
            title: "Connection Error",
            description: errorMessage,
            variant: "destructive"
          });

          return { error: errorMessage, success: false };
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { error: 'Max retries exceeded', success: false };
  }

  // Content Generation APIs
  async generateMeditation(prompt: string, preferences?: any): Promise<APIResponse<any>> {
    return this.makeRequest('/generate/meditation', 'POST', {
      body: { prompt, preferences },
      timeout: 30000 // Longer timeout for AI generation
    });
  }

  async generateExercise(category: string, duration: number): Promise<APIResponse<any>> {
    return this.makeRequest('/generate/exercise', 'POST', {
      body: { category, duration },
      timeout: 20000
    });
  }

  async generatePersonalizedTip(userId: string, context?: any): Promise<APIResponse<any>> {
    return this.makeRequest('/generate/tip', 'POST', {
      body: { userId, context }
    });
  }

  // Analytics and Tracking APIs
  async trackSession(sessionData: any): Promise<APIResponse<any>> {
    return this.makeRequest('/track/session', 'POST', {
      body: sessionData
    });
  }

  async trackInteraction(interaction: any): Promise<APIResponse<any>> {
    return this.makeRequest('/track/interaction', 'POST', {
      body: interaction
    });
  }

  // User Preferences APIs
  async getUserPreferences(userId: string): Promise<APIResponse<any>> {
    return this.makeRequest(`/users/${userId}/preferences`);
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<APIResponse<any>> {
    return this.makeRequest(`/users/${userId}/preferences`, 'PUT', {
      body: preferences
    });
  }

  // Recommendation APIs
  async getRecommendations(userId: string, context?: any): Promise<APIResponse<any>> {
    return this.makeRequest('/recommendations', 'POST', {
      body: { userId, context }
    });
  }

  // Health check
  async healthCheck(): Promise<APIResponse<{ status: string }>> {
    return this.makeRequest('/health');
  }
}

export const apiClient = new APIClient();

// Utility functions for common patterns
export const withLoadingState = async <T>(
  apiCall: () => Promise<APIResponse<T>>,
  setLoading: (loading: boolean) => void
): Promise<T | null> => {
  setLoading(true);
  try {
    const response = await apiCall();
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } finally {
    setLoading(false);
  }
};

export const handleApiError = (error: string, fallbackMessage = "Something went wrong") => {
  console.error('API Error:', error);
  toast({
    title: "Error",
    description: fallbackMessage,
    variant: "destructive"
  });
};