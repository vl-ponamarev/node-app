import api from '../../http/index';

export default class AuthService {
  static async login(email, password) {
    try {
      const response = await api.post('/login', email, password);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async registration(email, password) {
    try {
      const response = await api.post('/registration', email, password);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async logout() {
    return api.post('/logout');
  }
}
