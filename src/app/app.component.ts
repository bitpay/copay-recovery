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
  public availableNetworks: Array<any>;
  public signaturesNumber: number; //m
  public copayersNumber: number; //n
  public network: string; //net
  public addressGap: number;
  public beforeScan: boolean;
  public copayers = [1];
  public data: any;
  public statusMessage: string;
  public successMessage: string;
  public errorMessage: string;
  public totalBalance: any;
  public destinationAddress: string;
  public showLoadingSpinner: boolean;

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
    this.availableNetworks = ['livenet', 'testnet'];
    this.fee = 0.0001;
    this.signaturesNumber = this.availableOptions[0];
    this.copayersNumber = this.availableOptions[0];
    this.network = this.availableNetworks[0];
    this.statusMessage = null;
    this.successMessage = null;
    this.errorMessage = null;
    this.showLoadingSpinner = false;
  }

  ngOnInit() {
    this.beforeScan = true;
    this.destinationAddress = '';
    this.hideMessage();
  }

  updateCopayersForm() {
    this.copayers = _.map(_.range(1, this.copayersNumber + 1), function (i) {
      return i;
    });
  }

  processInputs() {
    this.hideMessage();
    let self = this;
    this.showLoadingSpinner = true;
    this.beforeScan = true;

    var inputs = _.map(_.range(1, this.copayersNumber + 1), function (i) {
      return {
        backup: self.data.backUp[i] || '',
        password: self.data.pass[i] || '',
        xPrivPass: self.data.passX[i] || '',
      }
    });

    try {
      this.wallet = this.RecoveryService.getWallet(inputs, this.signaturesNumber, this.copayersNumber, this.network);
    } catch (ex) {
      this.showLoadingSpinner = false;
      return this.showMessage(ex.message, 3);
    }
    this.showMessage('Scanning funds...', 1);

    var reportFn = function (data) {
      console.log('Report:', data);
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
      this.totalBalance = "Available balance: " + this.scanResults.balance.toFixed(8) + ' BTC';
      if ((this.scanResults.balance - this.fee) <= 0)
        this.totalBalance += ". Insufficents funds.";
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
    myReader.onloadend = function (e) {
      self.data.backUp[index] = myReader.result;
    }
  }

  sendFunds(destinationAddress: string) {
    var rawTx;

    this.showLoadingSpinner = true;

    try {
      rawTx = this.RecoveryService.createRawTx(destinationAddress, this.scanResults, this.wallet, this.fee);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }

    this.RecoveryService.txBroadcast(rawTx, this.network).then((response: any) => {
      response.subscribe(resp => {
        this.showMessage((this.scanResults.balance - this.fee).toFixed(8) + ' BTC sent to address: ' + destinationAddress, 2);
        console.log('Transaction complete. ' + (this.scanResults.balance - this.fee) + ' BTC sent to address: ' + destinationAddress);
      });
      // TODO check error cases
    })
      .catch(err => {
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
