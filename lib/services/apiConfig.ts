// apiConfig.ts
import { compile } from "path-to-regexp";

interface ApiPathConfig {
  pathTemplate: string;
  method: "GET" | "POST" | "PUT" | "DELETE"; // Extend with other HTTP methods if needed
}

interface ApiCategoryConfig {
  apiUrl: string;
  paths: {
    [key: string]: ApiPathConfig;
  };
  apiKey?: string;
}

interface ApiConfig {
  [key: string]: ApiCategoryConfig;
}

const API_CONFIG: ApiConfig = {
  DIGILOCKER: {
    apiUrl: "https://digilocker.meripehchaan.gov.in",
    paths: {
      eAadhaar: {
        pathTemplate: "/public/oauth2/3/xml/eaadhaar",
        method: "GET",
      },
      certInXML: {
        pathTemplate: "/public/oauth2/1/xml/:uri",
        method: "GET",
      },
      accountDetails: {
        pathTemplate: "/public/oauth2/1/user",
        method: "GET",
      },
    },
  },
  ZKIDAPI: {
    apiUrl: "",
    paths: {
      getprofile: {
        pathTemplate: "/api/profile",
        method: "GET",
      },
      deleteProfile: {
        pathTemplate: "/api/profile",
        method: "DELETE",
      },
    },
  },
};
// Utility function to generate dynamic paths
export function generateDynamicPath(
  category: string,
  pathKey: string,
  params: Record<string, string | number> | null,
): string {
  const { apiUrl, paths } = API_CONFIG[category];
  const { pathTemplate } = paths[pathKey];
  if (params === null) {
    // If params is null, return the URL without any parameter replacement
    return apiUrl + pathTemplate;
  }

  const toPath = compile(pathTemplate);
  return apiUrl + toPath(params);
}

export default API_CONFIG;
