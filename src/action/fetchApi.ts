import { API_URL } from "../../config";

interface IFetchApi {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, any> | FormData; // JSON body or FormData
  options?: RequestInit; // Extra fetch options (headers, etc.)
}

export const fetchApi = async ({
  url,
  method = "GET",
  data,
  options,
}: IFetchApi) => {
  try {
    const baseUrl = `${API_URL}/${url}`;

    // Build request init
    let fetchOptions: RequestInit = {
      method,
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
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        };
      }
    }

    const response = await fetch(baseUrl, fetchOptions);
    console.log("Response:", response);

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
