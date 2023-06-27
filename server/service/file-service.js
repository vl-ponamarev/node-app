const multer = require('multer');

const FileModel = require('../models/file-model');

class FileService {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.UPLOAD_URL);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    }
  });

  upload = multer({ storage: this.storage }).single('mediacontent');

  async getFileByPostId(postId) {
    try {
      const file = await FileModel.findOne({ postId });
      if (!file) {
        return null;
      }
      return file.fileName;
    } catch (error) {
      throw new Error(
        `Failed to get file for post ${postId}: ${error.message}`
      );
    }
  }

  async createFile(postId, fileName, fileType, originalname) {
    try {
      const file = new FileModel({
        postId,
        fileName,
        fileType,
        originalname
      });
      await file.save();
      return file;
    } catch (error) {
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }

  async deleteFile(file) {
    try {
      await FileModel.deleteOne(file).then((res) => console.log(res));
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new FileService();
