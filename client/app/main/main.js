'use strict';

angular.module('nodePaymentsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('payment', {
        url: '/payment',
        params: {
          method: null
        },
        templateUrl: 'app/payment/payment.html',
        controller: 'PaymentCtrl'
      });
  });
