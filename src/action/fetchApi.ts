import { API_URL } from "../../config";

interface IFetchApi {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  options?: RequestInit;
}

export const fetchApi = async ({ url, method = "GET", options }: IFetchApi) => {
  try {
    const baseUrl = `${API_URL}/${url}`;
    const response = await fetch(baseUrl, {
      method,
      ...options,
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} - ${response.statusText}`);
      return null; // 👈 instead of throwing
    }

    return response.json();
  } catch (error) {
    console.error("fetchApi error:", error);
    return null; // 👈 safe fallback
  }
};
