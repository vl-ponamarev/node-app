const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
