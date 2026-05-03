import axios, { AxiosInstance } from "axios";

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add interceptors for Auth Token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor untuk handle BigInt agar tidak pecah di UI
apiClient.interceptors.response.use((response) => {
  const transformBigInt = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "bigint") return obj.toString();
    if (Array.isArray(obj)) return obj.map(transformBigInt);
    if (typeof obj === "object") {
      // Don't recurse into common built-in objects that are not plain objects
      if (obj instanceof Date || obj instanceof Blob || obj instanceof File) return obj;
      
      // Check if it's a plain object or something else
      const proto = Object.getPrototypeOf(obj);
      if (proto !== null && proto !== Object.prototype) return obj;

      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, transformBigInt(v)]),
      );
    }
    return obj;
  };

  // Skip transformation for Blobs or non-object data
  if (
    response.data instanceof Blob ||
    response.headers["content-type"]?.includes("application/pdf")
  ) {
    return response;
  }

  response.data = transformBigInt(response.data);
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }
  return Promise.reject(error);
});
