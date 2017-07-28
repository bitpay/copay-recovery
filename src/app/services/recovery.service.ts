import { Injectable } from '@angular/core';

import * as sjcl from 'sjcl';
import * as bitcore from 'bitcore-lib';
import * as Mnemonic from 'bitcore-mnemonic';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RecoveryService {

  public Transaction = bitcore.Transaction;
  public Address = bitcore.Address;

  public PATHS: Object;

  constructor(private http: HttpClient) {
    this.PATHS = {
      'BIP45': ["m/45'/2147483647/0", "m/45'/2147483647/1"],
      'BIP44': {
        'testnet': ["m/44'/1'/0'/0", "m/44'/1'/0'/1"],
        'livenet': ["m/44'/0'/0'/0", "m/44'/0'/0'/1"]
      },
    }
  }

  fromBackup(data: any, m: number, n: number, network: string) {
    if (!data.backup)
      return null;
    try {
      JSON.parse(data.backup);
    } catch (ex) {
      throw new Error("JSON invalid. Please copy only the text within (and including) the { } brackets around it.");
    };
    var payload;
    try {
      payload = sjcl.decrypt(data.password, data.backup);
    } catch (ex) {
      throw new Error("Incorrect backup password");
    };

    payload = JSON.parse(payload);

    if (!payload.n) {
      throw new Error("Backup format not recognized. If you are using a Copay Beta backup and version is older than 0.10, please see: https://github.com/bitpay/copay/issues/4730#issuecomment-244522614");
    }
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
        xPriv = sjcl.decrypt(data.xPrivPass, payload.xPrivKeyEncrypted);
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

  fromMnemonic(data: any, m: number, n: number, network: string) {
    if (!data.backup)
      return null;

    var words = data.backup;
    var passphrase = data.password;
    var xPriv;

    try {
      xPriv = new Mnemonic(words).toHDPrivateKey(passphrase, network).toString();
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

  buildWallet(credentials: any) {
    var result: any;
    credentials = _.compact(credentials);
    if (credentials.length == 0)
      throw new Error('No data provided');

    if (_.uniq(_.map(credentials, 'from')).length != 1)
      throw new Error('Mixed backup sources not supported');

    result = _.pick(credentials[0], ["walletId", "derivationStrategy", "addressType", "m", "n", "network", "from"]);

    result.copayers = _.map(credentials, (c: any) => {
      if (c.walletId != result.walletId)
        throw new Error("Backups do not belong to the same wallets.");
      return {
        copayerId: c.copayerId,
        xPriv: c.xPriv,
      };
    });
    if (result.from == "backup") {
      if (_.uniq(_.compact(_.map(result.copayers, 'copayerId'))).length != result.copayers.length)
        throw new Error("Some of the backups belong to the same copayers");
    }

    console.log('Recovering wallet', result);

    return result;
  }

  getWallet(data: any, m: number, n: number, network: string) {
    var credentials = _.map(data, (dataItem: any) => {
      if (dataItem.backup.charAt(0) == '{')
        return this.fromBackup(dataItem, m, n, network);
      else
        return this.fromMnemonic(dataItem, m, n, network);
    });
    return this.buildWallet(credentials);
  }

  scanWallet(wallet: any, inGap: number, reportFn: Function, cb: Function) {
    var utxos: Array<any>;
    reportFn("Getting addresses... GAP:" + inGap);

    // getting main addresses
    this.getActiveAddresses(wallet, inGap, reportFn, (err, addresses) => {
      reportFn("Active addresses:" + JSON.stringify(addresses));
      if (err) return cb(err);
      utxos = _.flatten(_.map(addresses, "utxo"));
      var result = {
        addresses: addresses,
        balance: _.sumBy(utxos, 'amount'),
      }
      return cb(null, result);
    });
  }

  getPaths(wallet: any) {
    if (wallet.derivationStrategy == 'BIP45')
      return this.PATHS[wallet.derivationStrategy];
    if (wallet.derivationStrategy == 'BIP44')
      return this.PATHS[wallet.derivationStrategy][wallet.network];
  };

  getHdDerivations(wallet: any) {
    function deriveOne(xpriv, path, compliant) {
      var hdPrivateKey = bitcore.HDPrivateKey(xpriv);
      var xPrivKey = compliant ? hdPrivateKey.deriveChild(path) : hdPrivateKey.deriveNonCompliantChild(path);
      return xPrivKey;
    };

    function expand(groups) {
      if (groups.length == 1) return groups[0];

      function combine(g1, g2) {
        var combinations = [];
        for (var i = 0; i < g1.length; i++) {
          for (var j = 0; j < g2.length; j++) {
            combinations.push(_.flatten([g1[i], g2[j]]));
          };
        };
        return combinations;
      };
      return combine(groups[0], expand(_.tail(groups)));
    };

    var xPrivKeys = _.map(wallet.copayers, 'xPriv');
    var derivations = [];
    _.each(this.getPaths(wallet), (path) => {
      var derivation = expand(_.map(xPrivKeys, (xpriv, i) => {
        var compliant = deriveOne(xpriv, path, true);
        var nonCompliant = deriveOne(xpriv, path, false);
        var items = [];
        items.push({
          copayer: i + 1,
          path: path,
          compliant: true,
          key: compliant
        });
        if (compliant.toString() != nonCompliant.toString()) {
          items.push({
            copayer: i + 1,
            path: path,
            compliant: false,
            key: nonCompliant
          });
        }
        return items;
      }));
      derivations = derivations.concat(derivation);
    });

    return derivations;
  };

  getActiveAddresses(wallet: any, inGap: number, reportFn: Function, cb: Function) {
    let self = this;
    var activeAddress = [];
    var inactiveCount;

    var baseDerivations = this.getHdDerivations(wallet);

    function exploreDerivation(i) {
      if (i >= baseDerivations.length) return cb(null, activeAddress);
      inactiveCount = 0;
      derive(baseDerivations[i], 0, (err, addresses) => {
        if (err) return cb(err);
        exploreDerivation(i + 1);
      });
    }

    function derive(baseDerivation, index, cb) {
      if (inactiveCount > inGap) return cb();

      var address = self.generateAddress(wallet, baseDerivation, index);
      self.getAddressData(address, wallet.network, (err, addressData) => {
        if (err) return cb(err);

        if (!_.isEmpty(addressData)) {
          reportFn('Address is Active!');
          console.log('#Active address:', addressData);
          activeAddress.push(addressData);
          inactiveCount = 0;
        } else
          inactiveCount++;

        reportFn('inactiveCount:' + inactiveCount);

        derive(baseDerivation, index + 1, cb);
      });
    }
    exploreDerivation(0);
  }

  generateAddress(wallet: any, derivedItems: any, index: number) {
    var derivedPrivateKeys = [];
    var derivedPublicKeys = [];

    _.each([].concat(derivedItems), (item) => {
      var hdPrivateKey = bitcore.HDPrivateKey(item.key);

      // private key derivation
      var derivedPrivateKey = hdPrivateKey.deriveChild(index).privateKey;
      derivedPrivateKeys.push(derivedPrivateKey);

      // public key derivation
      derivedPublicKeys.push(derivedPrivateKey.publicKey);
    });

    var address;
    if (wallet.addressType == "P2SH")
      address = bitcore.Address.createMultisig(derivedPublicKeys, wallet.m, wallet.network);
    else if (wallet.addressType == "P2PKH")
      address = this.Address.fromPublicKey(derivedPublicKeys[0], wallet.network);
    else
      throw new Error('Address type not supported');
    return {
      addressObject: address,
      pubKeys: derivedPublicKeys,
      privKeys: derivedPrivateKeys,
      info: derivedItems,
      index: index,
    };
  }

  getAddressData(address: any, network: string, cb: Function) {
    let self = this;
    // call insight API to get address information
    this.checkAddress(address.addressObject, network).then((respAddressObs: any) => {
      respAddressObs.subscribe(respAddress => {
        // call insight API to get utxo information
        self.checkUtxos(address.addressObject, network).then((respUtxo: any) => {
          respUtxo.subscribe(respUtxoData => {
            var addressData = {
              address: respAddress.addrStr,
              balance: respAddress.balance,
              unconfirmedBalance: respAddress.unconfirmedBalance,
              utxo: respUtxoData,
              privKeys: address.privKeys,
              pubKeys: address.pubKeys,
              info: address.info,
              index: address.index,
              isActive: respAddress.unconfirmedTxApperances + respAddress.txApperances > 0,
            };
            // TODO: Review this comment
            //$rootScope.$emit('progress', _.pick(addressData, 'info', 'address', 'isActive', 'balance'));
            if (addressData.isActive)
              return cb(null, addressData);
            return cb();
          });
        });
      });
    });
  }

  checkAddress(address: string, network: string): Promise<any> {
    if (network == 'testnet') {
      return new Promise(resolve => {
        resolve(this.http.get('https://test-insight.bitpay.com/api/addr/' + address + '?noTxList=1'));
      });
    } else {
      return new Promise(resolve => {
        resolve(this.http.get('https://insight.bitpay.com/api/addr/' + address + '?noTxList=1'));
      });
    }
  }

  checkUtxos(address: string, network: string): Promise<any> {
    if (network == 'testnet') {
      return new Promise(resolve => {
        resolve(this.http.get('https://test-insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1'));
      });
    } else {
      return new Promise(resolve => {
        resolve(this.http.get('https://insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1'));
      });
    }
  }

  createRawTx(toAddress: string, scanResults: any, wallet: any, fee: number) {
    if (!toAddress || !this.Address.isValid(toAddress))
      throw new Error('Please enter a valid address.');

    var amount = parseInt((scanResults.balance * 1e8 - fee * 1e8).toFixed(0));

    if (amount <= 0)
      throw new Error('Funds are insufficient to complete the transaction');

    try {
      new this.Address(toAddress, wallet.network);
    } catch (ex) {
      throw new Error('Incorrect destination address network');
    }

    try {
      var privKeys = [];
      var tx = new this.Transaction();
      _.each(scanResults.addresses, (address) => {
        if (address.utxo.length > 0) {
          _.each(address.utxo, (u) => {
            if (wallet.addressType == 'P2SH')
              tx.from(u, address.pubKeys, wallet.m);
            else
              tx.from(u);
            privKeys = privKeys.concat(address.privKeys.slice(0, wallet.m));

          });
        }
      });
      tx.to(toAddress, amount);
      tx.sign(_.uniq(privKeys));

      var rawTx = tx.serialize();
      console.log("Raw transaction: ", rawTx);
      return rawTx;
    } catch (ex) {
      console.log(ex);
      throw new Error('Could not build tx: ' + ex);
    }
  }

  // Todo: implement txBroadcast as a Promise
  txBroadcast(rawTx: string, network: string): Promise<any> {
    if (network == 'testnet') {
      return new Promise(resolve => {
        resolve(this.http.post('https://test-insight.bitpay.com/api/tx/send', {
          rawtx: rawTx
        }));
      });
    } else {
      return new Promise(resolve => {
        resolve(this.http.post('https://insight.bitpay.com/api/tx/send', {
          rawtx: rawTx
        }));
      });
    }
  }

}
