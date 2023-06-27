const FileService = require('../service/file-service');
const PostService = require('../service/post-service');
const userService = require('../service/user-service');

class PostController {
  async createPost(req, res, next) {
    try {
      FileService.upload(req, res, async err => {
        if (err) {
          return next(err);
        }
        if (!req.file) {
          const post = await PostService.createPost(req.body);
          await FileService.createFile(
            post.id,
            'empty.png',
            'image.png',
            'empty.png'
          );
          return res.json(post);
        }
        const post = await PostService.createPost(req.body);

        await FileService.createFile(
          post.id,
          req.file.filename,
          req.file.mimetype,
          req.file.originalname
        );
        return res.json(post);
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req, res, next) {
    try {
      const limit = 20;
      const offset = 0;
      const posts = await PostService.getLimitPosts(limit, offset);
      const postsWithFiles = await Promise.all(
        posts.map(async post => {
          const file = await FileService.getFileByPostId(
            post._id.toHexString()
          );
          const user = await userService.getUserById(post.author.toHexString());
          return {
            _id: post._doc._id,
            title: post._doc.title,
            content: post._doc.content,
            publicationDate: post._doc.publicationDate,

            file,
            user: user.email
          };
        })
      );
      return res.json(postsWithFiles);
    } catch (error) {
      next(error);
    }
  }

  async editPost(req, res, next) {
    try {
      const id = { _id: req.params.id };
      FileService.upload(req, res, async err => {
        if (err) {
          return next(err);
        }
        if (!req.file) {
          const post = await PostService.editPost(id, req.body);
          return res.json(post);
        }
        const post = await PostService.editPost(id, req.body);
        const file = await FileService.getFileByPostId(req.params.id);
        await FileService.deleteFile({ fileName: file });
        await FileService.createFile(
          post.id,
          req.file.filename,
          req.file.mimetype,
          req.file.originalname
        );
        return res.json(post);
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOnePost(req, res, next) {
    try {
      const file = await FileService.getFileByPostId(req.body);
      await PostService.deletePost(req.body);
      await FileService.deleteFile({ fileName: file });
      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new PostController();
