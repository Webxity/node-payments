'use strict';

angular.module('nodePaymentsApp')
  .controller('PaymentCtrl', function ($scope, $http, $stateParams, APP_CONFIG) {
    $scope.transaction = {
      description: '',
      amount: '',
      cardNum: '',
      cvv: '',
      expYear: '',
      expMonth: ''
    };


    $scope.pay = function () {
      if ($stateParams.method === '2Checkout') {
        TCO.loadPubKey('sandbox', function () {
          tokenRequest();
        });
      }
      else if ($stateParams.method === 'Stripe') {
        stripefunc();
      }
      else {
        $http({
          method: 'POST',
          url: '/api/payments/' + $stateParams.method,
          dataType: 'json',
          data: {
            transactions: $scope.transaction
          }
        }).success(function (res) {
          alert('Transaction completed');
        }).error(function (errs) {
          alert('Some error occured, check your card number/expiry date or your balance.');
        });
      }
    };

    var tokenRequest = function () {
      // Setup token request arguments
      var args = {
        sellerId: APP_CONFIG.twocheckout.sellerId,
        publishableKey: APP_CONFIG.twocheckout.publishableKey,
        ccNo: $scope.transaction.cardNum,
        cvv: $scope.transaction.cvv,
        expMonth: $scope.transaction.expMonth,
        expYear: $scope.transaction.expYear
      };

      var successCallback = function (data) {
        var token = data.response.token.token;

        $http({
          method: 'POST',
          url: '/api/payments/' + $stateParams.method,
          dataType: 'json',
          data: {
            transactions: $scope.transaction,
            twocheckoutToken: token
          }
        }).success(function (res) {
          alert('Transaction completed');
        }).error(function (errs) {
          alert('Some error occured, check your card number/expiry date or your balance.');
        });
      };

      var errorCallback = function (data) {
        if (data.errorCode === 200) {
          // This error code indicates that the ajax call failed. We recommend that you retry the token request.
          console.log(data, data.errorMsg);
          console.log(data.errorMsg);
        } else {
          console.log(data);
          console.log(data.errorMsg);
        }
      };

      // Make the token request
      TCO.requestToken(successCallback, errorCallback, args);
    };

    var stripefunc = function () {
      Stripe.setPublishableKey(APP_CONFIG.stripe.publishableKey);
      var form = angular.element($('#payment-form'));
      console.log(form, Stripe);
      Stripe.card.createToken(form, stripeResponseHandler);
    };

    function stripeResponseHandler(status, data) {
      // response contains id and card, which contains additional card details
      var token = data.id;
      console.log(token);
      $http({
        method: 'POST',
        url: '/api/payments/' + $stateParams.method,
        dataType: 'json',
        data: {
          transactions: $scope.transaction,
          stripeToken: token
        }
      }).success(function (res) {
        alert('Transaction completed');
      }).error(function (errs) {
        alert('Some error occured, check your card number/expiry date or your balance.');
      });
    }
  });
