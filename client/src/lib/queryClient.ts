import { QueryClient, QueryFunction } from "@tanstack/react-query";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  withCredentials?: boolean
): Promise<Response> {
  // Debug request
  console.log(`🌐 API Request:`, {
    method,
    url,
    withCredentials,
    data: data ? JSON.stringify(data) : undefined
  });

  const headers: HeadersInit = {};
  
  // Set Content-Type if there's data
  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  // Add authorization if needed
  if (withCredentials) {
    const authTokens = localStorage.getItem('authTokens');
    if (authTokens) {
      try {
        const { accessToken } = JSON.parse(authTokens);
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
      } catch (e) {
        console.error('Failed to parse auth tokens:', e);
      }
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: withCredentials ? 'include' : 'omit',
    });

    // Clone response for debugging before checking status
    const responseClone = res.clone();
    console.log(`📡 Raw response for ${url}:`, {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
    });

    // Check response status
    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await responseClone.json();
      } catch {
        errorData = { message: 'Failed to parse error response' };
      }
      
      console.error(`API Error [${url}]:`, {
        status: res.status,
        errorData
      });
      
      throw new Error(
        errorData.message || 
        `Request failed with status ${res.status}`
      );
    }

    return res;
  } catch (error) {
    console.error(`🚨 API Request failed [${url}]:`, error);
    throw error instanceof Error ? error : new Error('Unknown API error');
  }
}

// Helper function (optional - you can inline this in apiRequest)
async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    let errorData: any;
    try {
      errorData = await res.clone().json();
    } catch {
      errorData = { message: res.statusText };
    }
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
