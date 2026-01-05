import { API_URL } from "../../config";
import { getSession } from "./auth";
import { toast } from "sonner";
interface IFetchApi {
  url: string;
  token?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, any> | FormData; // JSON body or FormData
  options?: RequestInit; // Extra fetch options (headers, etc.)
  showToast?: boolean;
}

export const fetchApi = async ({
  url,
  method = "GET",
  data,
  token,
  options,
  showToast,
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
      console.log(`API error: ${response.status} - ${response.statusText}`);
      // Try to parse error response body for detailed error message
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await response.json();
          return {
            success: 0,
            error: true,
            status: response.status,
            statusText: response.statusText,
            detail: errorJson.detail || errorJson.message || errorJson.error || `Error: ${response.status} - ${response.statusText}`,
            data: errorJson,
          };
        }
      } catch (parseError) {
        console.log("Error parsing error response:", parseError);
      }
      return {
        success: 0,
        error: true,
        status: response.status,
        statusText: response.statusText,
        detail: `Error: ${response.status} - ${response.statusText}`,
      };
    }

    // Try to parse JSON safely
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      if (showToast && json.detail) {
        toast.success(json.detail);
      }
      return json;
    }
    return response.text();
  } catch (error) {
    console.log("fetchApi error:", error);
    const errorMessage = error instanceof Error ? error.message : "Network error occurred";
    return {
      success: 0,
      error: true,
      status: 0,
      statusText: "Network Error",
      detail: errorMessage === "Failed to fetch"
        ? "Unable to connect to server. Please check your internet connection and try again."
        : errorMessage,
    };
  }
};
