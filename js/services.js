var app = angular.module("recoveryApp.services", ['ngLodash']);
app.service('recoveryServices', ['$rootScope', '$http', 'lodash',
  function($rootScope, $http, lodash) {
    var bitcore = require('bitcore');
    var Mnemonic = require('bitcore-mnemonic');
    var Transaction = bitcore.Transaction;
    var Address = bitcore.Address;
    var GAP = 20;
    var root = {};

    root.fromBackup = function(data, m, n, network) {

      if (!data.backup)
        return null;
      try {
        JSON.parse(data.backup);
      } catch (ex) {
        throw new Error("Your JSON is not valid, please copy only the text within (and including) the { } brackets around it.");
      };
      var payload;
      try {
        payload = sjcl.decrypt(data.password, data.backup);
      } catch (ex) {
        throw new Error("Incorrect backup password");
      };
      payload = JSON.parse(payload);
      if ((payload.m != m) || (payload.n != n)) {
        throw new Error("The wallet configuration (m-n) does not match with values provided.");
      }
      if (payload.network != network) {
        throw new Error("Incorrect network.");
      }
      if (!(payload.xPrivKeyEncrypted) && !(payload.xPrivKey)) {
        throw new Error("The backup does not have a private key");
      }
      var xPriv = payload.xPrivKey;
      if (payload.xPrivKeyEncrypted) {
        try {
          xPriv = sjcl.decrypt(di.passwordX, payload.xPrivKeyEncrypted);
        } catch (ex) {
          throw new Error("Can not decrypt private key");
        }
      }
      var credential = {
        walletId: payload.walletId,
        copayerId: payload.copayerId,
        xPriv: xPriv,
        derivationStrategy: payload.derivationStrategy || "BIP45",
        addressType: payload.addressType || "P2SH",
        m: m,
        n: n,
        network: network,
        from: "backup",
      };
      return credential;
    }

    root.fromMnemonic = function(data, m, n, network) {
      if (!data.backup)
        return null;

      var words = data.backup;
      var passphrase = data.password;
      var xPriv;

      try {
        var mne = new Mnemonic(words);
        xPriv = mne.toHDPrivateKey(passphrase, network).toString();
      } catch (ex) {
        throw new Error("Mnemonic wallet seed is not valid.");
      };

      var credential = {
        xPriv: xPriv,
        derivationStrategy: "BIP44",
        addressType: n == 1 ? "P2PKH" : "P2SH",
        m: m,
        n: n,
        network: network,
        from: "mnemonic",
      };
      return credential;
    }

    root.buildWallet = function(credentials) {
      credentials = lodash.compact(credentials);
      if (credentials.length == 0)
        throw new Error('No data provided');

      if (lodash.uniq(lodash.pluck(credentials, 'from')).length != 1)
        throw new Error('Mixed backup sources not supported');

      var result = lodash.pick(credentials[0], ["walletId", "derivationStrategy", "addressType", "m", "n", "network", "from"]);

      result.copayers = lodash.map(credentials, function(c) {
        if (c.walletId != result.walletId)
          throw new Error("Backups do not belong to the same wallets.");
        return {
          copayerId: c.copayerId,
          xPriv: c.xPriv,
        };
      });
      if (result.from == "backup") {
        if (lodash.uniq(lodash.compact(lodash.pluck(result.copayers, 'copayerId'))).length != result.copayers.length)
          throw new Error("Some of the backups belong to the same copayers");
      }
      return result;
    }

    root.getWallet = function(data, m, n, network) {
      var credentials = lodash.map(data, function(dataItem) {
        if (dataItem.backup.charAt(0) == '{')
          return root.fromBackup(dataItem, m, n, network);
        else
          return root.fromMnemonic(dataItem, m, n, network);
      });
      return root.buildWallet(credentials);
    }

    var PATHS = {
      'BIP45': ["m/45'/2147483647/0/", "m/45'/2147483647/1/"],
      'BIP44': {
        'testnet': ["m/44'/1'/0'/0/", "m/44'/1'/0'/1/"],
        'livenet': ["m/44'/0'/0'/0/", "m/44'/0'/0'/1/"]
      },
    }

    root.scanWallet = function(wallet, cb) {

      console.log("Getting addresses...");

      // getting main addresses
      root.getActiveAddresses(wallet, function(err, addresses) {
        if (err) return cb(err);
        var utxos = lodash.flatten(lodash.pluck(addresses, "utxo"));
        var result = {
          addresses: addresses,
          balance: lodash.sum(utxos, 'amount'),
        }
        return cb(null, result);
      });
    }

    root.getPaths = function(wallet) {
      if (wallet.derivationStrategy == 'BIP45')
        return PATHS[wallet.derivationStrategy];
      if (wallet.derivationStrategy == 'BIP44')
        return PATHS[wallet.derivationStrategy][wallet.network];
    }

    root.getActiveAddresses = function(wallet, cb) {
      var activeAddress = [];
      var paths = root.getPaths(wallet);
      var inactiveCount;

      function explorePath(i) {
        if (i >= paths.length) return cb(null, activeAddress);
        inactiveCount = 0;
        derive(paths[i], 0, function(err, addresses) {
          if (err) return cb(err);
          explorePath(i + 1);
        });
      }

      function derive(basePath, index, cb) {
        if (inactiveCount > GAP) return cb();
        var address = root.generateAddress(wallet, basePath, index);
        root.getAddressData(address, wallet.network, function(err, addressData) {
          if (err) return cb(err);

          if (!lodash.isEmpty(addressData)) {
            activeAddress.push(addressData);
            inactiveCount = 0;
          } else
            inactiveCount++;

          derive(basePath, index + 1, cb);
        });
      }
      explorePath(0);
    }

    root.generateAddress = function(wallet, path, index) {
      var derivedPublicKeys = [];
      var derivedPrivateKeys = [];

      var xPrivKeys = lodash.pluck(wallet.copayers, 'xPriv');

      lodash.each(xPrivKeys, function(xpk) {
        var hdPrivateKey = bitcore.HDPrivateKey(xpk);

        // private key derivation
        var derivedHdPrivateKey = hdPrivateKey.derive(path + index);
        var derivedPrivateKey = derivedHdPrivateKey.privateKey;
        derivedPrivateKeys.push(derivedPrivateKey);

        // public key derivation
        var derivedHdPublicKey = derivedHdPrivateKey.hdPublicKey;
        var derivedPublicKey = derivedHdPublicKey.publicKey;
        derivedPublicKeys.push(derivedPublicKey);
      });
      var address;

      if (wallet.addressType == "P2SH")
        address = bitcore.Address.createMultisig(derivedPublicKeys, parseInt(wallet.m), wallet.network);
      else if (wallet.addressType == "P2PKH")
        address = Address.fromPublicKey(derivedPublicKeys[0], wallet.network);
      else
        throw new Error('Address type not supported');
      return {
        addressObject: address,
        pubKeys: derivedPublicKeys,
        privKeys: derivedPrivateKeys,
        path: path + index
      };
    }

    root.getAddressData = function(address, network, cb) {
      // call insight API to get address information
      root.checkAddress(address.addressObject, network).then(function(respAddress) {
        // call insight API to get utxo information
        root.checkUtxos(address.addressObject, network).then(function(respUtxo) {

          var addressData = {};

          if (respAddress.data.unconfirmedTxApperances + respAddress.data.txApperances > 0) {
            addressData = {
              address: respAddress.data.addrStr,
              balance: respAddress.data.balance,
              unconfirmedBalance: respAddress.data.unconfirmedBalance,
              utxo: respUtxo.data,
              privKeys: address.privKeys,
              pubKeys: address.pubKeys,
              path: address.path
            };
          }
          $rootScope.$emit('progress', addressData);
          return cb(null, addressData);
        });
      });
    }

    root.checkAddress = function(address, network) {
      if (network == 'testnet')
        return $http.get('https://test-insight.bitpay.com/api/addr/' + address + '?noTxList=1');
      else
        return $http.get('https://insight.bitpay.com/api/addr/' + address + '?noTxList=1');
    }

    root.checkUtxos = function(address, network) {
      if (network == 'testnet')
        return $http.get('https://test-insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1');
      else
        return $http.get('https://insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1');
    }

    root.createRawTx = function(toAddress, scanResults, wallet, fee) {
      if (!toAddress || !Address.isValid(toAddress))
        throw new Error('Please enter a valid address.');

      var amount = parseInt((scanResults.balance * 1e8 - fee * 1e8).toFixed(0));

      if (amount <= 0)
        throw new Error('Funds are insufficient to complete the transaction');

      try {
        new Address(toAddress, wallet.network);
      } catch (ex) {
        throw new Error('Incorrect destination address network');
      }

      try {
        var privKeys = [];
        var tx = new Transaction();
        lodash.each(scanResults.addresses, function(address) {
          if (address.utxo.length > 0) {
            lodash.each(address.utxo, function(u) {
              if (wallet.addressType == 'P2SH')
                tx.from(u, address.pubKeys, parseInt(wallet.m));
              else
                tx.from(u);
              privKeys = privKeys.concat(address.privKeys);

            });
          }
        });
        tx.to(toAddress, amount);
        tx.sign(lodash.uniq(privKeys));

        var rawTx = tx.serialize();
        console.log("Raw transaction: ", rawTx);
        return rawTx;
      } catch (ex) {
        console.log(ex);
        throw new Error('Could not build tx', ex);
      }
    }

    root.txBroadcast = function(rawTx, network) {
      if (network == 'testnet')
        return $http.post('https://test-insight.bitpay.com/api/tx/send', {
          rawtx: rawTx
        });
      else
        return $http.post('https://insight.bitpay.com/api/tx/send', {
          rawtx: rawTx
        });
    }

    return root;
  }
]);

app.directive('onReadFile', function($parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      var fn = $parse(attrs.onReadFile);

      element.on('change', function(onChangeEvent) {
        var reader = new FileReader();

        reader.onload = function(onLoadEvent) {
          scope.$apply(function() {
            fn(scope, {
              $fileContent: onLoadEvent.target.result
            });
          });
        };

        reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
      });
    }
  };
});