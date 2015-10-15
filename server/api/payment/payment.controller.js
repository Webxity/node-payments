var secrets = require('../config/secrets.js'),
  http = require('http'),
  stripe = require("stripe")(secrets.stripe.secretKey),
  util = require('util'),
  braintree = require('braintree'),
  express = require('express'),
  router = express.Router(),
  casual = require('casual'),
  Twocheckout = require("2checkout-node"),
  authorizeNetClient = require('authorize-net')({
    API_LOGIN_ID: secrets.authorize.apiLoginId,
    TRANSACTION_KEY: secrets.authorize.transactionKey,
    testMode: secrets.authorize.sandbox
  }),
  _ = require("lodash");
var gateway = require('42-cent-paypal/index.js').factory;
var paypal = require('paypal-rest-sdk');
var assert = require('assert');
var mapKeys = require('42-cent-util').mapKeys;
var P = require('bluebird');
var assign = require('object-assign');
var cardType = require('credit-card-type');
var CreditCard = require('42-cent-model').CreditCard;
var Prospect = require('42-cent-model').Prospect;
var creditCardSchema = {
  creditCardNumber: 'number',
  expirationMonth: 'expire_month',
  expirationYear: 'expire_year',
  cvv2: 'cvv2',
  billingFirstName: 'first_name',
  billingLastName: 'last_name'
};
var GatewayError = require('42-cent-base').GatewayError;

var billingAddressSchema = {
  billingPhone: 'phone',
  billingAddress1: 'line1',
  billingAddress2: 'line2',
  billingCity: 'city',
  billingState: 'state',
  billingPostalCode: 'postal_code',
  billingCountry: 'country_code'
};


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
 * @param req - Request containing data from Angular Controller
 * @param res - Response get response of the action
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
 * @param req - Request containing data from Angular Controller
 * @param res - Response get response of the action
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
 * @param req - Request containing data from Angular Controller
 * @param res - Response get response of the action
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

/**
 * Paypal Integration
 * @param req
 * @param res
 */
exports.postPayPal = function (req, res) {
  var data = req.body.transactions;
  var prospect = new Prospect()
    .withBillingFirstName(casual.first_name)
    .withBillingLastName(casual.last_name)
    .withBillingEmailAddress(casual.email)
    .withBillingPhone(casual.phone)
    .withBillingAddress1(casual.address1)
    .withBillingAddress2(casual.address2)
    .withBillingCity(casual.city)
    .withBillingState(casual.state)
    .withBillingPostalCode('3212')
    .withBillingCountry(casual.country_code)
    .withShippingFirstName(casual.first_name)
    .withShippingLastName(casual.last_name)
    .withShippingAddress1(casual.address1)
    .withShippingAddress2(casual.address2)
    .withShippingCity(casual.city)
    .withShippingState(casual.state)
    .withShippingPostalCode('3212')
    .withShippingCountry(casual.country_code);

  var creditCards = {
    cc: new CreditCard()
      .withCreditCardNumber(data.cardNum)
      .withExpirationMonth(data.expMonth)
      .withExpirationYear(data.expYear)
      .withCvv2(data.cvv)
      .withCardHolder(casual.name)
  };

    var service;
    var amount = {
      amount: data.amount
    };
      service = gateway({CLIENT_ID: secrets.paypal.client_id, CLIENT_SECRET: secrets.paypal.client_secret, testMode: true});
      service.submitTransaction(amount, creditCards.cc, prospect)
        .then(function (transaction) {
          console.log(transaction._original.id);
          if(transaction._original.state){
            res.sendStatus(200);
          }
        })
        .catch(function (err) {
          console.log(err);
          res.sendStatus(500);
        });
};




