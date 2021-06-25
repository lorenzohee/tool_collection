const mongoose = require('mongoose')

const UrlSchema = new mongoose.Schema(
  {
    path: String,
    created_at: String,
    read: Boolean,
    from: String, //来自哪个网站
  },
  {
    versionKey: false,
  },
)

module.exports = mongoose.model('SmartHomeUrl', UrlSchema)
