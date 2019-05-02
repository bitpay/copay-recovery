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
  public network: string;
  public coin: string;
  public addressGap: number;
  public beforeScan: boolean;
  public copayers = [1];
  public data: any;
  public termsAccepted: boolean;
  public statusMessage: string;
  public successMessage: string;
  public errorMessage: string;
  public totalBalanceStr: string;
  public totalBalance: number;
  public destinationAddress: string;
  public showLoadingSpinner: boolean;
  public done: boolean;
  public broadcasted: boolean;
  public insufficentsFunds: boolean;

  public reportAmount: string;
  public reportInactive: string;
  public reportAddresses: string;

  private wallet: any;
  private scanResults: any;
  private fee: number;
  private txid: string;

  constructor(
    private RecoveryService: RecoveryService
  ) {
    this.addressGap = 20;
    this.data = {
      backUp: [],
      pass: [],
      passX: [],
      gap: this.addressGap
    };
    this.availableOptions = [1, 2, 3, 4, 5, 6];
    this.availableChains = ['btc/livenet', 'btc/testnet', 'bch/livenet', 'bch/testnet'];
    this.fee = 0.001;
    this.signaturesNumber = this.availableOptions[0];
    this.copayersNumber = this.availableOptions[0];
    this.chain = this.availableChains[0];
    this.statusMessage = null;
    this.successMessage = null;
    this.errorMessage = null;
    this.showLoadingSpinner = false;
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
  }

  private checkAngularCryptoConfig(): void {
    const result = this.RecoveryService.checkAngularCryptoConfig();
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
    } else {
      this.network = this.chain.replace('btc/', '');
      this.coin = 'btc';
      this.fee = 0.001;
    }

    try {
      this.wallet = this.RecoveryService.getWallet(inputs, this.signaturesNumber, this.copayersNumber, this.coin, this.network);
    } catch (ex) {
      this.showLoadingSpinner = false;
      return this.showMessage(ex.message, 3);
    }
    this.showMessage('Scanning funds...', 1);

    const reportFn = (currentGap, activeAddresses) => {
      const balance = _.sumBy(activeAddresses, 'balance');
      const balStr = balance.toFixed(8) + ' ';
      this.reportInactive = currentGap;
      this.reportAmount = balStr + ' ' + this.wallet.coin.toUpperCase();
      this.reportAddresses = activeAddresses.length;
    };

    let gap = +this.addressGap;
    gap = gap ? gap : 20;

    this.RecoveryService.scanWallet(this.wallet, gap, reportFn, (err, res) => {
      if (err) {
        return this.showMessage(err, 3);
      }

      this.scanResults = res;
      console.log('## Total balance:', this.scanResults.balance.toFixed(8) + ' ' + this.wallet.coin.toUpperCase());

      this.showMessage('Search completed', 2);
      this.showLoadingSpinner = false;
      this.beforeScan = false;
      this.totalBalance = this.scanResults.balance.toFixed(8);
      this.totalBalanceStr = 'Available balance: ' + this.scanResults.balance.toFixed(8) + ' ' + this.wallet.coin.toUpperCase();
      if ((this.scanResults.balance - this.fee) <= 0) {
        if (this.scanResults.balance > 0) {
          this.totalBalanceStr += '. Insufficient funds.';
        }
        this.insufficentsFunds = true;
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
    const confirmMessage = 'A total of ' + this.totalBalance + ' will be send to: \n\nDestination address: ' + destinationAddress + '\nChain: ' + (chain.substring(0, 3)).toUpperCase();
    if (!confirm(confirmMessage)) {
      return;
    }

    let rawTx;

    this.showLoadingSpinner = true;

    try {
      rawTx = this.RecoveryService.createRawTx(destinationAddress, this.scanResults, this.wallet, this.fee);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }
    this.done = true;

    this.RecoveryService.txBroadcast(rawTx, this.coin, this.network).subscribe((response: any) => {
      const message = (this.scanResults.balance - this.fee).toFixed(8) + ' ' + this.wallet.coin.toUpperCase() + ' sent to address: '
        + destinationAddress + '. Transaction ID:' + response.txid;
      this.showMessage(message, 2);
      this.broadcasted = true;
      this.txid = response.txid;
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

}
