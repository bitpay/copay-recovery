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
  public signaturesNumber: number; //m
  public copayersNumber: number; //n
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

  constructor(private RecoveryService: RecoveryService) {
    this.addressGap = 20;
    this.data = {
      backUp: [],
      pass: [],
      passX: [],
      gap: this.addressGap
    };
    this.availableOptions = [1, 2, 3, 4, 5, 6];
    this.availableChains = ['btc/livenet', 'btc/testnet', 'bch/livenet'];
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
    this.checkAngularCryptoConfig();
  }

  checkAngularCryptoConfig() {
    var result = this.RecoveryService.checkAngularCryptoConfig('imitate type scorpion whip oil cheese achieve rail organ donkey note screen');
    if (result) this.showMessage(result, 3);
  }

  updateCopayersForm() {
    this.copayers = _.map(_.range(1, this.copayersNumber + 1), function(i) {
      return i;
    });
  }

  processInputs() {
    this.hideMessage();
    let self = this;
    this.showLoadingSpinner = true;
    this.beforeScan = true;

    var inputs = _.map(_.range(1, this.copayersNumber + 1), function(i) {
      return {
        backup: self.data.backUp[i] || '',
        password: self.data.pass[i] || '',
        xPrivPass: self.data.passX[i] || '',
      }
    });

    if (this.chain.match(/bch/)) {
      this.network = 'livenet';
      this.coin = 'bch';
      this.fee = 0.000002;
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

    var reportFn = function(currentGap, activeAddresses) {
      var balance = _.sumBy(_.flatten(_.map(activeAddresses, "utxo")), 'amount');
      var balStr = balance.toFixed(8) + ' ';
      self.reportInactive = currentGap;
      self.reportAmount = balStr + ' ' + self.wallet.coin;
      self.reportAddresses = activeAddresses.length;
    };

    var gap = +this.addressGap;
    gap = gap ? gap : 20;

    this.RecoveryService.scanWallet(this.wallet, gap, reportFn, (err, res) => {
      if (err) return this.showMessage(err, 3);

      this.scanResults = res;
      console.log('## Total balance:', this.scanResults.balance.toFixed(8) + ' BTC');

      this.showMessage('Search completed', 2);
      this.showLoadingSpinner = false;
      this.beforeScan = false;
      this.totalBalance = this.scanResults.balance.toFixed(8);
      this.totalBalanceStr = "Available balance: " + this.scanResults.balance.toFixed(8) + ' ' + this.wallet.coin.toUpperCase();
      if ((this.scanResults.balance - this.fee) <= 0) {
        this.totalBalanceStr += ". Insufficents funds.";
        this.insufficentsFunds = true;
      }
    });
  }

  fileChangeEvent($event, index: number): void {
    this.readThis($event.target, index);
  }

  readThis(inputValue: any, index: number): void {
    let self = this;
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.readAsText(file);
    myReader.onloadend = function(e) {
      self.data.backUp[index] = myReader.result;
    }
  }

  sendFunds(destinationAddress: string, chain: string) {
    if (!confirm('A total of ' + this.totalBalance + ' will be send to: \n\nDestination address: ' + destinationAddress + '\nChain: ' + chain.substring(0, 3).toUpperCase())) {
      return;
    }

    var rawTx;

    this.showLoadingSpinner = true;

    try {
      rawTx = this.RecoveryService.createRawTx(destinationAddress, this.scanResults, this.wallet, this.fee);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }
    this.done = true;

    this.RecoveryService.txBroadcast(rawTx, this.coin, this.network).then((response: any) => {
      response.subscribe(resp => {
        this.showMessage((this.scanResults.balance - this.fee).toFixed(8) + ' ' + this.wallet.coin + ' sent to address: ' + destinationAddress, 2);
        console.log('Transaction complete. ' + (this.scanResults.balance - this.fee) + ' TX sent to address: ' + destinationAddress);
        this.broadcasted = true;
      });
    }).catch(err => {
      this.showMessage('Could not broadcast transaction. Please, try later.', 3);
    });
  };

  hideMessage() {
    this.statusMessage = null;
    this.successMessage = null;
    this.errorMessage = null;
  }

  showMessage(message: string, type: number) {
    /*
      1 = status
      2 = success
      3 = error
    */

    if (type == 1) {
      this.statusMessage = message;
      this.successMessage = null;
      this.errorMessage = null;
    } else if (type == 2) {
      this.successMessage = message;
      this.statusMessage = null;
      this.errorMessage = null;
      this.showLoadingSpinner = false;
    } else if (type == 3) {
      this.errorMessage = message;
      this.statusMessage = null;
      this.successMessage = null;
      this.showLoadingSpinner = false;
    }
  }

}
