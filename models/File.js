'use strict';

module.exports = (mongoose, models) => {
  let filesSchema = new mongoose.Schema({
    file_name: String,
    author: String,
    s3_link: String
  });
  let File = mongoose.model('File', filesSchema);
  models.File = File;
};
