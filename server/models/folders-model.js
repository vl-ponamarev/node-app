const mongoose = require('mongoose')

const foldersSchema = new mongoose.Schema({
  foldername: {
    type: String,
    required: true,
  },
  rootFolderId: {
    type: String,
    default: 'null',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
})

const Folder = mongoose.model('Folder', foldersSchema)

module.exports = Folder
