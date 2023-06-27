const Router = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user-controller');

const router = new Router();

const authMiddleware = require('../middlewares/auth-middleware');
const postController = require('../controllers/post-controller');

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

router.post('/create-post', postController.createPost);

router.get('/posts', postController.getPosts);
router.put('/posts/:id', postController.editPost);
router.delete('/delete', postController.deleteOnePost);

module.exports = router;
