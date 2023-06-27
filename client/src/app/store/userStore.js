import { makeAutoObservable } from 'mobx';
import axios from 'axios';
import AuthService from '../../shared/api/authServise';
import { API_URL } from '../../shared/http';

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
  }

  setLoading(boolean) {
    this.isLoading = boolean;
  }

  async login(email, password) {
    try {
      const response = await AuthService.login(email, password);
      localStorage.setItem('token', response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (err) {
      console.log(err.response?.data?.message);
    }
  }

  async registration(email, password) {
    try {
      const response = await AuthService.registration(email, password);
      localStorage.setItem('token', response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (err) {
      console.log(err.response?.data?.message);
    }
  }

  async logout() {
    try {
      await AuthService.logout();
      localStorage.removeItem('token');
      this.setAuth(false);
      this.setUser({});
    } catch (err) {
      console.log(err.response?.data?.message);
    }
  }

  async checkAuth() {
    try {
      this.setLoading(true);
      const response = await axios(`${API_URL}/refresh`, {
        withCredentials: true
      });
      localStorage.setItem('token', response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (err) {
      console.log(err.response?.data?.message);
    } finally {
      this.setLoading(false);
    }
  }
}
