'use strict';

const express = require('express');
const app = express();
const models = require('./models');
const bodyParser = require('body-parser');
// let router = express.Router()

app.use(bodyParser.json());

require('./routes/file-routes')(app, models);
require('./routes/user-routes')(app, models);

app.listen(3000, (err) => {
  if (err) return console.log(err);
  console.log('server started');
});
