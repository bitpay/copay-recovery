var app = angular.module("recoveryApp", ["recoveryApp.services", "ngLodash"]);
app.controller("recoveryController", function($rootScope, $scope, recoveryServices, lodash) {
  var scanResults;
  var wallet;
  var fee = 0.0001;
  var mainAddressObjects = [];
  var changeAddressObjects = [];
  $scope.beforeScan = true;
  $scope.availableOptions = [1, 2, 3, 4, 5, 6];
  $scope.availableNetworks = ['livenet', 'testnet'];
  $scope.copayers = [1];
  $scope.data = {};
  $scope.data.m = $scope.availableOptions[0];
  $scope.data.n = $scope.availableOptions[0];
  $scope.data.net = $scope.availableNetworks[0];
  $scope.data.gap = 20;
  $scope.data.backUp = [];
  $scope.data.passX = [];
  $scope.data.pass = [];

  $rootScope.$on('progress', function(name, data) {
    console.log(data);
  });

  $scope.change = function() {
    $scope.copayers = lodash.map(lodash.range(1, $scope.data.n + 1), function(i) {
      return i;
    });
  }

  $scope.showContent = function($fileContent, index) {
    $scope.data.backUp[index] = $fileContent;
  }

  $scope.proccessInputs = function() {
    $("#myModal").modal('show');
    $scope.beforeScan = true;

    var inputs = lodash.map(lodash.range(1, $scope.data.n + 1), function(i) {
      return {
        backup: $scope.data.backUp[i] || '',
        password: $scope.data.pass[i] || '',
        xPrivPass: $scope.data.passX[i] || '',
      }
    });

    try {
      wallet = recoveryServices.getWallet(inputs, $scope.data.m, $scope.data.n, $scope.data.net);
    } catch (ex) {
      $("#myModal").modal('hide');
      return showMessage(ex.message, 3);
    }
    showMessage('Scanning funds...', 1);

    var reportFn = function(data) {
      console.log('Report:', data);
    };

    var gap = +$scope.data.gap;
    gap = gap ? gap : 20;

    recoveryServices.scanWallet(wallet, gap, reportFn, function(err, res) {
      scanResults = res;
      if (err)
        return showMessage(err, 3);

      showMessage('Search completed', 2);
      $("#myModal").modal('hide');
      $scope.beforeScan = false;

      if ((scanResults.balance - fee) > 0)
        $scope.totalBalance = "Available balance: " + scanResults.balance.toFixed(8) + " BTC";
      else
        $scope.totalBalance = "Available balance: " + scanResults.balance.toFixed(8) + " BTC. Insufficents funds.";
    });
  }

  $scope.sendFunds = function() {
    var toAddress = $scope.addr;

    var rawTx;
    try {
      rawTx = recoveryServices.createRawTx(toAddress, scanResults, wallet, fee);
    } catch (ex) {
      return showMessage(ex.message, 3);
    }

    recoveryServices.txBroadcast(rawTx, network).then(function(response) {
        showMessage((scanResults.balance - fee).toFixed(8) + ' BTC sent to address: ' + toAddress, 2);
        console.log('Transaction complete.  ' + (scanResults.balance - fee) + ' BTC sent to address: ' + toAddress);
      },
      function(error) {
        showMessage('Could not broadcast transaction. Please, try later.', 3);
      });
  };

  function showMessage(message, type) {
    /*
			1 = status
			2 = success
			3 = error
		*/

    if (type == 1) {
      $scope.statusMessage = message;
      $scope.successMessage = null;
      $scope.errorMessage = null;
    } else if (type == 2) {
      $scope.successMessage = message;
      $scope.statusMessage = null;
      $scope.errorMessage = null;
    } else if (type == 3) {
      $scope.errorMessage = message;
      $scope.statusMessage = null;
      $scope.successMessage = null;
    }
  }
});
