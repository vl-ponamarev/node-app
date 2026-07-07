const { validationResult } = require('express-validator')
const DataService = require('../service/data-service')
const ApiError = require('../exceptions/api-error')

function ensureValid(req, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(ApiError.BadRequest('Validation error', errors.array()));
    return false;
  }
  return true;
}

class DataController {
  async saveFiles(req, res, next) {
    try {
      DataService.upload(req, res, async err => {
        if (err) {
          return next(err);
        }
        const files = req.files;
        const owner = req.user.id;
        const folder = req.body.folder;

        const fileDocs = files?.map(file => ({
          owner,
          folderId: folder,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          originalname: file.originalname,
        }));
        const result = await DataService.createMultipleFiles(fileDocs);
        return res.json(result);
      });
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req, res, next) {
    try {
      const files = await DataService.getFiles();
      return res.json(files);
    } catch (error) {
      next(error);
    }
  }

  async getFilesByFolderId(req, res, next) {
    if (!ensureValid(req, next)) return;
    try {
      const files = await DataService.getFilesByFolderId(req.params.folderId);
      return res.json(files);
    } catch (error) {
      next(error);
    }
  }

  async getFolders(req, res, next) {
    try {
      const folders = await DataService.getFolders();
      return res.json(folders);
    } catch (error) {
      next(error);
    }
  }

  async createFolder(req, res, next) {
    if (!ensureValid(req, next)) return;
    try {
      const response = await DataService.createFolder({
        ...req.body,
        owner: req.user.id,
      });
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async editFolder(req, res, next) {
    if (!ensureValid(req, next)) return;
    try {
      const post = await DataService.editFolder(req.params.id, req.body.formData, req.user);
      return res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async editFile(req, res, next) {
    if (!ensureValid(req, next)) return;
    try {
      const post = await DataService.editFile(req.params.id, req.body.formData, req.user);
      return res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async deleteFolders(req, res, next) {
    try {
      await DataService.deleteFolders(req.body, req.user);
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  async deleteFiles(req, res, next) {
    try {
      const response = await DataService.deleteFiles(req.body, req.user);
      return res.status(200).json({ message: 'Success', response });
    } catch (e) {
      next(e);
    }
  }

  async downloadData(req, res, next) {
    try {
      await DataService.download(req.body, res, req.user.id);
    } catch (e) {
      next(e);
    }
  }

  async moveItems(req, res, next) {
    if (!ensureValid(req, next)) return;
    try {
      const response = await DataService.moveItems(req.body, req.user);
      return res.status(200).json({ message: 'Success', response });
    } catch (e) {
      next(e);
    }
  }

  async copyItems(req, res, next) {
    if (!ensureValid(req, next)) return;
    try {
      const response = await DataService.copyItems(req.body, req.user);
      return res.status(200).json({ message: 'Success', response });
    } catch (e) {
      next(e);
    }
  }
}
module.exports = new DataController()
