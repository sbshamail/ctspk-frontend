import { API_URL } from "../../config";
import { getSession } from "./auth";
interface IFetchApi {
  url: string;
  token?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, any> | FormData; // JSON body or FormData
  options?: RequestInit; // Extra fetch options (headers, etc.)
}

export const fetchApi = async ({
  url,
  method = "GET",
  data,
  token,
  options,
}: IFetchApi) => {
  const sessionToken = await getSession("access_token");
  try {
    const baseUrl = `${API_URL}/${url}`;

    // ✅ Start building headers
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    // ✅ Add Authorization header if token exists
    if (token || sessionToken) {
      headers["Authorization"] = `Bearer ${token || sessionToken}`;
    }

    // Build request init
    let fetchOptions: RequestInit = {
      method,
      headers,
      ...options,
    };

    // Handle body data
    if (data) {
      if (data instanceof FormData) {
        // ✅ FormData (let browser set headers automatically)
        fetchOptions.body = data;
      } else {
        // ✅ JSON data
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers = {
          ...headers,
          "Content-Type": "application/json",
        };
      }
    }

    const response = await fetch(baseUrl, fetchOptions);

    if (!response.ok) {
      console.error(`API error: ${response.status} - ${response.statusText}`);
      return null;
    }

    // Try to parse JSON safely
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  } catch (error) {
    console.error("fetchApi error:", error);
    return null;
  }
};
