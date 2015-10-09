'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PaymentSchema = new Schema({
  description: String,
  amount: Number,
  cardNumber: Number,
  ccv: Number,
  expiryYear: Number,
  expiryMonth: Number
});

module.exports = mongoose.model('Payment', PaymentSchema);
