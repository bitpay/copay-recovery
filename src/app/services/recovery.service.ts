import {
  Injectable
} from '@angular/core';

import * as sjcl from 'sjcl';
import * as bitcoreLib from 'bitcore-lib';
import * as bitcoreLibCash from 'bitcore-lib-cash';
import * as CWC from 'crypto-wallet-core';
import * as Mnemonic from 'bitcore-mnemonic';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

@Injectable()
export class RecoveryService {
  public bitcore: any;
  public PATHS: Object;

  public apiURI = {
    'btc/livenet': 'https://api.bitcore.io/api/BTC/mainnet/',
    'btc/testnet': 'https://api.bitcore.io/api/BTC/testnet/',
    'bch/livenet': 'https://api.bitcore.io/api/BCH/mainnet/',
    'bch/testnet': 'https://api.bitcore.io/api/BCH/testnet/',
    'bsv/livenet': 'https://bchsvexplorer.com/api/',
    'eth/livenet': 'https://api-eth.bitcore.io/api/ETH/mainnet/',
  };
  public activeAddrCoinType = '';
  public stopSearching = false;

  constructor(
    private http: HttpClient
  ) {
    this.PATHS = {
      // we found some broken BIP45 wallet, that have some BIP44 addresses, so:
      'BIP45': ['m/45\'/2147483647/0', 'm/45\'/2147483647/1'],
      'BIP44': {
        'btc': {
          'testnet': [
            'm/44\'/1\'/ACCOUNT\'/0', 'm/44\'/1\'/ACCOUNT\'/1',
            'm/48\'/1\'/ACCOUNT\'/0', 'm/48\'/1\'/ACCOUNT\'/1'
          ],
          'livenet': [
            'm/44\'/0\'/ACCOUNT\'/0', 'm/44\'/0\'/ACCOUNT\'/1',
            'm/48\'/0\'/ACCOUNT\'/0', 'm/48\'/0\'/ACCOUNT\'/1'
          ],
        },
        'bch': {
          'livenet': [
            'm/44\'/145\'/ACCOUNT\'/0', 'm/44\'/145\'/ACCOUNT\'/1',
            'm/48\'/145\'/ACCOUNT\'/0', 'm/48\'/145\'/ACCOUNT\'/1',
            'm/44\'/0\'/ACCOUNT\'/0', 'm/44\'/0\'/ACCOUNT\'/1'
          ],
          'testnet': [
            'm/44\'/1\'/ACCOUNT\'/0', 'm/44\'/1\'/ACCOUNT\'/1',
            'm/48\'/1\'/ACCOUNT\'/0', 'm/48\'/1\'/ACCOUNT\'/1'
          ]
        },
        'bsv': {
          'livenet': [
            'm/44\'/0\'/ACCOUNT\'/0', 'm/44\'/0\'/ACCOUNT\'/1',
            'm/44\'/145\'/ACCOUNT\'/0', 'm/44\'/145\'/ACCOUNT\'/1'
          ]
        },
        'eth': {
          'livenet': [
            'm/44\'/60\'/ACCOUNT\'/0'
          ]
        }
      }
    };
  }

  private fromBackup(data: any, m: number, n: number, coin: string, network: string): any {
    try {
      JSON.parse(data.backup);
    } catch (ex) {
      console.log(ex);
      throw new Error('JSON invalid. Please copy only the text within (and including) the { } brackets around it.');
    }

    let payload;
    try {
      payload = sjcl.decrypt(data.password, data.backup);
    } catch (ex) {
      console.log(ex);
      throw new Error('Incorrect backup password');
    }

    payload = JSON.parse(payload);

    // Support for old file formats
    const credentials = payload.credentials ? payload.credentials : payload;
    const key = payload.key ? payload.key : payload;

    if (!credentials.n) {
      // tslint:disable-next-line:max-line-length
      throw new Error('Backup format not recognized. If you are using a Copay Beta backup and version is older than 0.10, please see: https://github.com/bitpay/copay/issues/4730#issuecomment-244522614');
    }
    if ((credentials.m !== m) || (credentials.n !== n)) {
      throw new Error('The wallet configuration (m-n) does not match with values provided.');
    }

    if (credentials.network !== network) {
      throw new Error('Incorrect network.');
    }
    if (!(key.xPrivKeyEncrypted) && !(key.xPrivKey)) {
      throw new Error('The backup does not have a private key');
    }

    let xPriv;
    if (coin !== 'eth') {
      xPriv = key.xPrivKey;
    } else {
      const xpriv = bitcoreLib.HDPrivateKey(key.xPrivKey);
      const path = this.bitcore.Deriver.pathFor(coin.toUpperCase(), network);
      xPriv = xpriv.deriveChild(path).toString();
    }
    if (key.xPrivKeyEncrypted) {
      try {
        xPriv = sjcl.decrypt(data.xPrivPass, key.xPrivKeyEncrypted);
      } catch (ex) {
        console.log(ex);
        throw new Error('Can not decrypt private key');
      }
    }
    const derivationStrategy = credentials.rootPath ? this.getDerivationStrategy(credentials.rootPath) :
      (credentials.derivationStrategy ? credentials.derivationStrategy : 'BIP45');
    const credential = {
      walletId: credentials.walletId,
      copayerId: credentials.copayerId,
      publicKeyRing: credentials.publicKeyRing,
      xPriv: xPriv,
      derivationStrategy,
      addressType: derivationStrategy === 'BIP45' ? 'P2SH' : credentials.addressType,
      m: m,
      n: n,
      network: network,
      coin: coin,
      from: 'backup',
    };
    return credential;
  }

  public checkAngularCryptoConfig(): string {
    const mnemonics = 'imitate type scorpion whip oil cheese achieve rail organ donkey note screen';
    try {
      new Mnemonic(mnemonics).toHDPrivateKey('', 'testnet').toString();
    } catch (ex) {
      console.log(ex);
      return 'Before starting, check the angular cli configuration described in the README/Installation section';
    }
    return null;
  }

  private fromMnemonic(data: any, m: number, n: number, coin: string, network: string): any {
    if (!data.backup) {
      return null;
    }

    const words = _.trim(data.backup);
    const passphrase = data.password;
    let xPriv;

    try {
      if (coin !== 'eth') {
        xPriv = new Mnemonic(words).toHDPrivateKey(passphrase, network).toString();
      } else {
        const xpriv = new Mnemonic(words).toHDPrivateKey(passphrase, network);
        const path = this.bitcore.Deriver.pathFor(coin.toUpperCase(), network);
        xPriv = xpriv.deriveChild(path).toString();
      }
    } catch (ex) {
      console.log(ex);
      throw new Error('Mnemonic wallet seed is not valid.');
    }

    const credential = {
      xPriv,
      derivationStrategy: 'BIP44',
      addressType: n === 1 ? 'P2PKH' : 'P2SH',
      m: m,
      n: n,
      network,
      coin,
      from: 'mnemonic',
    };

    return credential;
  }

  private buildWallet(credentials: any): any {
    let result: any;
    credentials = _.compact(credentials);
    if (credentials.length === 0) {
      throw new Error('No data provided');
    }

    if (_.uniq(_.map(credentials, 'from')).length !== 1) {
      throw new Error('Mixed backup sources not supported');
    }

    // tslint:disable-next-line:max-line-length
    result = _.pick(credentials[0], ['walletId', 'derivationStrategy', 'addressType', 'm', 'n', 'network', 'from', 'coin', 'publicKeyRing']);

    // only for backup files
    result.copayers = _.map(credentials, (c: any) => {
      if (c.walletId !== result.walletId) {
        throw new Error('Backups do not belong to the same wallets.');
      }
      return {
        copayerId: c.copayerId,
        xPriv: c.xPriv,
      };
    });
    if (result.from === 'backup') {
      if (_.uniq(_.compact(_.map(result.copayers, 'copayerId'))).length !== result.copayers.length) {
        throw new Error('Some of the backups belong to the same copayers');
      }
    }

    console.log('Recovering wallet', result);

    return result;
  }

  public getWallet(data: any, m: number, n: number, coin: string, network: string): any {
    if (coin === 'btc') {
      this.bitcore = bitcoreLib;
    } else if (coin === 'bch' || coin === 'bsv') {
      this.bitcore = bitcoreLibCash;
    } else if (coin === 'eth') {
      this.bitcore = CWC;
    } else {
      throw new Error('Unknown coin ' + coin);
    }
    const credentials = _.map(data, (dataItem: any) => {
      dataItem.backup = _.trim(dataItem.backup);
      if (dataItem.backup.charAt(0) === '{') {
        return this.fromBackup(dataItem, m, n, coin, network);
      } else {
        return this.fromMnemonic(dataItem, m, n, coin, network);
      }
    });


    return this.buildWallet(credentials);
  }

  public scanWallet(wallet: any, coin: string, inGap: number, account: number, reportFn: Function, cb: Function): any {
    let utxos: Array<any>;
    // getting main addresses
    this.getActiveAddresses(wallet, inGap, account, reportFn, (err, addresses) => {
      if (err) {
        return cb(err);
      }
      utxos = _.flatten(_.map(addresses, 'utxo'));
      const result = {
        addresses: _.uniq(addresses),
        balance: coin === 'bsv' ? _.sumBy(utxos, 'amount') : _.sumBy(addresses, 'balance'),
      };
      return cb(null, result);
    });
  }

  private getPaths(wallet: any, account: number): string {
    if (wallet.derivationStrategy === 'BIP45') {
      let p = _.clone(this.PATHS[wallet.derivationStrategy]);
      // adds copayer's paths
      for (let i = 0; i < wallet.n; i++) {
        const copayerPaths = ['m/45\'/' + i + '/0', 'm/45\'/' + i + '/1'];
        p = p.concat(copayerPaths);
      }
      return p;
    }
    if (wallet.derivationStrategy === 'BIP44') {
      const paths = this.getPathsWithAccount(wallet, account);
      return paths[wallet.derivationStrategy][wallet.coin][wallet.network];
    }
  }

  private getPathsWithAccount(wallet, account: number) {
    const paths = _.cloneDeep(this.PATHS);
    paths[wallet.derivationStrategy][wallet.coin][wallet.network].forEach((path, i) => {
      paths[wallet.derivationStrategy][wallet.coin][wallet.network][i] = path.replace(/ACCOUNT/, `${account}`);
    });
    return paths;
  }

  private getHdDerivations(wallet: any, account: number): any {

    const deriveOne = (xpriv, path, compliant): any => {
      if (wallet.coin !== 'eth') {
        const hdPrivateKey = this.bitcore.HDPrivateKey(xpriv);
        const xPrivKey = compliant ? hdPrivateKey.deriveChild(path) : hdPrivateKey.deriveNonCompliantChild(path);
        return xPrivKey;
      } else {
        const derivedPrivateKey = this.bitcore.Deriver.derivePrivateKey(wallet.coin.toUpperCase(), wallet.network, xpriv, 0, false);
        return derivedPrivateKey.privKey;
      }
    };

    const expand = (groups) => {
      if (groups.length === 1) {
        return groups[0];
      }

      const combine = (g1, g2) => {
        const combinations = [];
        for (let i = 0; i < g1.length; i++) {
          for (let j = 0; j < g2.length; j++) {
            combinations.push(_.flatten([g1[i], g2[j]]));
          }
        }
        return combinations;
      };
      return combine(groups[0], expand(_.tail(groups)));
    };

    const xPrivKeys = _.map(wallet.copayers, 'xPriv');
    let derivations = [];
    _.each(this.getPaths(wallet, account), (path) => {
      const derivation = expand(_.map(xPrivKeys, (xpriv, i) => {
        const compliant = deriveOne(xpriv, path, true);
        const nonCompliant = deriveOne(xpriv, path, false);
        const items = [];
        items.push({
          copayer: i + 1,
          path: path,
          compliant: true,
          key: compliant
        });
        if (compliant.toString() !== nonCompliant.toString()) {
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
  }

  private getActiveAddresses(wallet: any, inGap: number, account: number, reportFn: Function, cb: Function): any {
    const activeAddress = [];
    let inactiveCount;

    const baseDerivations = this.getHdDerivations(wallet, account);

    const exploreDerivation = (i): void => {

      if (i >= baseDerivations.length) {
        return cb(null, _.uniqBy(activeAddress, 'address'));
      }
      inactiveCount = 0;
      derive(baseDerivations[i], 0, (err, addresses) => {
        if (err) {
          return cb(err);
        }
        exploreDerivation(i + 1);
      });
    };

    const derive = (baseDerivation, index, callback) => {
      if (this.stopSearching) {
        return callback(null);
      }

      const path = baseDerivation.path || baseDerivation[0].path;
      if (inactiveCount > inGap || path.match(this.activeAddrCoinType) === null) {
        return callback();
      }

      const address = this.generateAddress(wallet, baseDerivation, index);
      this.checkAddressData(address, wallet.coin, wallet.network, (err, addressData) => {
        if (err) {
          return callback(err);
        }
        if (!_.isEmpty(addressData)) {
          addressData.balance = wallet.coin !== 'eth' ? addressData.balance * 1e-8 : addressData.balance;
          console.log('#Active address:', addressData, baseDerivation, wallet.network);
          if (wallet.derivationStrategy !== 'BIP45') {
            this.activeAddrCoinType = this.getActiveAddrCoinType(wallet, path);
          }
          activeAddress.push(addressData);
          inactiveCount = 0;
        } else {
          inactiveCount++;
        }

        reportFn(inactiveCount, _.uniqBy(activeAddress, 'address'));

        derive(baseDerivation, index + 1, callback);
      });
    };

    exploreDerivation(0);
  }

  private getActiveAddrCoinType(wallet, path: string): string {
    // This function avoids searching on another derivation paths when an active address has already been found in one of them

    if (wallet.coin === 'btc' && wallet.network === 'livenet') {
      return path.match(/m\/44\'\/0\'/) ? 'm/44\'/0\'' : 'm/48\'/0\'';
    } else if (wallet.coin === 'btc' && wallet.network === 'testnet') {
      return path.match(/m\/44\'\/1\'/) ? 'm/44\'/1\'' : 'm/48\'/1\'';
    } else if (wallet.coin === 'bch' && wallet.network === 'livenet') {
      return path.match(/m\/44\'\/145\'/) ? 'm/44\'/145\'' :
        (path.match(/m\/48\'\/145\'/) ? 'm/48\'/145\'' : 'm/44\'/0\'');
    } else if (wallet.coin === 'bch' && wallet.network === 'testnet') {
      return path.match(/m\/44\'\/1\'/) ? 'm/44\'/1\'' : 'm/48\'/1\'';
    } else {
      return path;
    }
  }

  private generateAddress(wallet: any, derivedItems: any, index: number): any {
    const derivedPrivateKeys = [];
    let derivedPublicKeys = [];
    let derivedPrivateKey;

    _.each([].concat(derivedItems), (derivedItem) => {
      if (wallet.coin !== 'eth') {

        const hdPrivateKey = this.bitcore.HDPrivateKey(derivedItem.key);

        // private key derivation
        derivedPrivateKey = hdPrivateKey.deriveChild(index).privateKey;
        derivedPrivateKeys.push(derivedPrivateKey);

        // public key derivation
        derivedPublicKeys.push(derivedPrivateKey.publicKey);
        if (wallet.publicKeyRing && wallet.coin) {
          let hdPublicKey;
          const derivedItemsArray = [].concat(derivedItems);
          const path = derivedItemsArray[0].path.split('/');
          const isChange = parseInt(_.last(path).toString(), 10);
          derivedPublicKeys = [];
          wallet.publicKeyRing.forEach((item) => {
            if (wallet.derivationStrategy === 'BIP45') {
              // (sharedId = 2147483647 )
              const copayerId = parseInt(_.nth(path, -2).toString(), 10);
              hdPublicKey = new this.bitcore.HDPublicKey(item.xPubKey).deriveChild(copayerId).deriveChild(isChange).deriveChild(index);
            } else {
              if (wallet.derivationStrategy === 'BIP44') {
                hdPublicKey = new this.bitcore.HDPublicKey(item.xPubKey).deriveChild(isChange).deriveChild(index);
              }
            }
            derivedPublicKeys.push(hdPublicKey.publicKey);
          });
        }
      } else {
        // private key derivation

        // tslint:disable-next-line:max-line-length
        derivedPrivateKey = this.bitcore.Deriver.derivePrivateKey(wallet.coin.toUpperCase(), wallet.network, wallet.copayers[0].xPriv, index, false);
        derivedPrivateKeys.push(derivedPrivateKey.privKey);

        // public key derivation
        derivedPublicKeys.push(derivedPrivateKey.pubKey);
      }
    });

    let address;
    if (wallet.addressType === 'P2SH') {
      address = this.bitcore.Address.createMultisig(derivedPublicKeys, wallet.m, wallet.network);
    } else if (wallet.addressType === 'P2PKH') {
      if (wallet.coin !== 'eth') {
        address = this.bitcore.Address.fromPublicKey(derivedPublicKeys[0], wallet.network);
      } else {
        address = derivedPrivateKey.address;
      }
    } else {
      throw new Error('Address type not supported');
    }
    return {
      addressObject: address,
      pubKeys: derivedPublicKeys,
      privKeys: derivedPrivateKeys,
      info: derivedItems,
      index: index,
    };
  }

  private checkAddressData(address: any, coin: string, network: string, cb: Function) {
    if (coin === 'bsv') {
      this.getAddressDataBsv(address, coin, network, cb);
    } else if (coin === 'eth') {
      this.checkEthAddress(address, coin, network, cb);
    } else {
      this.checkAddress(address, coin, network, cb);
    }
  }

  private checkEthAddress(address: any, coin: string, network: string, cb: Function): any {
    const addr = address.addressObject.toString(true);

    this.getAddressTxos(addr, coin, network).subscribe((res) => {
      this.getTransactionCount(addr, coin, network).subscribe(transactionCount => {
        const addressData = {
          address: addr,
          balance: res.balance,
          privKeys: address.privKeys,
          pubKeys: address.pubKeys,
          info: address.info,
          index: address.index,
          isActive: transactionCount.nonce > 0 || (res.balance > 0 && transactionCount.nonce === 0),
          nonce: transactionCount.nonce
        };

        /* This timeout is because we must not exceed the limit of 30 requests per minute to the server.
        If you do, you will get an HTTP 429 error */
        setTimeout(() => {
          if (addressData.isActive) {
            return cb(null, addressData);
          }
          return cb();
        }, 1000);
      }, err => {
        return cb(err);
      });
    });
  }

  private getBsvAddressFromLegacy(address: string): string {
    const obj = bitcoreLib.Address(address).toObject();
    return this.bitcore.Address.fromObject(obj).toString(true);
  }

  private getAddressDataBsv(address: any, coin: string, network: string, cb: Function): any {
    // call insight API to get address information
    this.checkAddressBsv(address.addressObject, coin, network).then((respAddressObs: any) => {

      respAddressObs.subscribe(respAddress => {
        // call insight API to get utxo information
        this.getAddressTxos(address.addressObject.toCashAddress(), coin, network).subscribe((respUtxoData: any) => {

          // Old insight returns address in Legacy format
          const addr = this.getBsvAddressFromLegacy(respAddress.addrStr);

          const cashFormatUtxo = [];
          respUtxoData.forEach((utxo) => {
            utxo.address = this.getBsvAddressFromLegacy(utxo.address);
            cashFormatUtxo.push(utxo);
          });

          const addressData = {
            address: addr,
            balance: respAddress.balance,
            unconfirmedBalance: respAddress.unconfirmedBalance,
            utxo: cashFormatUtxo,
            privKeys: address.privKeys,
            pubKeys: address.pubKeys,
            info: address.info,
            index: address.index,
            isActive: respAddress.unconfirmedTxApperances + respAddress.txApperances > 0,
          };

          /* This timeout is because we must not exceed the limit of 30 requests per minute to the server.
          If you do, you will get an HTTP 429 error */
          setTimeout(() => {
            if (addressData.isActive) {
              return cb(null, addressData);
            }
            return cb();
          }, 1000);
        });
      });
    });
  }

  private checkAddressBsv(address: any, coin: string, network: string): Promise<any> {
    const addr = address.toString();
    const url = this.apiURI[coin + '/' + network] + 'addr/' + addr + '?noTxList=1';
    return new Promise(resolve => {
      resolve(this.http.get(url));
    });
  }

  private checkAddress(address: any, coin: string, network: string, cb: Function): any {
    const addr = address.addressObject.toString(true);

    this.getAddressTxos(addr, coin, network).subscribe((txos) => {
      const utxos = _.filter(txos, ['spentHeight', -2]);
      const addressData = {
        address: addr,
        balance: _.sumBy(utxos, 'value'),
        utxo: utxos,
        privKeys: address.privKeys,
        pubKeys: address.pubKeys,
        info: address.info,
        index: address.index,
        isActive: txos.length > 0,
      };

      /* This timeout is because we must not exceed the limit of 30 requests per minute to the server.
      If you do, you will get an HTTP 429 error */
      setTimeout(() => {
        if (addressData.isActive) {
          return cb(null, addressData);
        }
        return cb();
      }, 1000);
    }, err => {
      return cb(err);
    });
  }

  private getAddressTxos(addr: string, coin: string, network: string): Observable<any> {
    let url;
    if (coin === 'bsv') {
      url = this.apiURI[coin + '/' + network] + 'addr/' + addr + '/utxo?noCache=1';
    } else if (coin === 'eth') {
      url = this.apiURI[coin + '/' + network] + 'address/' + addr + '/balance';
    } else {
      url = this.apiURI[coin + '/' + network] + 'address/' + addr + '/?limit=999';
    }
    return this.http.get<any>(url).catch(err => {
      throw err;
    });
  }

  private getTransactionCount(addr: string, coin: string, network: string): Observable<any> {
    const url = this.apiURI[coin + '/' + network] + 'address/' + addr + '/txs/count';
    return this.http.get<any>(url).catch(err => {
      throw err;
    });
  }

  public createRawTx(toAddress: string, scanResults: any, wallet: any, fee: number): any {

    if (wallet.coin !== 'eth') {
      const amount = parseInt((scanResults.balance * 1e8 - fee * 1e8).toFixed(0), 10);
      if (amount <= 0) {
        throw new Error('Funds are insufficient to complete the transaction');
      }
      console.log('Generating a ' + wallet.coin + ' transaction');

      if (!toAddress || !this.bitcore.Address.isValid(toAddress)) {
        throw new Error('Please enter a valid address.');
      }

      try {
        const checkAddress = new this.bitcore.Address(toAddress, wallet.network);
        console.log('Check address: ', checkAddress);
      } catch (ex) {
        console.log(ex);
        throw new Error('Incorrect destination address network');
      }

      try {
        let privKeys = [];

        const tx = new this.bitcore.Transaction();

        _.each(scanResults.addresses, (address: any) => {
          if (address.utxo.length > 0) {
            _.each(address.utxo, (u) => {
              if (wallet.coin !== 'bsv') {
                u.txid = u.mintTxid;
                u.outputIndex = u.mintIndex;
                u.satoshis = u.value;
              }
              if (wallet.addressType === 'P2SH') {
                tx.from(u, address.pubKeys, wallet.m);
              } else {
                tx.from(u);
              }
              privKeys = privKeys.concat(address.privKeys.slice(0, wallet.m));
            });
          }
        });

        tx.to(toAddress, amount);
        tx.sign(_.uniq(privKeys));
        const rawTx = tx.serialize();
        console.log('Raw transaction: ', rawTx);
        return rawTx;
      } catch (ex) {
        console.log(ex);
        throw new Error('Could not build tx: ' + ex);
      }
    } else {
      let balance = scanResults.balance.toString();
      balance = parseInt(balance.slice(0, - 1) + '0', 10);
      const amount = parseInt((balance - fee * 1e18).toFixed(0), 10);

      if (amount <= 0) {
        throw new Error('Funds are insufficient to complete the transaction');
      }

      console.log('Generating a ' + wallet.coin + ' transaction');
      if (!toAddress || !this.bitcore.Validation.validateAddress(wallet.coin, wallet.chain, toAddress)) {
        throw new Error('Please enter a valid address.');
      }

      try {
        const tx = this.bitcore.Transactions.create({
          chain: wallet.coin.toUpperCase(),
          recipients: [{ address: toAddress, amount }],
          gasPrice: parseInt((fee * 1e18).toFixed(0), 10) / 21000,
          gasLimit: 21000,
          nonce: scanResults.addresses[0].nonce,
        });
        const key = {
          privKey: scanResults.addresses[0].privKeys[0]
        };
        const rawEthTx = this.bitcore.Transactions.sign({
          chain: wallet.coin.toUpperCase(),
          tx,
          key
        });
        return rawEthTx;
      } catch (ex) {
        console.log(ex);
        throw new Error('Could not build tx: ' + ex);
      }
    }
  }

  public txBroadcast(rawTx: string, coin: string, network: string): Observable<any> {
    let url, data;
    if (coin === 'bsv') {
      url = 'https://api.blockchair.com/bitcoin-sv/push/transaction';
      data = { data: rawTx };
    } else {
      url = this.apiURI[coin + '/' + network] + 'tx/send';
      data = { rawTx: rawTx };
    }
    console.log('Posting tx to...' + url);
    return this.http.post<any>(url, data).catch(err => {
      throw err;
    });
  }

  private parsePath(path: string) {
    return {
      purpose: path.split('/')[1],
      coinCode: path.split('/')[2],
      account: path.split('/')[3]
    };
  }

  private getDerivationStrategy(path: string): string {
    const purpose = this.parsePath(path).purpose;
    let derivationStrategy: string;

    switch (purpose) {
      case '45\'':
        derivationStrategy = 'BIP45';
        break;
      default:
        derivationStrategy = 'BIP44';
        break;
    }
    return derivationStrategy;
  }

}
