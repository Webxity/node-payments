'use strict';

var express = require('express');
var controller = require('./payment.controller');

var router = express.Router();

router.post('/BrainTree', controller.postBrainTree);

module.exports = router;
