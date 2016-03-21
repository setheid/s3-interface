'use strict';

let mongoose = require('mongoose');

let DB_PORT = process.env.MONGOLAB_URI || 'mongodb://localhost/db';
mongoose.connect(DB_PORT);

let models = {};

require('./User')(mongoose, models);
require('./File')(mongoose, models);

module.exports = models;
