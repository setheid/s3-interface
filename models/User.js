'use strict';

module.exports = (mongoose, models) => {
  let usersSchema = new mongoose.Schema({
    name: String,
    files: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}]
  });
  let User = mongoose.model('User', usersSchema);
  models.User = User;
};
