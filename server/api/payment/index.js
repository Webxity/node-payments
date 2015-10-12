'use strict';

var express = require('express');
var controller = require('./payment.controller');

var router = express.Router();

router.post('/BrainTree', controller.postBrainTree);
router.post('/Stripe', controller.postStripe);
router.post('/Authorize', controller.postAuthorizeNet);
router.post('/2Checkout', controller.post2checkout);

module.exports = router;
