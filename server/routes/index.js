const Router = require('express')
const { body, param } = require('express-validator')
const userController = require('../controllers/user-controller')

const router = new Router()

const authMiddleware = require('../middlewares/auth-middleware')
const postController = require('../controllers/post-controller')
const dataController = require('../controllers/data-controller')

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  userController.registration,
)
router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  userController.login,
);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

router.post('/create-post', authMiddleware, postController.createPost);

router.get('/posts', authMiddleware, postController.getPosts);
router.put('/posts/:id', authMiddleware, postController.editPost);
router.delete('/delete', authMiddleware, postController.deleteOnePost);

router.delete('/delete-files', authMiddleware, dataController.deleteFiles);
router.delete('/delete-folders', authMiddleware, dataController.deleteFolders);
router.post('/save-files', authMiddleware, dataController.saveFiles);
router.post('/download-data', authMiddleware, dataController.downloadData);
router.get('/get-files', authMiddleware, dataController.getFiles)
router.get(
  '/files/:folderId',
  authMiddleware,
  param('folderId').isMongoId(),
  dataController.getFilesByFolderId,
)

router.post(
  '/create-folder',
  authMiddleware,
  body('foldername').isString().trim().isLength({ min: 1, max: 255 }),
  body('rootFolderId').isString().trim().notEmpty(),
  dataController.createFolder,
)
router.get('/get-folders', authMiddleware, dataController.getFolders)
router.put(
  '/edit-folder/:id',
  authMiddleware,
  param('id').isMongoId(),
  body('formData').isString().trim().isLength({ min: 1, max: 255 }),
  dataController.editFolder,
)
router.put(
  '/edit-file/:id',
  authMiddleware,
  param('id').isMongoId(),
  body('formData').isString().trim().isLength({ min: 1, max: 255 }),
  dataController.editFile,
)
router.post(
  '/move-items',
  authMiddleware,
  body('data.rootFolderId').isString().trim().notEmpty(),
  body('data.items').isObject(),
  dataController.moveItems,
);
router.post(
  '/copy-items',
  authMiddleware,
  body('data.rootFolderId').isString().trim().notEmpty(),
  body('data.items').isObject(),
  dataController.copyItems,
);

module.exports = router
