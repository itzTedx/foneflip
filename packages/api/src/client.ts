import type { CreateUser, UpdateUser, User } from "./types";

// Simple API client for making calls to your API
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User API methods
  async createUser(data: CreateUser): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUser(id: string): Promise<User | null> {
    return this.request<User | null>(`/users/${id}`);
  }

  async listUsers(params: { limit?: number; offset?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request<{ users: User[]; total: number }>(`/users${query ? `?${query}` : ""}`);
  }

  async updateUser(id: string, data: Partial<UpdateUser>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: "ok"; timestamp: Date }> {
    return this.request<{ status: "ok"; timestamp: Date }>("/health");
  }
}

// Create a default client instance
export const apiClient = new ApiClient();

// Export convenience methods
export const userApi = {
  create: apiClient.createUser.bind(apiClient),
  get: apiClient.getUser.bind(apiClient),
  list: apiClient.listUsers.bind(apiClient),
  update: apiClient.updateUser.bind(apiClient),
  delete: apiClient.deleteUser.bind(apiClient),
};

export const healthApi = {
  check: apiClient.healthCheck.bind(apiClient),
};
