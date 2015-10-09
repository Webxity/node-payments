'use strict';

angular.module('nodePaymentsApp')
  .controller('PaymentCtrl', function ($scope, $http, $stateParams) {
    $scope.transaction = {
      description: '',
      amount: '',
      cardNum: '',
      cvv: '',
      expYear: '',
      expMonth: ''
    };

    $scope.pay = function () {
      $http({
        method: 'POST',
        url: '/api/payments/'+$stateParams.method,
        dataType: 'json',
        data: {
          transactions: $scope.transaction
        }
      }).success(function (res) {
        alert('Transaction completed');
      }).error(function (errs) {
        alert('Some error occured, check your card number/expiry date or your balance.');
      });
    };
  });
