import axios from 'axios';
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

const setupInterceptors = () => {
  api.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  });
  api.interceptors.response.use(
    config => config,
    async error => {
      console.error('Ошибка Axios:', error.response || error.message);
      // setError({
      //   message: error.message,
      //   status: error.response?.status,
      //   url: error.config?.url,
      //   timestamp: new Date().toISOString(),
      // });

      const originalRequest = error.config;
      if (error?.response?.status === 401 && error?.config && !error?.config._isRetry) {
        originalRequest._isRetry = true;
        try {
          const response = await axios.get(`${API_URL}/refresh`, {
            withCredentials: true,
          });
          localStorage.setItem('token', response.data.accessToken);
          return api.request(originalRequest);
        } catch (e) {
          console.error('НЕ АВТОРИЗОВАН');
          localStorage.removeItem('token');
          const { userStore } = await import('index');
          userStore.setAuth(false);
          userStore.setUser({});
        }
      }
      throw error;
    },
  );
};

setupInterceptors();

export default api;
