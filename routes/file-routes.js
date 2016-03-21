'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = (app, models) => {
  let File = models.File;
  let User = models.User;

  app.route('/users/:user/files')
  .get((req, res) => {
    File.find({author: req.params.user}, (err, files) => {
      if (err) return console.log(err);
      res.json({
        status: true,
        data: files
      });
      res.end();
    });
  })
  .post((req, res) => {
    var newFile = new File({
      file_name: req.body.fileName.toLowerCase(),
      author: req.body.author.toLowerCase()
    });
    newFile.save((err, file) => {
      if (err) return console.log(err);
      return file;
    })
    .then(file => {
      User.update({name: file.author}, {$push: {files: file._id}}, (err, user) => {
        if (err) return console.log(err);
      });

      let params = {
        Bucket: 'setheid401', /* required */
        Key: `"${file._id}"`, /* required */
        ACL: 'public-read',
        Body: `{content: "${req.body.content}"}`,
        ContentType: 'application/json'
      };

      s3.putObject(params, function(err, data) {
        if (err) return console.log(err, err.stack); // an error occurred
        console.log(data); // successful response
      });
      return file
    })
    .then(file => {
      File.findByIdAndUpdate(file._id, { $set: {s3_link: `https://s3-us-west-2.amazonaws.com/setheid401/${file._id}`}}, function (err, data) {
        if (err) return console.log(err);
        res.json({
          status: true,
          data: data
        });
        res.end();
      });
    });
  });

  app.route('/users/:user/files/:file')
  .get((req, res) => {
    var fileName = req.params.file.split('.json')[0];
    File.findOne({file_name: fileName, author: req.params.user}, (err, file) => {
      if (err) console.log(err);
      res.json({
        status: true,
        data: {url: file.s3_link},
        message: 'link found for file'
      });
      res.end();
    });
  })
  .put((req, res) => {
    var fileName = req.params.file.split('.json')[0];
    if (req.body.content === undefined) {
      File.update({file_name: fileName, author: req.params.user}, req.body, (err, file) => {
        if (err) return res.send(err);
        res.json({
          status: true,
          data: file,
          message: 'file updated'
        })
        return res.end();
      });
    }
    if (req.body.content) {
      File.findOne({file_name: fileName, author: req.params.user}, (err, file) => {
        if (err) return res.send(err);
        let params = {
          Bucket: 'setheid401', /* required */
          Key: `"${file._id}"`, /* required */
          ACL: 'public-read',
          Body: `{content: "${req.body.content}"}`,
          ContentType: 'application/json'
        };

        s3.putObject(params, function(err, data) {
          if (err) return console.log(err, err.stack); // an error occurred
          console.log(data);
          res.json({data: file});
          return res.end(); // successful response
        });
      });
    }
  })
  .delete((req, res) => {
    var fileName = req.params.file.split('.json')[0];
    File.findOne({file_name: fileName, author: req.params.user}, (err, result) => {
      if (err) return res.send(err);
      result.remove((err, file) => {
        if (err) return res.send(err);
        let params = {
          Bucket: 'setheid401', /* required */
          Key: `"${file._id}"` /* required */
        };

        s3.deleteObject(params, function(err, data) {
          if (err) return console.log(err, err.stack); // an error occurred
          console.log(data);
          res.json({message: `${file.file_name} removed`});
          res.end(); // successful response
        });
      });
    });
  });
};
