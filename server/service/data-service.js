const multer = require('multer')
const fs = require('fs')
const util = require('util')
const unlinkAsync = util.promisify(fs.unlink)
const path = require('path')
const { ObjectId } = require('mongodb');
const FilesStoreModel = require('../models/files-store-model');
const FolderModel = require('../models/folders-model');
const archiver = require('archiver');
const ApiError = require('../exceptions/api-error');

class DataService {
  ownerFilter() {
    return {};
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.UPLOAD_URL);
    },
    filename: (req, file, cb) => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
  });

  upload = multer({ storage: this.storage }).array('mediacontent', 50);

  async getFiles() {
    try {
      const files = await FilesStoreModel.find({});
      return files;
    } catch (error) {
      throw new Error(`Failed to get files: ${error.message}`);
    }
  }

  async getFilesByFolderId(folderId) {
    try {
      const files = await FilesStoreModel.find({ folderId });
      return files;
    } catch (error) {
      throw new Error(`Failed to get files: ${error.message}`);
    }
  }

  async createMultipleFiles(files) {
    try {
      const savedFiles = await FilesStoreModel.insertMany(files);
      return savedFiles;
    } catch (error) {
      throw new Error(`Failed to create files: ${error.message}`);
    }
  }

  async getFolders() {
    try {
      const folders = await FolderModel.find({});
      return folders;
    } catch (error) {
      throw new Error(`Failed to get folders: ${error.message}`);
    }
  }

  async createFolder(folder) {
    try {
      const result = await FolderModel.create(folder);
      return {
        success: true,
        message: 'Folder created successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error saving folder to database',
        details: error.message,
      };
    }
  }

  async editFolder(folderId, foldername, user) {
    const post = await FolderModel.findOneAndUpdate(
      { _id: folderId, ...this.ownerFilter(user) },
      { foldername },
      {
        new: true,
        returnOriginal: false,
      },
    );
    if (!post) {
      throw ApiError.Forbidden();
    }
    return post;
  }

  async editFile(fileId, originalname, user) {
    const post = await FilesStoreModel.findOneAndUpdate(
      { _id: fileId, ...this.ownerFilter(user) },
      { originalname },
      {
        new: true,
        returnOriginal: false,
      },
    );
    if (!post) {
      throw ApiError.Forbidden();
    }
    return post;
  }

  async moveItems(data, user) {
    try {
      const folders = data.data?.items?.folders;
      const files = data.data?.items?.files;

      if (Array.isArray(folders)) {
        const foldersIds = folders.map(id => ObjectId.createFromHexString(id));
        const filesFilter = { _id: { $in: files }, ...this.ownerFilter(user) };

        const foldersResult = await FolderModel.updateMany(
          { _id: { $in: foldersIds }, ...this.ownerFilter(user) },
          { $set: { rootFolderId: data.data?.rootFolderId } },
        );

        const filesResult = await FilesStoreModel.updateMany(filesFilter, {
          $set: { folderId: data.data?.rootFolderId },
        });
        return { foldersResult, filesResult };
      } else {
        console.error('data.data.items.folders is not an array or is undefined');
      }
    } catch (err) {
      return { success: false, error: 'Error moving items', details: err.message };
    }
  }

  async copyItems(data, user) {
    try {
      const { folders: folderIds, files: fileIds } = data.data?.items || {};
      const newRootFolderId = data.data?.rootFolderId || {};
      const ownerFilter = this.ownerFilter(user);
      const owner = user.id;

      async function copyFolder(folderId, newRootFolderId) {
        const folder = await FolderModel.findOne({ _id: folderId, ...ownerFilter });
        if (!folder) return null;
        const newFolder = await FolderModel.create({
          ...folder.toObject(),
          _id: undefined,
          owner,
          rootFolderId: newRootFolderId,
        });
        const files = await FilesStoreModel.find({ folderId, ...ownerFilter });
        for (const file of files) {
          await FilesStoreModel.create({
            ...file.toObject(),
            _id: undefined,
            owner,
            folderId: newFolder._id,
          });
        }
        const nestedFolders = await FolderModel.find({ rootFolderId: folder._id, ...ownerFilter });
        for (const nestedFolder of nestedFolders) {
          await copyFolder(nestedFolder._id, newFolder._id);
        }

        return newFolder;
      }

      for (const folderId of folderIds) {
        await copyFolder(folderId, newRootFolderId);
      }

      for (const fileId of fileIds) {
        const file = await FilesStoreModel.findOne({ _id: fileId, ...ownerFilter });
        if (file) {
          await FilesStoreModel.create({
            ...file.toObject(),
            _id: undefined,
            owner,
            folderId: newRootFolderId,
          });
        }
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error copying items', details: err.message };
    }
  }

  async deleteFolders(foldersId, user) {
    try {
      const ids = Array.isArray(foldersId) ? foldersId : foldersId?.data || [];
      const ownerFilter = this.ownerFilter(user);

      const res = await FolderModel.deleteMany({ _id: { $in: ids }, ...ownerFilter });

      for (const folderId of ids) {
        const filesToDelete = await FilesStoreModel.find({ folderId, ...ownerFilter });
        if (filesToDelete.length > 0) {
          await this.deleteFiles(filesToDelete.map(f => f._id), user);
        }

        const nestedFolders = await FolderModel.find({ rootFolderId: folderId, ...ownerFilter });
        if (nestedFolders.length > 0) {
          await this.deleteFolders(nestedFolders.map(folder => folder._id), user);
        }
      }

      return res;
    } catch (err) {
      return { success: false, error: 'Error deleting folder in database', details: err.message };
    }
  }

  async deleteFiles(files, user) {
    try {
      const ids = Array.isArray(files) ? files : files?.data || [];

      const filesToDelete = await FilesStoreModel.find({
        _id: { $in: ids },
        ...this.ownerFilter(user),
      });

      const deletePromises = filesToDelete.map(async file => {
        try {
          await unlinkAsync(`${process.env.UPLOAD_URL}/${file.filename}`);
        } catch (err) {
          console.error(`Failed to delete file: ${file.filename}`, err);
        }
      });
      await Promise.all(deletePromises);

      const res = await FilesStoreModel.deleteMany({
        _id: { $in: filesToDelete.map(f => f._id) },
      });

      return {
        status: 'OK',
        message: 'Files deleted successfully',
        deletedCount: res.deletedCount,
      };
    } catch (err) {
      console.error(err);
      throw new Error(`Failed to delete files: ${err.message}`);
    }
  }

  async downloadFile(fileId, res) {
    try {
      const file = await FilesStoreModel.findOne({ _id: fileId });
      if (file) {
        const { filename } = file;
        const filePath = path.join(process.env.UPLOAD_URL, filename);
        res.sendFile(filePath, err => {
          if (err) {
            if (err.code === 'ENOENT') {
              res.status(404).send('File not found');
            } else {
              res.status(500).send('Error sending file');
            }
          }
        });
      }
    } catch (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async download(data, res, requestingUserId) {
    const { files, folders } = data;

    try {
      const tempDir = path.join(__dirname, 'temp', `${requestingUserId}-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      if (files && files.length > 0) {
        for (const fileId of files) {
          const file = await FilesStoreModel.findOne({ _id: fileId });
          if (file) {
            const { filename, originalname } = file;
            const sourcePath = path.join(process.env.UPLOAD_URL, filename);
            const destPath = path.join(tempDir, originalname || filename);

            if (fs.existsSync(sourcePath)) {
              fs.copyFileSync(sourcePath, destPath);
            } else {
              console.warn(`File not found: ${sourcePath}`);
            }
          } else {
            console.warn(`File not found in database: ${fileId}`);
          }
        }
      }

      if (folders && folders.length > 0) {
        for (const folderId of folders) {
          await createFolderStructure(folderId, tempDir);
        }
      }

      const archive = archiver('zip', { zlib: { level: 9 } });

      res.attachment(`download.zip`);

      archive.on('error', err => {
        console.error('Archive error:', err);
        throw err;
      });

      archive.pipe(res);
      archive.directory(tempDir + '/', false);

      await archive.finalize();

      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to download:', error.message);
      res.status(500).send('Failed to download.');
    }
  }
}

async function createFolderStructure(folderId, parentPath) {
  const folder = await FolderModel.findOne({ _id: folderId });
  if (!folder) return;
  const currentFolderPath = path.join(parentPath, folder.foldername);
  fs.mkdirSync(currentFolderPath, { recursive: true });

  const subFolders = await FolderModel.find({ rootFolderId: folderId });
  for (const subFolder of subFolders) {
    await createFolderStructure(subFolder._id, currentFolderPath);
  }

  const files = await FilesStoreModel.find({ folderId: folder._id });
  for (const file of files) {
    const sourceFilePath = path.join(process.env.UPLOAD_URL, file.filename);
    const destinationFilePath = path.join(currentFolderPath, file.originalname || file.filename);
    try {
      fs.copyFileSync(sourceFilePath, destinationFilePath);
    } catch (error) {
      console.error(`Error copying file ${file.filename}:`, error);
    }
  }
}

module.exports = new DataService();
