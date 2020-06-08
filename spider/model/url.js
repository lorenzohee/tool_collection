const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  path: String,
  created_at: String,
  read: Boolean,
}, {
    versionKey: false
  });


module.exports = mongoose.model('Url', UrlSchema);
