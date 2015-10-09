'use strict';

angular.module('nodePaymentsApp')
  .controller('MainCtrl', function ($scope, $http, $state) {
    $scope.data = {
      gateway: 'Paypal'
    };

    $scope.nextpage = function () {
      var method = $scope.data.gateway;
      $state.go('payment', {method: method});
    };

  });
