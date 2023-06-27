const PostModel = require('../models/post-model');

class PostService {
  async getLimitPosts(limit, offset) {
    try {
      const posts = await PostModel.find().skip(offset).limit(limit).exec();
      return posts;
    } catch (err) {
      console.error(err);
    }
  }

  async createPost(data) {
    const post = await PostModel.create(data);
    return post;
  }

  async editPost(postId, updatedPostData) {
    const post = await PostModel.findByIdAndUpdate(postId, updatedPostData, {
      new: true
    });
    return post;
  }

  async deletePost(data) {
    try {
      await PostModel.deleteOne(data).then(res => console.log(res));
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new PostService();
