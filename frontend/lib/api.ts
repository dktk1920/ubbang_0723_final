xport const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = user?.access_token;

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetchwithAuth(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    window.location.href = "/";
  }

  return response;
};