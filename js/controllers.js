var app = angular.module("recoveryApp", ["recoveryApp.services", "ngLodash"]);
app.controller("recoveryController", function($scope, recoveryServices, lodash) {
  var scanResults;
  var wallet;
  var fee = 0.0001;
  var totalBtc = 0;
  var mainAddressObjects = [];
  var changeAddressObjects = [];
  var m = +$('#selectM').find('option:selected').attr('id');
  var n = +$('#selectN').find('option:selected').attr('id');
  var network = $('#selectNet').find('option:selected').attr('id');

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
  $('.checkFile').change(function() {
    for (var j = 1; j <= n; j++) {
      if ($('#checkFile' + j).prop('checked')) {
        $('#backup' + j).hide();
        $('#backupFile' + j).show();
      } else {
        $('#backup' + j).show();
        $('#backupFile' + j).hide();
      }
    }
  });

  $('.checkPassX').change(function() {
    for (var k = 1; k <= n; k++) {
      if ($('#checkPass' + k).prop('checked'))
        $('#passwordX' + k).show();
      else {
        $('#passwordX' + k).hide();
        $('#passX' + k).val("");
        $scope.passX[k] = "";
      }
    }
  });

  $scope.showContent = function($fileContent, index) {
    $scope.backUp[index] = $fileContent;
    $('#backup' + index).show();
    $('#backupFile' + index).hide();
    $('#check' + index).prop('checked', false);
  }

  $scope.proccessInputs = function() {
    hideMessage();
    $("#button2").hide();
    totalBtc = 0;
    console.log('fuck ', $scope.backUp, $scope.pass, $scope.passX);
    var inputs = lodash.map(lodash.range(1, m + 1), function(i) {
      return {
        backup: $scope.backUp[i],
        password: $scope.pass[i],
        xPrivPass: $scope.passX[i]
      }
    });
    try {
      wallet = recoveryServices.getWallet(inputs, m, n, network);
    } catch (ex) {
      showMessage(ex.message, 3);
      return;
    }
    $scope.textArea = 'Main addresses:\n\n';

    showMessage('Scanning funds...', 1);
    recoveryServices.scanWallet(wallet, function(err, res) {
      scanResults = res;
      console.log(scanResults);
      if (err)
        return showMessage(err, 3);

      showMessage('Search completed', 2);
      $("#button2").show();
      if ((scanResults.balance - fee) > 0)
        $scope.totalBalance = "Available amount: " + parseInt((scanResults.balance * 1e8).toFixed(0)) + " Satoshis";
      else
        $scope.totalBalance = "Available amount: " + parseInt((scanResults.balance * 1e8).toFixed(0)) + " Satoshis." + " Insufficents to make a transaction.";

      console.log("Search complete.");
    });
  }

  $scope.sendFunds = function() {
    var addr = $scope.addr;

    var validation = recoveryServices.validateAddress(addr, scanResults.balance, network);
    if (validation == true) {
      showMessage2('Creating transaction to retrieve total amount...', 1);

      var rawTx;
      try {
        rawTx = recoveryServices.createRawTx(addr, scanResults, wallet);
      } catch (ex) {
        throw new Error("Could not create transaction.", ex);
      }

      recoveryServices.txBroadcast(rawTx, network).then(function(response) {
          showMessage2((scanResults.balance * 1e8).toFixed(0) + ' Satoshis sent to address: ' + addr, 2);
          console.log('Transaction complete.  ' + (scanResults.balance * 1e8 - fee).toFixed(0) + ' BTC sent to address: ' + addr);
        },
        function(error) {
          showMessage2('Is not possible make the transaction. Please, try later.', 3);
          console.log('Is not possible make the transaction. Please, try later.');
        });
    } else
      showMessage2(validation, 3);
  }



  function printFeedBack(addressObject) {
    var totalFound = 0;

    lodash.each(addressObject, function(ao) {
      if (ao.utxo.length > 0) {

        $scope.textArea += 'Address: ' + ao.address + '\n';
        $scope.textArea += 'Path: ' + ao.path + '\n';
        $scope.textArea += 'Balance: ' + ao.balance + '\n';
        $scope.textArea += 'Unconfirmed balance: ' + ao.unconfirmedBalance + '\n\n';
        lodash.each(ao.utxo, function(u) {
          totalBtc += u.amount;
        })
        console.log('@@@@@@ Addresses with unspent amount:', ao);
        totalFound++;
      }
    });
    $scope.textArea += 'Addresses with unspent amount: ' + totalFound + '\n********************************************\n';
  }

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
    }
    if (type == 2) {
      $scope.successMessage = message;
      $('#successMessage').show();
      $('#errorMessage').hide();
      $('#statusMessage').hide();
    }
    if (type == 3) {
      $scope.errorMessage = message;
      $('#errorMessage').show();
      $('#successMessage').hide();
      $('#statusMessage').hide();
    }
  }

  function showMessage2(message, type) {
    /*
			1 = status
			2 = success
			3 = error
		*/
    if (type == 1) {
      $scope.statusMessage2 = message;
      $('#statusMessage2').show();
      $('#errorMessage2').hide();
      $('#successMessage2').hide();
    }
    if (type == 2) {
      $scope.successMessage2 = message;
      $('#successMessage2').show();
      $('#errorMessage2').hide();
      $('#statusMessage2').hide();
    }
    if (type == 3) {
      $scope.errorMessage2 = message;
      $('#errorMessage2').show();
      $('#successMessage2').hide();
      $('#statusMessage2').hide();
    }
  }

});