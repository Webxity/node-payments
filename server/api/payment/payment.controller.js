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
 * Stripe Payment Gateway Integration
 * @param req - Request containing data from Angular Controller
 * @param res - Response get response of the action
 * @param next - Next Route/Function/Action/Request
 */
exports.postStripe = function (req, res, next) {
  var data = req.body;

  var stripeToken = req.body.stripeToken;
  console.log(stripeToken);
  stripe.charges.create({
    amount: '100', //in cents
    currency: 'usd',
    card: stripeToken,
    description: 'abcd'
  }, function (err, result) {
    if (err) throw err;
    console.log(result);
    if (result.paid === true) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  });
};

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
      expiration_date: data.transactions.expMonth + '/' + data.transactions.expYear
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

/**
 * Authorize.Net Integration
 * @param req
 * @param res
 */
exports.postAuthorizeNet = function (req, res) {
  var data = req.body;

  authorizeNetClient.submitTransaction({
    amount: data.transactions.amount
  }, {
    "creditCardNumber": data.transactions.cardNum,
    "cvv2": data.transactions.cvv,
    "expirationYear": data.transactions.expYear,
    "expirationMonth": data.transactions.expMonth
  }).then(function (response) {
    console.log(response.transactionId);
    return res.sendStatus(200);
  }, function (err) {
    console.log(err);
    return res.sendStatus(500);
  });
};

/**
 * 2 Checkout Integration
 * @param req
 * @param res
 */
exports.post2checkout = function (req, res) {
  var data = req.body;
  var token = data.twocheckoutToken;
  var tco = new Twocheckout({
    sellerId: secrets.twocheckout.sellerId,
    privateKey: secrets.twocheckout.privateKey,
    sandbox: secrets.twocheckout.mode === 'sandbox'
  });
  authorize = {
    "merchantOrderId": "0",
    "token": token,
    "currency": "USD",
    "total": 100,
    "billingAddr": {
      "name": "Iconic development",
      "addrLine1": "123 Test St",
      "city": "Columbus",
      "state": "Ohio",
      "zipCode": "43123",
      "country": "USA",
      "email": "example@2co.com",
      "phoneNumber": "5555555555"
    }
  };

  tco.checkout.authorize(authorize, function (error, data) {
    if (error) {
      console.log(error);
      return res.sendStatus(500);
    } else {
      console.log(data.transactionId);
      return res.sendStatus(200);
    }
  });
};
