import axios, { AxiosResponse, AxiosError } from "axios";
import { getToken } from "@/app/api/auth/digilocker/route";
import { NextRequest } from "next/server";
import { OpenIDTokenEndpointResponse } from "oauth4webapi";
import API_CONFIG, { generateDynamicPath } from "./apiConfig";

interface ApiParams {
  category: string;
  pathKey: string;
  params: Record<string, string | number> | null;
  data?: any; // Used for POST, PUT requests
  headers?: Record<string, string> | null; // Optional custom headers
}

export const apiRequest = async ({ category, pathKey, params, data, headers }: ApiParams): Promise<AxiosResponse> => {
  const { method } = API_CONFIG[category].paths[pathKey];

  // Calculate the URL using the generateDynamicPath utility function
  const url = generateDynamicPath(category, pathKey, params);

  try {
    const response = await axios({
      url,
      method,
      headers: { ...headers },
      data,
    });
    return response;
  } catch (error) {
    // Handle the Axios error
    if (axios.isAxiosError(error)) {
      // Axios error with response
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made, but the server responded with an error status code (e.g., 4xx or 5xx)
        console.error("Server responded with an error:");
        console.error("Status:", axiosError.response.status);
        console.error("Data:", axiosError.response.data);
        console.error("Headers:", axiosError.response.headers);
      } else {
        // The request was made, but no response was received (e.g., network error)
        console.error("No response received:", axiosError.message);
      }
    } else {
      // Non-Axios error (e.g., network error)
      console.error("Network error:", error);
    }

    // Rethrow the error to allow the calling code to handle it further if needed
    throw error;
  }
};

// Example usage:
/*
try {
  const response = await apiRequest({
    category: 'DIGILOCKER',
    pathKey: 'eAadhaar',
    params: { /*...parameters needed for path template... }
  });
  // Handle success
} catch (error) {
  // Handle error
}
*/
