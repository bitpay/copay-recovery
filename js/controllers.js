var app = angular.module("recoveryApp", ["recoveryApp.services", "ngLodash"]);
app.controller("recoveryController", function($scope, recoveryServices, lodash){
	var network = '';
	var fee = 0.0001;
	var totalBtc = 0;
	var mainAddressObjects = [];
	var changeAddressObjects = [];
	var m = $('#selectM').find('option:selected').attr('id');
	var n = $('#selectN').find('option:selected').attr('id');

	$scope.backUp = [];
	$scope.passX = [];

	$('#selectM').change(function(){
		m = $(this).find('option:selected').attr('id');
	});

	$('#selectN').change(function() {
		n = $('#selectN').find('option:selected').attr('id');
		$('#block1, #block2, #block3, #block4, #block5, #block6').hide();

   		for (var i=1; i<=n ; i++)
   			$('#block'+i).show();
	});

	$('.checkFile').change(function(){
		for (var j=1; j<=n ;j++){
			if($('#checkFile'+j).prop('checked')){
				$('#backup'+j).hide();
				$('#backupFile'+j).show();
			}
			else{
				$('#backup'+j).show();
				$('#backupFile'+j).hide();
			}
		}
	});

	$('.checkPassX').change(function(){
		for(var k=1; k<=n ;k++){
			if($('#checkPass'+k).prop('checked'))
				$('#passwordX'+k).show();
			else{
				$('#passwordX'+k).hide();
				$('#passX'+k).val("");
				$scope.passX[k] = "";
			}
		}
	});

	$scope.showContent = function($fileContent, index){
    	$scope.backUp[index] = $fileContent;
    	$('#backup'+index).show();
		$('#backupFile'+index).hide();
		$('#check'+index).prop('checked', false);
	}

	$scope.getDataInput = function(){
		var backUps = [];
		var passwords = [];
		var passwordsX = [];
		hideMessage();
		$("#button2").hide();
		totalBtc = 0;

		backUps.push($scope.backUp[1],$scope.backUp[2],$scope.backUp[3],$scope.backUp[4],$scope.backUp[5],$scope.backUp[6]);
		passwords.push($scope.pass1,$scope.pass2,$scope.pass3,$scope.pass4,$scope.pass5,$scope.pass6);
		passwordsX.push($scope.passX[1], $scope.passX[2], $scope.passX[3], $scope.passX[4], $scope.passX[5], $scope.passX[6]);
		
		backUps = lodash.remove(backUps,function (r){
			return !lodash.isUndefined(r);
		});

		passwords = lodash.remove(passwords,function (r){
			return !lodash.isUndefined(r);
		});

		if(backUps.length > 0 && passwords.length > 0){
			var dataInput = [];
			var data = {};

			for(var i=0; i<n ;i++){
				data = {
					backup: backUps[i],
					password: passwords[i],
					passwordX: passwordsX[i]
				};
				dataInput.push(data);
			}

			console.log("Validation in progress...");
			var validation = recoveryServices.validateInput(dataInput, m, n);

			if(validation == true){
				var backupData = [];

				lodash.each(dataInput, function(d){
					backupData.push(recoveryServices.getBackupData(d.backup, d.password, d.passwordX));
				});

				network = lodash.uniq(lodash.pluck(backupData, 'network')).toString();
				console.log('Network: ', network.toString());
				generate(backupData);

			}else{
				$("#button2").hide();
				showMessage(validation, 3);
			}
		}else{
			$("#button2").hide();
			showMessage('Please enter values for all entry boxes.', 3);
		}
	}

	generate = function(backupData){
		var mainPath = "m/45'/2147483647/0/";
		var changePath = "m/45'/2147483647/1/";

		showMessage('Searching main addresses...', 1);
		$scope.textArea = 'Main addresses:\n\n';
		console.log("Getting addresses...");

		// getting main addresses
		recoveryServices.getActiveAddresses(backupData, mainPath, n, function(mainAddressArray){
			if(mainAddressArray.length > 0){
				printFeedBack(mainAddressArray);
				mainAddressObjects = mainAddressArray;
				console.log("## Active main addresses:");
				console.log(mainAddressObjects);
			}
			else{
				$scope.textArea += 'No main addresses available.\n\n';
				console.log("No main addresses available.");
			}

			showMessage('Searching change addresses...', 1);
			$scope.textArea += 'Change addresses:\n\n';

			// getting change addresses
			recoveryServices.getActiveAddresses(backupData, changePath, n, function(changeAddressArray){
				if(changeAddressArray.length > 0){
					printFeedBack(changeAddressArray);
					changeAddressObjects = changeAddressArray;
					console.log("## Active change addresses:");
					console.log(changeAddressObjects);
				}
				else{
					$scope.textArea += 'No change addresses available.\n\n';
					console.log("No change addresses available.");
				}

				$("#button2").show();

				if((totalBtc - fee) > 0)
					showMessage('Available balance: ' + totalBtc.toFixed(8) + '  BTC.', 1);
				else
					showMessage('Available balance: 0 BTC.', 1);

				console.log("Search complete.");
			});
		});
	}

	printFeedBack = function(addressObject){
		var totalFound = 0;
				
		lodash.each(addressObject, function(ao){
			if(ao.utxo.length > 0){

				$scope.textArea += 'Address: ' + ao.address + '\n';
				$scope.textArea += 'Path: ' + ao.path + '\n';
				$scope.textArea += 'Balance: ' + ao.balance + '\n';
				$scope.textArea += 'Unconfirmed balance: ' + ao.unconfirmedBalance + '\n\n';
				lodash.each(ao.utxo, function(u){
					totalBtc += u.amount;
				})
				console.log('@@@@@@ Addresses with unspent amount:', ao);
				totalFound++;
			}
		});
		$scope.textArea += 'Addresses with unspent amount: ' + totalFound + '\n********************************************\n';
	}

	hideMessage = function(){
		$('#errorMessage').hide();
		$('#successMessage').hide();
		$('#statusMessage').hide();
	}

	showMessage = function(message, type){
		/*
			1 = status
			2 = success
			3 = error
		*/

		if(type == 1){
			$scope.statusMessage = message;
			$('#statusMessage').show();
			$('#errorMessage').hide();
			$('#successMessage').hide();
		}
		else if(type == 2){
			$scope.successMessage = message;
			$('#successMessage').show();
			$('#errorMessage').hide();
			$('#statusMessage').hide();
		}
		else{
			$scope.errorMessage = message;
			$('#errorMessage').show();
			$('#successMessage').hide();
			$('#statusMessage').hide();
		}
	}

	$scope.send = function(){
		var addr = $scope.addr;
		var validation = recoveryServices.validateAddress(addr, totalBtc, network.toString());

		if(validation == true){
			showMessage('Creating transaction to retrieve total amount...', 1);

			var rawTx = recoveryServices.createRawTx(addr, network.toString(), mainAddressObjects.concat(changeAddressObjects), m);
			
			recoveryServices.txBroadcast(rawTx, network. toString()).then(function(response){
				showMessage(totalBtc.toFixed(8) + ' BTC sent to address: ' + addr, 2);
				console.log('Transaction complete.  ' + (totalBtc - fee).toFixed(8) + ' BTC sent to address: ' + addr);

			}, function(error){
				showMessage('Is not possible make the transaction. Please, try later.', 3);
				console.log('Is not possible make the transaction. Please, try later.');
			});
		}else
			showMessage(validation, 3);
	}
});


