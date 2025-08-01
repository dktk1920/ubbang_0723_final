import { useUser } from "@/hooks/useUser";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { user } = useUser();
  const token = user?.access_token;

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized access, e.g., redirect to login
    window.location.href = '/';
  }

  return response;
};