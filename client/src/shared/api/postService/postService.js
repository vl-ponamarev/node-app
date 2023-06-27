import api from '../../http/index';

export default class PostService {
  static async getLimitPosts(limit, offset) {
    try {
      const response = await api.get('/posts', limit, offset);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async createPost(formData) {
    try {
      const response = await api.post('/create-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async editPost(id, formData) {
    try {
      const response = await api.put(`/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deletePost(data) {
    try {
      const response = await api.delete('/delete', {
        data: JSON.stringify({ _id: data }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
