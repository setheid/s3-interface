'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = (app, models) => {
  let User = models.User;
  let File = models.File;

  app.route('/users')
  .get((req, res) => {
    User.find({})
    .populate('files')
    .exec()
    .then(users => {
      res.json({
        status: true,
        data: users
      });
      res.end();
    })
    .catch(err => {
      res.send(err);
    });
  })
  .post((req, res) => {
    File.find({author: req.body.name.toLowerCase()}, (err, files) => {
      if (!files) {
        var newUser = new User({name: req.body.name.toLowerCase()});
        newUser.save((err, user) => {
          if (err) return res.send(err);
          res.json({
            status: true,
            data: user
          })
          return res.end();
        });
      }
      var newUser = new User({name: req.body.name.toLowerCase(), files: files.map(file => file._id)});
      newUser.save((err, user) => {
        if (err) return console.log(err);
        res.json({
          status: true,
          data: user
        })
        res.end();
      });
    });
  });

  app.route('/users/:user')
  .get((req, res) => {
    User.findOne({name: req.params.user})
    .populate('files')
    .exec()
    .then(user => {
      res.json({
        status: true,
        data: user
      });
      res.end();
    })
    .catch(err => {
      res.send(err);
    });
  })
  .put((req, res) => {
    User.update({name: req.params.user}, req.body, (err, user) => {
      if (err) return res.send(err);
      res.json({
        status: true,
        data: user
      });
      res.end();
    });
  })
  .delete((req, res) => {
    User.findOne({name: req.params.user}, (err, user) => {
      if (err) return console.log(err);
      user.remove((err, user) => {
        if (err) return console.log(err);
        let counter = 0;
        user.files.forEach(ele => {
          console.log(ele);
          let params = {
            Bucket: 'setheid401', /* required */
            Key: `"${ele}"` /* required */
          };
          s3.deleteObject(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });
          counter += 1;
          if (counter === user.files.length) return user;
        });
      })
      .then(user => {
        let counter = 0;
        File.find({author: req.params.user}, (err, files) => {
          if (err) return console.log(err);
          files.forEach(file => {
            file.remove((err, file) => {
              if (err) return console.log(err);
            });
            counter += 1;
            if (counter === files.length) {
              res.json({message: `${user.name} removed`});
              res.end();
            }
          });
        });
      });
    });
  });
}
