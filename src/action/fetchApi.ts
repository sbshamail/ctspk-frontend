import { API_URL } from "../../config";

interface IFetchApi {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  options?: RequestInit; // allow cache, headers, etc.
}

export const fetchApi = async ({ url, method = "GET", options }: IFetchApi) => {
  const baseUrl = `${API_URL}/${url}`;
  const response = await fetch(baseUrl, {
    method,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};
