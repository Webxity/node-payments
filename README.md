# node-payments
A reusable repository of most widely used payment gateways. Such as Paypal Pro, Braintree, 2Checkout, Stripe and Authorize.net. APIs can be used to easily integrate with any node web app.

>

## Install

```
$ npm install && bower install
```

## Usage

Create a file `secrets.js` and move it to `server/api/config`. All the payment gateways credentials go here

```
var secrets = module.exports = {

  appUrl: 'http://localhost:9000',

  db: process.env.MONGODB || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  paypal: {
    mode: 'sandbox', //sandbox/live
    client_id: process.env.PAYPAL_ID || '',
    client_secret: process.env.PAYPAL_SECRET || '',
    returnUrl: process.env.PAYPAL_RETURN_URL || '/api/pay/paypal/success',
    cancelUrl: process.env.PAYPAL_CANCEL_URL || '/api/pay/paypal/cancel'
  },

  stripe: {
    secretKey: process.env.STRIPE_SKEY || '',
    publishableKey: process.env.STRIPE_PKEY || ''
  },

  twocheckout: {
    publishableKey: '',
    privateKey: '',
    sellerId: '',
    mode: 'sandbox'
  },

  authorize: {
    apiLoginId: '',
    transactionKey: '',
    sandbox: true
  },

  braintree: {
    merchantId: '',
    publicKey: '',
    privateKey: '',
    sandbox: true
  }
};

```

(Atleast required for this repo) Create a file `config.js` and move it to `client/app/config.js` for stripe and 2checkout

```
(function() {
  'use strict';

  angular.module('nodePaymentsApp')
  .constant('APP_CONFIG', {
    stripe: {
      publishableKey: ''
    },
    twocheckout: {
      publishableKey: '',
      sellerId: ''
    }
  });

})();
```

Run

```
$ grunt serve
```

## License

MIT © [Webxity](https://github.com/Webxity)
