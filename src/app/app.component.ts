import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { RecoveryService } from '../app/services/recovery.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [RecoveryService]
})

export class AppComponent implements OnInit {
  public availableOptions: Array<any>;
  public availableChains: Array<any>;
  public signaturesNumber: number; // m
  public copayersNumber: number; // n
  public chain: string;
  public disableGapChange: boolean;
  public network: string;
  public coin: string;
  public addressGap: number;
  public account: number;
  public beforeScan: boolean;
  public copayers = [1];
  public data: any;
  public termsAccepted: boolean;
  public statusMessage: string;
  public successMessage: string;
  public errorMessage: string;
  public totalBalanceStr: string;
  public totalBalanceLockedStr: string;
  public destinationAddress: string;
  public showLoadingSpinner: boolean;
  public done: boolean;
  public broadcasted: boolean;
  public insufficentsFunds: boolean;

  public reportAmount: string;
  public reportInactive: string;
  public reportAddresses: string;
  public reportXrpLocked: string;
  public xrpReserve: number = 20 * 1e6;
  public showXrpLockedInfo: boolean;

  private wallet: any;
  private scanResults: any;
  private fee: number;
  private txid: string;

  constructor(
    private recoveryService: RecoveryService
  ) {
    this.addressGap = 20;
    this.disableGapChange = false;
    this.account = 0;
    this.data = {
      backUp: [],
      pass: [],
      passX: [],
      gap: this.addressGap
    };
    this.availableOptions = [1, 2, 3, 4, 5, 6];
    this.availableChains = ['btc/livenet', 'btc/testnet', 'bch/livenet', 'bch/testnet', 'bsv/livenet', 'eth/livenet', 'xrp/livenet', 'xrp/testnet'];
    this.fee = 0.001;
    this.signaturesNumber = this.availableOptions[0];
    this.copayersNumber = this.availableOptions[0];
    this.chain = this.availableChains[0];
    this.statusMessage = null;
    this.successMessage = null;
    this.errorMessage = null;
    this.done = false;
    this.broadcasted = false;
    this.insufficentsFunds = false;
    this.termsAccepted = false;
  }

  ngOnInit() {
    this.hideMessage();
    this.beforeScan = true;
    this.done = false;
    this.broadcasted = false;
    this.insufficentsFunds = false;
    this.destinationAddress = '';
    this.txid = null;
    this.checkAngularCryptoConfig();
    this.recoveryService.activeAddrCoinType = '';
    this.showLoadingSpinner = false;
    this.recoveryService.stopSearching = true;
  }

  private checkAngularCryptoConfig(): void {
    const result = this.recoveryService.checkAngularCryptoConfig();
    if (result) {
      this.showMessage(result, 3);
    }
  }

  public updateCopayersForm(): void {
    this.copayers = _.map(_.range(1, this.copayersNumber + 1), (i) => {
      return i;
    });
  }

  public processInputs(): void {
    this.hideMessage();
    this.showLoadingSpinner = true;
    this.beforeScan = true;
    this.recoveryService.stopSearching = false;
    this.showXrpLockedInfo = false;
    this.reportInactive = '0';
    this.reportAddresses = '0';
    this.reportXrpLocked = null;

    const inputs = _.map(_.range(1, this.copayersNumber + 1), (i) => {
      return {
        backup: this.data.backUp[i] || '',
        password: this.data.pass[i] || '',
        xPrivPass: this.data.passX[i] || '',
      };
    });

    if (this.chain.match(/bch/)) {
      this.network = this.chain.replace('bch/', '');
      this.coin = 'bch';
      this.fee = 0.0001;
    } else if (this.chain.match(/bsv/)) {
      this.network = this.chain.replace('bsv/', '');
      this.coin = 'bsv';
      this.fee = 0.0001;
    } else if (this.chain.match(/eth/)) {
      this.network = this.chain.replace('eth/', '');
      this.coin = 'eth';
      this.fee = 0.00063;
    } else if (this.chain.match(/xrp/)) {
      this.network = this.chain.replace('xrp/', '');
      this.coin = 'xrp';
      this.fee = 0.000012;
    } else {
      this.network = this.chain.replace('btc/', '');
      this.coin = 'btc';
      this.fee = 0.001;
    }
    this.reportAmount = '0 ' + this.coin.toLocaleUpperCase();
    try {
      this.wallet = this.recoveryService.getWallet(inputs, this.signaturesNumber, this.copayersNumber, this.coin, this.network);
    } catch (ex) {
      this.showLoadingSpinner = false;
      return this.showMessage(ex.message, 3);
    }
    this.showMessage('Scanning funds...', 1);

    const reportFn = (currentGap, activeAddresses) => {
      let balance, unitToSatoshi = 1;

      balance = this.coin === 'bsv' ? _.sumBy(_.flatten(_.map(activeAddresses, 'utxo')), 'amount') : _.sumBy(activeAddresses, 'balance');

      if (this.coin === 'eth') {
        unitToSatoshi = 1e-18;
      } else if (this.coin === 'xrp') {
        unitToSatoshi = 1e-6;
        if (balance > this.xrpReserve) {
          this.showXrpLockedInfo = true;
          balance = balance - this.xrpReserve;
          this.reportXrpLocked = this.xrpReserve * unitToSatoshi + ' ' + this.wallet.coin.toUpperCase();
          this.totalBalanceLockedStr = 'Locked balance: ' + this.reportXrpLocked;
        }
      }

      const balStr = (balance * unitToSatoshi).toFixed(8) + ' ';
      this.reportInactive = currentGap;
      this.reportAmount = balStr + ' ' + this.wallet.coin.toUpperCase();
      this.reportAddresses = activeAddresses.length;
    };

    let gap = +this.addressGap;
    gap = gap ? gap : 20;

    this.recoveryService.scanWallet(this.wallet, this.coin, gap, this.account, reportFn, (err, res) => {
      if (err) {
        const error = err.message ? err.message : err;
        return this.showMessage(error, 3);
      }

      this.scanResults = res;

      if (this.coin === 'xrp') {
        this.scanResults.balance = this.scanResults.balance - this.xrpReserve;
      }

      console.log('## Total balance:', this.reportAmount);

      if (!this.recoveryService.stopSearching) {
        this.showMessage('Search completed', 2);
        this.showLoadingSpinner = false;
        this.beforeScan = false;
        this.totalBalanceStr = 'Available balance: ' + this.reportAmount;
        if ((this.scanResults.balance - this.fee) <= 0) {
          if (this.scanResults.balance > 0) {
            this.totalBalanceStr += '. Insufficient funds.';
          }
          this.insufficentsFunds = true;
        }
      }
    });
  }

  public fileChangeEvent($event, index: number): void {
    this.readThis($event.target, index);
  }

  private readThis(inputValue: any, index: number): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();

    myReader.readAsText(file);
    myReader.onloadend = (e) => {
      this.data.backUp[index] = myReader.result;
    };
  }

  public sendFunds(destinationAddress: string, chain: string): void {
    // tslint:disable-next-line:max-line-length
    const confirmMessage = 'A total of ' + this.reportAmount + ' will be send to: \n\nDestination address: ' + destinationAddress + '\nChain: ' + (chain.substring(0, 3)).toUpperCase();
    if (!confirm(confirmMessage)) {
      return;
    }

    let rawTx;

    this.showLoadingSpinner = true;

    try {
      rawTx = this.recoveryService.createRawTx(destinationAddress, this.scanResults, this.wallet, this.fee);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }
    this.done = true;

    this.recoveryService.txBroadcast(rawTx, this.coin, this.network).subscribe((response: any) => {
      this.txid = this.coin === 'bsv' ? response.data.transaction_hash : response.txid;
      const message = (this.scanResults.balance - this.fee).toFixed(8) + ' ' + this.wallet.coin.toUpperCase() + ' sent to address: '
        + destinationAddress + '. Transaction ID:' + this.txid;
      this.showMessage(message, 2);
      this.broadcasted = true;
      console.log('Transaction complete. ' + (this.scanResults.balance - this.fee) + ' TX sent to address: ' + destinationAddress);
      console.log('Transaction id: ', this.txid);
    }, () => {
      this.showMessage('Could not broadcast transaction. Please, try later. Raw Tx:' + rawTx, 3);
    });
  }

  public viewOnBlockchain(): void {
    let url: string;

    switch (this.chain) {
      case 'btc/livenet':
        url = 'https://insight.bitcore.io/#/BTC/mainnet/tx/';
        break;
      case 'btc/testnet':
        url = 'https://insight.bitcore.io/#/BTC/testnet/tx/';
        break;
      case 'bch/livenet':
        url = 'https://insight.bitcore.io/#/BCH/mainnet/tx/';
        break;
      case 'bch/testnet':
        url = 'https://insight.bitcore.io/#/BCH/testnet/tx/';
        break;
      case 'bsv/livenet':
        url = 'https://bchsvexplorer.com/tx/';
        break;
      case 'eth/livenet':
        url = 'https://insight.bitcore.io/#/ETH/mainnet/tx/';
        break;
      case 'xrp/livenet':
        url = 'https://xrpscan.com/tx/';
        break;
      case 'xrp/testnet':
        url = 'https://test.bithomp.com/explorer/';
        break;
      default:
        url = 'https://insight.bitcore.io/#/BTC/mainnet/tx/';
    }

    const win = window.open(url + this.txid, '_blank');
    win.focus();
  }

  private hideMessage(): void {
    this.statusMessage = null;
    this.successMessage = null;
    this.errorMessage = null;
  }

  public showMessage(message: string, type: number): void {
    /*
      1 = status
      2 = success
      3 = error
    */

    if (type === 1) {
      this.statusMessage = message;
      this.successMessage = null;
      this.errorMessage = null;
    } else if (type === 2) {
      this.successMessage = message;
      this.statusMessage = null;
      this.errorMessage = null;
      this.showLoadingSpinner = false;
    } else if (type === 3) {
      this.errorMessage = message;
      this.statusMessage = null;
      this.successMessage = null;
      this.showLoadingSpinner = false;
    }
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 150);
  }

  public updateAddressGap(): void {
    this.disableGapChange = false;
    switch (this.chain) {
      case 'xrp/livenet':
      case 'xrp/testnet':
      case 'eth/livenet':
        this.addressGap = 1;
        this.disableGapChange = true;
        break;
      default:
        this.addressGap = 20;
    }
  }
}
