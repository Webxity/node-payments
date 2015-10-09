var secrets = require('../config/secrets.js'),
  http = require('http'),
  stripe = require("stripe")(secrets.stripe.secretKey),
  util = require('util'),
  braintree = require('braintree'),
  express = require('express'),
  router = express.Router(),
  Twocheckout = require("2checkout-node"),
  authorizeNetClient = require('authorize-net')({
  API_LOGIN_ID: secrets.authorize.apiLoginId,
  TRANSACTION_KEY: secrets.authorize.transactionKey,
  testMode: secrets.authorize.sandbox
  }),
  _ = require("lodash");

/**
 * Braintree API Integration - Gets the amount, credit card info and process the payment
 * @param req Request
 * @param res Response
 * @Author - Webxity
 * @returns {*}
 */
exports.postBrainTree = function (req, res) {

  var data = req.body;

  //Connection to braintree API
  var gateway = braintree.connect({
    environment: secrets.braintree.sandbox ? braintree.Environment.Sandbox : braintree.Environment.Production,
    merchantId: secrets.braintree.merchantId,
    publicKey: secrets.braintree.publicKey,
    privateKey: secrets.braintree.privateKey
  });
  //This is where the transaction take place
  gateway.transaction.sale({
    amount: data.transactions.amount,
    credit_card: {
      number: data.transactions.cardNum,
      cvv: data.transactions.cvv,
      expiration_date: data.transactions.expMonth+'/'+data.transactions.expYear
    }
  }, function (err, result) {

    if (err) throw err;

    if (result.success) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  });
  //End Transaction
};
