var app = angular.module("recoveryApp", ["recoveryApp.services", "ngLodash"]);
app.controller("recoveryController", function($rootScope, $scope, recoveryServices, lodash) {
  var scanResults;
  var wallet;
  var fee = 0.0001;
  var mainAddressObjects = [];
  var changeAddressObjects = [];

  var m = +$('#selectM').find('option:selected').attr('id');
  var n = +$('#selectN').find('option:selected').attr('id');
  var network = $('#selectNet').find('option:selected').attr('id');

  $rootScope.$on('progress', function(name, data) {
    console.log(data);
  });
  $scope.backUp = [];
  $scope.passX = [];
  $scope.pass = [];

  $('#selectM').change(function() {
    m = $(this).find('option:selected').attr('id');
  });

  $('#selectN').change(function() {
    n = $('#selectN').find('option:selected').attr('id');
    $('#block1, #block2, #block3, #block4, #block5, #block6').hide();

    for (var i = 1; i <= n; i++)
      $('#block' + i).show();
  });

  $('#selectNet').change(function() {
    network = $(this).find('option:selected').attr('id');
  });

  $scope.showContent = function($fileContent, index) {
    $scope.backUp[index] = $fileContent;
  }

  $scope.proccessInputs = function() {
    // $("#myModal").modal();
    hideMessage();
    $("#sendBlock").hide();
    $('#inputs').show();
    $('#back').hide();

    var inputs = lodash.map(lodash.range(1, m + 1), function(i) {
      return {
        backup: $scope.backUp[i] || '',
        password: $scope.pass[i] || '',
        xPrivPass: $scope.passX[i] || '',
      }
    });

    try {
      wallet = recoveryServices.getWallet(inputs, m, n, network);
    } catch (ex) {
      return showMessage(ex.message, 3);
    }
    showMessage('Scanning funds...', 1);

    recoveryServices.scanWallet(wallet, function(err, res) {
      scanResults = res;
      if (err)
        return showMessage(err, 3);

      showMessage('Search completed', 2);
      $('#inputs').hide();
      $('#sendBlock').show();
      $("#button2").show();
      $("#back").show();
      // $("#myModal").modal();

      if ((scanResults.balance - fee) > 0)
        $scope.totalBalance = "Available balance: " + scanResults.balance + " BTC";
      else
        $scope.totalBalance = "Available balance: " + scanResults.balance + " BTC. Insufficents to make a transaction.";
    });
  }

  $scope.sendFunds = function() {
    var toAddress = $scope.addr;

    var rawTx;
    try {
      rawTx = recoveryServices.createRawTx(toAddress, scanResults, wallet);
    } catch (ex) {
      return showMessage(ex.message, 3);
    }

    recoveryServices.txBroadcast(rawTx, network).then(function(response) {
        showMessage((scanResults.balance - fee) + ' BTC sent to address: ' + toAddress, 2);
        console.log('Transaction complete.  ' + (scanResults.balance - fee) + ' BTC sent to address: ' + toAddress);
      },
      function(error) {
        showMessage('Could not broadcast transaction. Please, try later.', 3);
      });
  };

  function hideMessage() {
    $('#errorMessage').hide();
    $('#successMessage').hide();
    $('#statusMessage').hide();
  }

  function showMessage(message, type) {
    /*
			1 = status
			2 = success
			3 = error
		*/
    if (type == 1) {
      $scope.statusMessage = message;
      $('#statusMessage').show();
      $('#errorMessage').hide();
      $('#successMessage').hide();
    } else if (type == 2) {
      $scope.successMessage = message;
      $('#successMessage').show();
      $('#errorMessage').hide();
      $('#statusMessage').hide();
    } else if (type == 3) {
      $scope.errorMessage = message;
      $('#errorMessage').show();
      $('#successMessage').hide();
      $('#statusMessage').hide();
    }
  }
});