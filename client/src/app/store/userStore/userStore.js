import { makeAutoObservable } from 'mobx'
import axios from 'axios'
import AuthService from '../../../shared/api/authServise'
import { API_URL } from '../../../shared/http'
import { errorStore } from 'index';

export default class Store {
  user = {};
  isAuth = false;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(boolean) {
    this.isAuth = boolean;
  }

  setUser(user) {
    this.user = user;
    this.isLoading = false;
  }

  setLoading(boolean) {
    this.isLoading = boolean;
  }

  async login(email, password) {
    this.setLoading(true);
    try {
      const response = await AuthService.login(email, password);
      if (response?.data?.user?.isActivated) {
        localStorage.setItem('token', response.data.accessToken);
        this.setAuth(true);
        this.setUser(response.data.user);
      } else {
        this.setAuth(false);
        this.setUser({});
        errorStore.setError({
          message: response.data.message,
          status: true,
          url: '',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
      errorStore.setError({
        message: err.response?.data?.message || err.message,
        status: true,
        url: '',
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.setLoading(false);
    }
  }

  async registration(email, password) {
    this.setLoading(true);

    try {
      const response = await AuthService.registration(email, password);
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: response.data.user.email,
          remember: response.data.user.remember,
        }),
      );
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (err) {
      console.error(err);
      errorStore.setError({
        message: err.response?.data?.message || err.message,
        status: true,
        url: '',
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.setLoading(false);
    }
  }

  async logout() {
    try {
      this.setAuth(false);
      this.setUser({});
      localStorage.removeItem('token');
      await AuthService.logout();
    } catch (err) {
      console.error(err);
    }
  }

  async checkAuth() {
    try {
      this.setLoading(true);
      const response = await axios(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      localStorage.setItem('token', response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (err) {
      console.error(err.message);
      localStorage.removeItem('token');
      this.setAuth(false);
      this.setUser({});
    } finally {
      this.setLoading(false);
    }
  }
}
