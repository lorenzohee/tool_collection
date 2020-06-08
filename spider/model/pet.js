const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  title: {
    type: String
  },
  content: {
    type: String
  },
  url: {
    type: String
  },
  tags: Array,
  blogType: String,
  bannerUrl: String
}, {
    versionKey: false
  });


module.exports = mongoose.model('Ichong', PetSchema);
