webpackJsonp([1],{

/***/ "../../../../../src async recursive":
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = "../../../../../src async recursive";

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"header\">\n  <div class=\"header-content\">\n    <img class=\"bitpay-logo\" src=\"assets/img/bitpay-logo-negative.svg\" alt=\"Bitpay\">\n    <div class=\"header-center\">\n      <h3 class=\"header-title\">Recovery Tool v8</h3>\n      <div class=\"repository-link\">\n        <a href=\"https://github.com/bitpay/copay-recovery\" target=\"blank\">\n          <img src=\"assets/img/github.png\" alt=\"Github\">\n        </a>\n      </div>\n    </div>\n    <img class=\"copay-logo\" src=\"assets/img/copay-logo-negative.svg\" alt=\"Copay\">\n  </div>\n</div>\n<div [hidden]=\"!showLoadingSpinner\" class=\"no-clickable-background\">\n  <div class=\"loading-message\">\n    <h5>Please wait</h5>\n    <h5>This process could take several minutes</h5>\n    <PRE *ngIf=\"(reportAddresses || reportAmount || reportInactive) && beforeScan\">\n      <div class=\"labels\">\n        Active addresses found:\n        Total funds found:\n        Inactive Addresses Streak:\n      </div>\n      <div class=\"values\">\n        {{reportAddresses}}\n        {{reportAmount}}\n        {{reportInactive}}\n      </div>\n    </PRE>\n    <div>\n      <button type=\"button\" (click)=\"ngOnInit()\" class=\"btn btn-outline-default btn-lg\">Cancel</button>\n    </div>\n  </div>\n</div>\n<div class=\"container\">\n\n  <div [hidden]=\"!successMessage\" class=\"alert alert-success\">{{successMessage}}</div>\n  <div [hidden]=\"!errorMessage\" class=\"alert alert-danger\">{{errorMessage}}</div>\n  <div [hidden]=\"!statusMessage\" class=\"alert alert-info\">{{statusMessage}}</div>\n\n  <form #processInputsForm=\"ngForm\" (ngSubmit)=\"processInputs()\" *ngIf=\"beforeScan\">\n\n    <div class=\"card\">\n      <div class=\"card-block\">\n        <h4 class=\"card-title\">WALLET CONFIGURATION</h4>\n        <div class=\"row\">\n          <div class=\"col-sm-12 col-xs-12 first-row\">\n            <div class=\"form-group signatures\">\n              <label for=\"signaturesNumber\">Required number of signatures</label>\n              <select class=\"form-control\" id=\"signaturesNumber\" name=\"signaturesNumber\" [(ngModel)]=\"signaturesNumber\">\n                <option *ngFor=\"let option of availableOptions\" [ngValue]=\"option\">{{option}}</option>\n              </select>\n            </div>\n\n            <div class=\"form-group copayers\">\n              <label for=\"copayersNumber\">Total number of Copayers</label>\n              <select class=\"form-control\" id=\"copayersNumber\" name=\"copayersNumber\" [(ngModel)]=\"copayersNumber\" (ngModelChange)=\"updateCopayersForm($event)\">\n                <option *ngFor=\"let option of availableOptions\" [ngValue]=\"option\">{{option}}</option>\n              </select>\n            </div>\n          </div>\n\n          <div class=\"form-group col-sm-6 col-xs-12\">\n            <label for=\"chain\">Chain: Bitcoin</label>\n            <span *ngIf=\"chain == 'btc/livenet'\">livenet</span>\n            <span *ngIf=\"chain == 'btc/testnet'\">testnet</span>\n            <span *ngIf=\"chain == 'bch/livenet'\">Cash livenet</span>\n            <span *ngIf=\"chain == 'bch/testnet'\">Cash testnet</span>\n            <span *ngIf=\"chain == 'bsv/livenet'\">Satoshi livenet</span>\n            <div class=\"chain-select\">\n              <select class=\"form-control\" id=\"chain\" name=\"chain\" [(ngModel)]=\"chain\">\n                <option *ngFor=\"let chain of availableChains\" [ngValue]=\"chain\">{{chain}}</option>\n              </select>\n              <div class=\"chain-logo-container\">\n                <img src=\"assets/img/icon-btc.svg\" class=\"chain-logo\" *ngIf=\"chain == 'btc/livenet'\">\n                <img src=\"assets/img/icon-testnet.svg\" class=\"chain-logo\" *ngIf=\"chain == 'btc/testnet' || chain == 'bch/testnet'\">\n                <img src=\"assets/img/icon-bch.svg\" class=\"chain-logo\" *ngIf=\"chain == 'bch/livenet'\">\n              </div>\n            </div>\n          </div>\n\n          <div class=\"form-group col-sm-3 col-xs-12\">\n            <label for=\"addressGap\">Address Gap*</label>\n            <input type=\"number\" min=\"0\" class=\"form-control\" id=\"addressGap\" name=\"addressGap\" [(ngModel)]=\"addressGap\" required>\n          </div>\n          <div class=\"form-group col-sm-3 col-xs-12\">\n            <label for=\"account\">Account*</label>\n            <input type=\"number\" min=\"0\" class=\"form-control\" id=\"account\" name=\"account\" [(ngModel)]=\"account\" required>\n          </div>\n          <div class=\"col-sm-6 offset-sm-6 col-xs-12\">\n            <small>*Usually does not need to be changed</small>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"card\" *ngFor=\"let copayer of copayers\">\n      <div class=\"card-block\">\n        <h6 class=\"card-title\">Backup for copayer {{copayer}}:</h6>\n        <div class=\"row\">\n          <div class=\"form-group col-sm-6\">\n            <label for=\"dataBackUp\">Recovery phrase (mnemonic) or File/Text backup</label>\n            <input type=\"text\" class=\"form-control\" id=\"dataBackUp-{{copayer}}\" name=\"dataBackUp-{{copayer}}\" [(ngModel)]=\"data.backUp[copayer]\" autocomplete=\"off\">\n          </div>\n\n          <div class=\"form-group col-sm-6\">\n            <label for=\"contentFile\">Or upload a File/Text backup:</label>\n            <input type=\"file\" class=\"form-control-file\" id=\"contentFile\" name=\"contentFile\" accept=\".json, .txt\" aria-describedby=\"contentFileHelp\" (change)=\"fileChangeEvent($event, copayer)\">\n            <small id=\"fileHelp\" class=\"form-text text-muted\">Extensions accepted: .json and .txt</small>\n          </div>\n        </div>\n\n        <div class=\"form-group\">\n          <label for=\"dataPass\">Backup password:</label><small> (in case you have one)</small>\n          <input type=\"password\" class=\"form-control\" id=\"dataPass-{{copayer}}\" name=\"dataPass-{{copayer}}\" [(ngModel)]=\"data.pass[copayer]\" autocomplete=\"off\">\n        </div>\n\n        <div class=\"form-group\">\n          <label for=\"dataPassX\">Encrypted private key password</label><small> (encrypt password)</small>\n          <input type=\"password\" class=\"form-control\" id=\"dataPassX-{{copayer}}\" name=\"dataPassX-{{copayer}}\" [(ngModel)]=\"data.passX[copayer]\" autocomplete=\"off\">\n        </div>\n      </div>\n    </div>\n\n\n    <div class=\"form-group\">\n      <label>\n        <input type=\"checkbox\" [(ngModel)]=\"termsAccepted\" name=\"termsAccepted\">\n        I have read and accept <a href=\"https://copay.io/disclaimer\" target=\"_blank\">Terms and Conditions</a>\n      </label>\n    </div>\n\n    <button type=\"submit\" [disabled]=\"!processInputsForm.form.valid  || showLoadingSpinner || !termsAccepted\" class=\"btn btn-primary btn-lg btn-block\">\n      <span *ngIf=\"chain == 'btc/livenet' || chain == 'btc/testnet'\">Scan BTC Wallet</span>\n      <span *ngIf=\"chain == 'bch/livenet' || chain == 'bch/testnet'\">Scan BCH Wallet</span>\n      <span *ngIf=\"chain == 'bsv/livenet'\">Scan BSV Wallet</span>\n    </button>\n  </form>\n\n  <form #sendFundsForm=\"ngForm\" (ngSubmit)=\"sendFunds(destinationAddress, chain)\" *ngIf=\"!beforeScan && !done\">\n    <div class=\"card\">\n      <div class=\"card-block\">\n        <h6 class=\"card-title\">{{totalBalanceStr}}</h6>\n        <div class=\"input-group\" *ngIf=\"!insufficentsFunds\">\n          <div class=\"input-group-addon\">Destination Address:</div>\n          <input type=\"text\" class=\"form-control\" id=\"destinationAddress\" name=\"destinationAddress\" [(ngModel)]=\"destinationAddress\" required>\n        </div>\n      </div>\n    </div>\n    <button type=\"submit\" *ngIf=\"!insufficentsFunds\" [disabled]=\"!sendFundsForm.form.valid || showLoadingSpinner\" class=\"btn btn-primary btn-lg btn-block\">Transfer</button>\n  </form>\n\n  <button type=\"button\" (click)=\"viewOnBlockchain()\" *ngIf=\"broadcasted\" class=\"btn btn-outline-primary btn-lg btn-block\">View on blockchain</button>\n  <button type=\"button\" (click)=\"ngOnInit()\" *ngIf=\"!beforeScan\" class=\"btn btn-outline-primary btn-lg btn-block\">Go\n    back</button>\n\n  <div [hidden]=\"!showLoadingSpinner\">\n    <div class=\"s1\">\n      <div class=\"s b sb1\"></div>\n      <div class=\"s b sb2\"></div>\n      <div class=\"s b sb3\"></div>\n      <div class=\"s b sb4\"></div>\n    </div>\n    <div class=\"s2\">\n      <div class=\"s b sb5\"></div>\n      <div class=\"s b sb6\"></div>\n      <div class=\"s b sb7\"></div>\n      <div class=\"s b sb8\"></div>\n    </div>\n    <div class=\"bigcon\">\n      <div class=\"big b\"></div>\n    </div>\n  </div>\n\n</div>"

/***/ }),

/***/ "../../../../../src/app/app.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash__ = __webpack_require__("../../../../lodash/lodash.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_services_recovery_service__ = __webpack_require__("../../../../../src/app/services/recovery.service.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AppComponent = /** @class */ (function () {
    function AppComponent(recoveryService) {
        this.recoveryService = recoveryService;
        this.copayers = [1];
        this.addressGap = 20;
        this.account = 0;
        this.data = {
            backUp: [],
            pass: [],
            passX: [],
            gap: this.addressGap
        };
        this.availableOptions = [1, 2, 3, 4, 5, 6];
        this.availableChains = ['btc/livenet', 'btc/testnet', 'bch/livenet', 'bch/testnet', 'bsv/livenet'];
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
    AppComponent.prototype.ngOnInit = function () {
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
    };
    AppComponent.prototype.checkAngularCryptoConfig = function () {
        var result = this.recoveryService.checkAngularCryptoConfig();
        if (result) {
            this.showMessage(result, 3);
        }
    };
    AppComponent.prototype.updateCopayersForm = function () {
        this.copayers = __WEBPACK_IMPORTED_MODULE_1_lodash__["map"](__WEBPACK_IMPORTED_MODULE_1_lodash__["range"](1, this.copayersNumber + 1), function (i) {
            return i;
        });
    };
    AppComponent.prototype.processInputs = function () {
        var _this = this;
        this.hideMessage();
        this.showLoadingSpinner = true;
        this.beforeScan = true;
        this.recoveryService.stopSearching = false;
        var inputs = __WEBPACK_IMPORTED_MODULE_1_lodash__["map"](__WEBPACK_IMPORTED_MODULE_1_lodash__["range"](1, this.copayersNumber + 1), function (i) {
            return {
                backup: _this.data.backUp[i] || '',
                password: _this.data.pass[i] || '',
                xPrivPass: _this.data.passX[i] || '',
            };
        });
        if (this.chain.match(/bch/)) {
            this.network = this.chain.replace('bch/', '');
            this.coin = 'bch';
            this.fee = 0.0001;
        }
        else if (this.chain.match(/bsv/)) {
            this.network = this.chain.replace('bsv/', '');
            this.coin = 'bsv';
            this.fee = 0.0001;
        }
        else {
            this.network = this.chain.replace('btc/', '');
            this.coin = 'btc';
            this.fee = 0.001;
        }
        try {
            this.wallet = this.recoveryService.getWallet(inputs, this.signaturesNumber, this.copayersNumber, this.coin, this.network);
        }
        catch (ex) {
            this.showLoadingSpinner = false;
            return this.showMessage(ex.message, 3);
        }
        this.showMessage('Scanning funds...', 1);
        var reportFn = function (currentGap, activeAddresses) {
            var balance;
            if (_this.coin === 'bsv') {
                // Use OLD Insight
                balance = __WEBPACK_IMPORTED_MODULE_1_lodash__["sumBy"](__WEBPACK_IMPORTED_MODULE_1_lodash__["flatten"](__WEBPACK_IMPORTED_MODULE_1_lodash__["map"](activeAddresses, 'utxo')), 'amount');
            }
            else {
                balance = __WEBPACK_IMPORTED_MODULE_1_lodash__["sumBy"](activeAddresses, 'balance');
            }
            var balStr = balance.toFixed(8) + ' ';
            _this.reportInactive = currentGap;
            _this.reportAmount = balStr + ' ' + _this.wallet.coin.toUpperCase();
            _this.reportAddresses = activeAddresses.length;
        };
        var gap = +this.addressGap;
        gap = gap ? gap : 20;
        this.recoveryService.scanWallet(this.wallet, this.coin, gap, this.account, reportFn, function (err, res) {
            if (err) {
                var error = err.message ? err.message : err;
                return _this.showMessage(error, 3);
            }
            _this.scanResults = res;
            console.log('## Total balance:', _this.scanResults.balance.toFixed(8) + ' ' + _this.wallet.coin.toUpperCase());
            if (!_this.recoveryService.stopSearching) {
                _this.showMessage('Search completed', 2);
                _this.showLoadingSpinner = false;
                _this.beforeScan = false;
                _this.totalBalance = _this.scanResults.balance.toFixed(8);
                _this.totalBalanceStr = 'Available balance: ' + _this.scanResults.balance.toFixed(8) + ' ' + _this.wallet.coin.toUpperCase();
                if ((_this.scanResults.balance - _this.fee) <= 0) {
                    if (_this.scanResults.balance > 0) {
                        _this.totalBalanceStr += '. Insufficient funds.';
                    }
                    _this.insufficentsFunds = true;
                }
            }
        });
    };
    AppComponent.prototype.fileChangeEvent = function ($event, index) {
        this.readThis($event.target, index);
    };
    AppComponent.prototype.readThis = function (inputValue, index) {
        var _this = this;
        var file = inputValue.files[0];
        var myReader = new FileReader();
        myReader.readAsText(file);
        myReader.onloadend = function (e) {
            _this.data.backUp[index] = myReader.result;
        };
    };
    AppComponent.prototype.sendFunds = function (destinationAddress, chain) {
        var _this = this;
        // tslint:disable-next-line:max-line-length
        var confirmMessage = 'A total of ' + this.totalBalance + ' will be send to: \n\nDestination address: ' + destinationAddress + '\nChain: ' + (chain.substring(0, 3)).toUpperCase();
        if (!confirm(confirmMessage)) {
            return;
        }
        var rawTx;
        this.showLoadingSpinner = true;
        try {
            rawTx = this.recoveryService.createRawTx(destinationAddress, this.scanResults, this.wallet, this.fee);
        }
        catch (ex) {
            return this.showMessage(ex.message, 3);
        }
        this.done = true;
        this.recoveryService.txBroadcast(rawTx, this.coin, this.network).subscribe(function (response) {
            _this.txid = _this.coin === 'bsv' ? response.data.transaction_hash : response.txid;
            var message = (_this.scanResults.balance - _this.fee).toFixed(8) + ' ' + _this.wallet.coin.toUpperCase() + ' sent to address: '
                + destinationAddress + '. Transaction ID:' + _this.txid;
            _this.showMessage(message, 2);
            _this.broadcasted = true;
            console.log('Transaction complete. ' + (_this.scanResults.balance - _this.fee) + ' TX sent to address: ' + destinationAddress);
            console.log('Transaction id: ', _this.txid);
        }, function () {
            _this.showMessage('Could not broadcast transaction. Please, try later. Raw Tx:' + rawTx, 3);
        });
    };
    AppComponent.prototype.viewOnBlockchain = function () {
        var url;
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
            default:
                url = 'https://insight.bitcore.io/#/BTC/mainnet/tx/';
        }
        var win = window.open(url + this.txid, '_blank');
        win.focus();
    };
    AppComponent.prototype.hideMessage = function () {
        this.statusMessage = null;
        this.successMessage = null;
        this.errorMessage = null;
    };
    AppComponent.prototype.showMessage = function (message, type) {
        /*
          1 = status
          2 = success
          3 = error
        */
        if (type === 1) {
            this.statusMessage = message;
            this.successMessage = null;
            this.errorMessage = null;
        }
        else if (type === 2) {
            this.successMessage = message;
            this.statusMessage = null;
            this.errorMessage = null;
            this.showLoadingSpinner = false;
        }
        else if (type === 3) {
            this.errorMessage = message;
            this.statusMessage = null;
            this.successMessage = null;
            this.showLoadingSpinner = false;
        }
        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 150);
    };
    var _a;
    AppComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__("../../../../../src/app/app.component.html"),
            styles: [__webpack_require__("../../../../../src/app/app.component.scss")],
            providers: [__WEBPACK_IMPORTED_MODULE_2__app_services_recovery_service__["a" /* RecoveryService */]]
        }),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__app_services_recovery_service__["a" /* RecoveryService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__app_services_recovery_service__["a" /* RecoveryService */]) === "function" && _a || Object])
    ], AppComponent);
    return AppComponent;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("../../../platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("../../../forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__("../../../common/@angular/common/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__app_component__ = __webpack_require__("../../../../../src/app/app.component.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["b" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClientModule */]
            ],
            providers: [],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ "../../../../../src/app/services/recovery.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_sjcl__ = __webpack_require__("../../../../sjcl/sjcl.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_sjcl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_sjcl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_bitcore_lib__ = __webpack_require__("../../../../bitcore-lib/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_bitcore_lib___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_bitcore_lib__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_bitcore_lib_cash__ = __webpack_require__("../../../../bitcore-lib-cash/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_bitcore_lib_cash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_bitcore_lib_cash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_bitcore_mnemonic__ = __webpack_require__("../../../../bitcore-mnemonic/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_bitcore_mnemonic___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_bitcore_mnemonic__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_lodash__ = __webpack_require__("../../../../lodash/lodash.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_common_http__ = __webpack_require__("../../../common/@angular/common/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_catch__ = __webpack_require__("../../../../rxjs/add/operator/catch.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_catch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rxjs_add_operator_catch__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RecoveryService; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var RecoveryService = /** @class */ (function () {
    function RecoveryService(http) {
        this.http = http;
        this.apiURI = {
            'btc/livenet': 'https://api.bitcore.io/api/BTC/mainnet/',
            'btc/testnet': 'https://api.bitcore.io/api/BTC/testnet/',
            'bch/livenet': 'https://api.bitcore.io/api/BCH/mainnet/',
            'bch/testnet': 'https://api.bitcore.io/api/BCH/testnet/',
            'bsv/livenet': 'https://bchsvexplorer.com/api/',
        };
        this.activeAddrCoinType = '';
        this.stopSearching = false;
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
                }
            }
        };
    }
    RecoveryService.prototype.fromBackup = function (data, m, n, coin, network) {
        try {
            JSON.parse(data.backup);
        }
        catch (ex) {
            console.log(ex);
            throw new Error('JSON invalid. Please copy only the text within (and including) the { } brackets around it.');
        }
        var payload;
        try {
            payload = __WEBPACK_IMPORTED_MODULE_1_sjcl__["decrypt"](data.password, data.backup);
        }
        catch (ex) {
            console.log(ex);
            throw new Error('Incorrect backup password');
        }
        payload = JSON.parse(payload);
        // Support for old file formats
        var credentials = payload.credentials ? payload.credentials : payload;
        var key = payload.key ? payload.key : payload;
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
        var xPriv = key.xPrivKey;
        if (key.xPrivKeyEncrypted) {
            try {
                xPriv = __WEBPACK_IMPORTED_MODULE_1_sjcl__["decrypt"](data.xPrivPass, key.xPrivKeyEncrypted);
            }
            catch (ex) {
                console.log(ex);
                throw new Error('Can not decrypt private key');
            }
        }
        var derivationStrategy = credentials.rootPath ? this.getDerivationStrategy(credentials.rootPath) :
            (credentials.derivationStrategy ? credentials.derivationStrategy : 'BIP45');
        var credential = {
            walletId: credentials.walletId,
            copayerId: credentials.copayerId,
            publicKeyRing: credentials.publicKeyRing,
            xPriv: xPriv,
            derivationStrategy: derivationStrategy,
            addressType: derivationStrategy === 'BIP45' ? 'P2SH' : credentials.addressType,
            m: m,
            n: n,
            network: network,
            coin: coin,
            from: 'backup',
        };
        return credential;
    };
    RecoveryService.prototype.checkAngularCryptoConfig = function () {
        var mnemonics = 'imitate type scorpion whip oil cheese achieve rail organ donkey note screen';
        try {
            new __WEBPACK_IMPORTED_MODULE_4_bitcore_mnemonic__(mnemonics).toHDPrivateKey('', 'testnet').toString();
        }
        catch (ex) {
            console.log(ex);
            return 'Before starting, check the angular cli configuration described in the README/Installation section';
        }
        return null;
    };
    RecoveryService.prototype.fromMnemonic = function (data, m, n, coin, network) {
        if (!data.backup) {
            return null;
        }
        var words = __WEBPACK_IMPORTED_MODULE_5_lodash__["trim"](data.backup);
        var passphrase = data.password;
        var xPriv;
        try {
            xPriv = new __WEBPACK_IMPORTED_MODULE_4_bitcore_mnemonic__(words).toHDPrivateKey(passphrase, network).toString();
        }
        catch (ex) {
            console.log(ex);
            throw new Error('Mnemonic wallet seed is not valid.');
        }
        var credential = {
            xPriv: xPriv,
            derivationStrategy: 'BIP44',
            addressType: n === 1 ? 'P2PKH' : 'P2SH',
            m: m,
            n: n,
            network: network,
            coin: coin,
            from: 'mnemonic',
        };
        return credential;
    };
    RecoveryService.prototype.buildWallet = function (credentials) {
        var result;
        credentials = __WEBPACK_IMPORTED_MODULE_5_lodash__["compact"](credentials);
        if (credentials.length === 0) {
            throw new Error('No data provided');
        }
        if (__WEBPACK_IMPORTED_MODULE_5_lodash__["uniq"](__WEBPACK_IMPORTED_MODULE_5_lodash__["map"](credentials, 'from')).length !== 1) {
            throw new Error('Mixed backup sources not supported');
        }
        // tslint:disable-next-line:max-line-length
        result = __WEBPACK_IMPORTED_MODULE_5_lodash__["pick"](credentials[0], ['walletId', 'derivationStrategy', 'addressType', 'm', 'n', 'network', 'from', 'coin', 'publicKeyRing']);
        // only for backup files
        result.copayers = __WEBPACK_IMPORTED_MODULE_5_lodash__["map"](credentials, function (c) {
            if (c.walletId !== result.walletId) {
                throw new Error('Backups do not belong to the same wallets.');
            }
            return {
                copayerId: c.copayerId,
                xPriv: c.xPriv,
            };
        });
        if (result.from === 'backup') {
            if (__WEBPACK_IMPORTED_MODULE_5_lodash__["uniq"](__WEBPACK_IMPORTED_MODULE_5_lodash__["compact"](__WEBPACK_IMPORTED_MODULE_5_lodash__["map"](result.copayers, 'copayerId'))).length !== result.copayers.length) {
                throw new Error('Some of the backups belong to the same copayers');
            }
        }
        console.log('Recovering wallet', result);
        return result;
    };
    RecoveryService.prototype.getWallet = function (data, m, n, coin, network) {
        var _this = this;
        var credentials = __WEBPACK_IMPORTED_MODULE_5_lodash__["map"](data, function (dataItem) {
            dataItem.backup = __WEBPACK_IMPORTED_MODULE_5_lodash__["trim"](dataItem.backup);
            if (dataItem.backup.charAt(0) === '{') {
                return _this.fromBackup(dataItem, m, n, coin, network);
            }
            else {
                return _this.fromMnemonic(dataItem, m, n, coin, network);
            }
        });
        if (coin === 'btc') {
            this.bitcore = __WEBPACK_IMPORTED_MODULE_2_bitcore_lib__;
        }
        else if (coin === 'bch' || coin === 'bsv') {
            this.bitcore = __WEBPACK_IMPORTED_MODULE_3_bitcore_lib_cash__;
        }
        else {
            throw new Error('Unknown coin ' + coin);
        }
        return this.buildWallet(credentials);
    };
    RecoveryService.prototype.scanWallet = function (wallet, coin, inGap, account, reportFn, cb) {
        var utxos;
        // getting main addresses
        this.getActiveAddresses(wallet, inGap, account, reportFn, function (err, addresses) {
            if (err) {
                return cb(err);
            }
            utxos = __WEBPACK_IMPORTED_MODULE_5_lodash__["flatten"](__WEBPACK_IMPORTED_MODULE_5_lodash__["map"](addresses, 'utxo'));
            var result = {
                addresses: __WEBPACK_IMPORTED_MODULE_5_lodash__["uniq"](addresses),
                balance: coin === 'bsv' ? __WEBPACK_IMPORTED_MODULE_5_lodash__["sumBy"](utxos, 'amount') : __WEBPACK_IMPORTED_MODULE_5_lodash__["sumBy"](addresses, 'balance'),
            };
            return cb(null, result);
        });
    };
    RecoveryService.prototype.getPaths = function (wallet, account) {
        if (wallet.derivationStrategy === 'BIP45') {
            var p = __WEBPACK_IMPORTED_MODULE_5_lodash__["clone"](this.PATHS[wallet.derivationStrategy]);
            // adds copayer's paths
            for (var i = 0; i < wallet.n; i++) {
                var copayerPaths = ['m/45\'/' + i + '/0', 'm/45\'/' + i + '/1'];
                p = p.concat(copayerPaths);
            }
            return p;
        }
        if (wallet.derivationStrategy === 'BIP44') {
            var paths = this.getPathsWithAccount(wallet, account);
            return paths[wallet.derivationStrategy][wallet.coin][wallet.network];
        }
    };
    RecoveryService.prototype.getPathsWithAccount = function (wallet, account) {
        var paths = __WEBPACK_IMPORTED_MODULE_5_lodash__["cloneDeep"](this.PATHS);
        paths[wallet.derivationStrategy][wallet.coin][wallet.network].forEach(function (path, i) {
            paths[wallet.derivationStrategy][wallet.coin][wallet.network][i] = path.replace(/ACCOUNT/, "" + account);
        });
        return paths;
    };
    RecoveryService.prototype.getHdDerivations = function (wallet, account) {
        var _this = this;
        var deriveOne = function (xpriv, path, compliant) {
            var hdPrivateKey = _this.bitcore.HDPrivateKey(xpriv);
            var xPrivKey = compliant ? hdPrivateKey.deriveChild(path) : hdPrivateKey.deriveNonCompliantChild(path);
            return xPrivKey;
        };
        var expand = function (groups) {
            if (groups.length === 1) {
                return groups[0];
            }
            var combine = function (g1, g2) {
                var combinations = [];
                for (var i = 0; i < g1.length; i++) {
                    for (var j = 0; j < g2.length; j++) {
                        combinations.push(__WEBPACK_IMPORTED_MODULE_5_lodash__["flatten"]([g1[i], g2[j]]));
                    }
                }
                return combinations;
            };
            return combine(groups[0], expand(__WEBPACK_IMPORTED_MODULE_5_lodash__["tail"](groups)));
        };
        var xPrivKeys = __WEBPACK_IMPORTED_MODULE_5_lodash__["map"](wallet.copayers, 'xPriv');
        var derivations = [];
        __WEBPACK_IMPORTED_MODULE_5_lodash__["each"](this.getPaths(wallet, account), function (path) {
            var derivation = expand(__WEBPACK_IMPORTED_MODULE_5_lodash__["map"](xPrivKeys, function (xpriv, i) {
                var compliant = deriveOne(xpriv, path, true);
                var nonCompliant = deriveOne(xpriv, path, false);
                var items = [];
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
    };
    RecoveryService.prototype.getActiveAddresses = function (wallet, inGap, account, reportFn, cb) {
        var _this = this;
        var activeAddress = [];
        var inactiveCount;
        var baseDerivations = this.getHdDerivations(wallet, account);
        var exploreDerivation = function (i) {
            if (i >= baseDerivations.length) {
                return cb(null, __WEBPACK_IMPORTED_MODULE_5_lodash__["uniqBy"](activeAddress, 'address'));
            }
            inactiveCount = 0;
            derive(baseDerivations[i], 0, function (err, addresses) {
                if (err) {
                    return cb(err);
                }
                exploreDerivation(i + 1);
            });
        };
        var derive = function (baseDerivation, index, callback) {
            if (_this.stopSearching) {
                return callback(null);
            }
            var path = baseDerivation.path || baseDerivation[0].path;
            if (inactiveCount > inGap || path.match(_this.activeAddrCoinType) === null) {
                return callback();
            }
            var address = _this.generateAddress(wallet, baseDerivation, index);
            _this.checkAddressData(address, wallet.coin, wallet.network, function (err, addressData) {
                if (err) {
                    return callback(err);
                }
                if (!__WEBPACK_IMPORTED_MODULE_5_lodash__["isEmpty"](addressData)) {
                    addressData.balance = addressData.balance * 1e-8;
                    console.log('#Active address:', addressData, baseDerivation, wallet.network);
                    if (wallet.derivationStrategy !== 'BIP45') {
                        _this.activeAddrCoinType = _this.getActiveAddrCoinType(wallet, path);
                    }
                    activeAddress.push(addressData);
                    inactiveCount = 0;
                }
                else {
                    inactiveCount++;
                }
                reportFn(inactiveCount, __WEBPACK_IMPORTED_MODULE_5_lodash__["uniqBy"](activeAddress, 'address'));
                derive(baseDerivation, index + 1, callback);
            });
        };
        exploreDerivation(0);
    };
    RecoveryService.prototype.getActiveAddrCoinType = function (wallet, path) {
        // This function avoids searching on another derivation paths when an active address has already been found in one of them
        if (wallet.coin === 'btc' && wallet.network === 'livenet') {
            return path.match(/m\/44\'\/0\'/) ? 'm/44\'/0\'' : 'm/48\'/0\'';
        }
        else if (wallet.coin === 'btc' && wallet.network === 'testnet') {
            return path.match(/m\/44\'\/1\'/) ? 'm/44\'/1\'' : 'm/48\'/1\'';
        }
        else if (wallet.coin === 'bch' && wallet.network === 'livenet') {
            return path.match(/m\/44\'\/145\'/) ? 'm/44\'/145\'' :
                (path.match(/m\/48\'\/145\'/) ? 'm/48\'/145\'' : 'm/44\'/0\'');
        }
        else if (wallet.coin === 'bch' && wallet.network === 'testnet') {
            return path.match(/m\/44\'\/1\'/) ? 'm/44\'/1\'' : 'm/48\'/1\'';
        }
        else {
            return path;
        }
    };
    RecoveryService.prototype.generateAddress = function (wallet, derivedItems, index) {
        var _this = this;
        var derivedPrivateKeys = [];
        var derivedPublicKeys = [];
        __WEBPACK_IMPORTED_MODULE_5_lodash__["each"]([].concat(derivedItems), function (item) {
            var hdPrivateKey = _this.bitcore.HDPrivateKey(item.key);
            // private key derivation
            var derivedPrivateKey = hdPrivateKey.deriveChild(index).privateKey;
            derivedPrivateKeys.push(derivedPrivateKey);
            // public key derivation
            derivedPublicKeys.push(derivedPrivateKey.publicKey);
        });
        if (wallet.publicKeyRing) {
            var hdPublicKey_1;
            var derivedItemsArray = [].concat(derivedItems);
            var path_1 = derivedItemsArray[0].path.split('/');
            var isChange_1 = parseInt(__WEBPACK_IMPORTED_MODULE_5_lodash__["last"](path_1).toString(), 10);
            derivedPublicKeys = [];
            wallet.publicKeyRing.forEach(function (item) {
                if (wallet.derivationStrategy === 'BIP45') {
                    // (sharedId = 2147483647 )
                    var copayerId = parseInt(__WEBPACK_IMPORTED_MODULE_5_lodash__["nth"](path_1, -2).toString(), 10);
                    hdPublicKey_1 = new _this.bitcore.HDPublicKey(item.xPubKey).deriveChild(copayerId).deriveChild(isChange_1).deriveChild(index);
                }
                else {
                    if (wallet.derivationStrategy === 'BIP44') {
                        hdPublicKey_1 = new _this.bitcore.HDPublicKey(item.xPubKey).deriveChild(isChange_1).deriveChild(index);
                    }
                }
                derivedPublicKeys.push(hdPublicKey_1.publicKey);
            });
        }
        var address;
        if (wallet.addressType === 'P2SH') {
            address = this.bitcore.Address.createMultisig(derivedPublicKeys, wallet.m, wallet.network);
        }
        else if (wallet.addressType === 'P2PKH') {
            address = this.bitcore.Address.fromPublicKey(derivedPublicKeys[0], wallet.network);
        }
        else {
            throw new Error('Address type not supported');
        }
        return {
            addressObject: address,
            pubKeys: derivedPublicKeys,
            privKeys: derivedPrivateKeys,
            info: derivedItems,
            index: index,
        };
    };
    RecoveryService.prototype.checkAddressData = function (address, coin, network, cb) {
        if (coin === 'bsv') {
            this.getAddressDataBsv(address, coin, network, cb);
        }
        else {
            this.checkAddress(address, coin, network, cb);
        }
    };
    RecoveryService.prototype.getBsvAddressFromLegacy = function (address) {
        var obj = __WEBPACK_IMPORTED_MODULE_2_bitcore_lib__["Address"](address).toObject();
        return this.bitcore.Address.fromObject(obj).toString(true);
    };
    RecoveryService.prototype.getAddressDataBsv = function (address, coin, network, cb) {
        var _this = this;
        // call insight API to get address information
        this.checkAddressBsv(address.addressObject, coin, network).then(function (respAddressObs) {
            respAddressObs.subscribe(function (respAddress) {
                // call insight API to get utxo information
                _this.getAddressTxos(address.addressObject.toCashAddress(), coin, network).subscribe(function (respUtxoData) {
                    // Old insight returns address in Legacy format
                    var addr = _this.getBsvAddressFromLegacy(respAddress.addrStr);
                    var cashFormatUtxo = [];
                    respUtxoData.forEach(function (utxo) {
                        utxo.address = _this.getBsvAddressFromLegacy(utxo.address);
                        cashFormatUtxo.push(utxo);
                    });
                    var addressData = {
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
                    setTimeout(function () {
                        if (addressData.isActive) {
                            return cb(null, addressData);
                        }
                        return cb();
                    }, 1000);
                });
            });
        });
    };
    RecoveryService.prototype.checkAddressBsv = function (address, coin, network) {
        var _this = this;
        var addr = address.toString();
        var url = this.apiURI[coin + '/' + network] + 'addr/' + addr + '?noTxList=1';
        return new Promise(function (resolve) {
            resolve(_this.http.get(url));
        });
    };
    RecoveryService.prototype.checkAddress = function (address, coin, network, cb) {
        var addr = address.addressObject.toString(true);
        this.getAddressTxos(addr, coin, network).subscribe(function (txos) {
            var utxos = __WEBPACK_IMPORTED_MODULE_5_lodash__["filter"](txos, ['spentHeight', -2]);
            var addressData = {
                address: addr,
                balance: __WEBPACK_IMPORTED_MODULE_5_lodash__["sumBy"](utxos, 'value'),
                utxo: utxos,
                privKeys: address.privKeys,
                pubKeys: address.pubKeys,
                info: address.info,
                index: address.index,
                isActive: txos.length > 0,
            };
            /* This timeout is because we must not exceed the limit of 30 requests per minute to the server.
            If you do, you will get an HTTP 429 error */
            setTimeout(function () {
                if (addressData.isActive) {
                    return cb(null, addressData);
                }
                return cb();
            }, 1000);
        }, function (err) {
            return cb(err);
        });
    };
    RecoveryService.prototype.getAddressTxos = function (addr, coin, network) {
        var url;
        if (coin === 'bsv') {
            url = this.apiURI[coin + '/' + network] + 'addr/' + addr + '/utxo?noCache=1';
        }
        else {
            url = this.apiURI[coin + '/' + network] + 'address/' + addr + '/?limit=999';
        }
        return this.http.get(url).catch(function (err) {
            throw err;
        });
    };
    RecoveryService.prototype.createRawTx = function (toAddress, scanResults, wallet, fee) {
        if (!toAddress || !this.bitcore.Address.isValid(toAddress)) {
            throw new Error('Please enter a valid address.');
        }
        var amount = parseInt((scanResults.balance * 1e8 - fee * 1e8).toFixed(0), 10);
        if (amount <= 0) {
            throw new Error('Funds are insufficient to complete the transaction');
        }
        console.log('Generating a ' + wallet.coin + ' transaction');
        try {
            var checkAddress = new this.bitcore.Address(toAddress, wallet.network);
            console.log('Check address: ', checkAddress);
        }
        catch (ex) {
            console.log(ex);
            throw new Error('Incorrect destination address network');
        }
        try {
            var privKeys_1 = [];
            var tx_1 = new this.bitcore.Transaction();
            __WEBPACK_IMPORTED_MODULE_5_lodash__["each"](scanResults.addresses, function (address) {
                if (address.utxo.length > 0) {
                    __WEBPACK_IMPORTED_MODULE_5_lodash__["each"](address.utxo, function (u) {
                        if (wallet.coin !== 'bsv') {
                            u.txid = u.mintTxid;
                            u.outputIndex = u.mintIndex;
                            u.satoshis = u.value;
                        }
                        if (wallet.addressType === 'P2SH') {
                            tx_1.from(u, address.pubKeys, wallet.m);
                        }
                        else {
                            tx_1.from(u);
                        }
                        privKeys_1 = privKeys_1.concat(address.privKeys.slice(0, wallet.m));
                    });
                }
            });
            tx_1.to(toAddress, amount);
            tx_1.sign(__WEBPACK_IMPORTED_MODULE_5_lodash__["uniq"](privKeys_1));
            var rawTx = tx_1.serialize();
            console.log('Raw transaction: ', rawTx);
            return rawTx;
        }
        catch (ex) {
            console.log(ex);
            throw new Error('Could not build tx: ' + ex);
        }
    };
    RecoveryService.prototype.txBroadcast = function (rawTx, coin, network) {
        var url, data;
        if (coin === 'bsv') {
            url = 'https://api.blockchair.com/bitcoin-sv/push/transaction';
            data = { data: rawTx };
        }
        else {
            url = this.apiURI[coin + '/' + network] + 'tx/send';
            data = { rawTx: rawTx };
        }
        console.log('Posting tx to...' + url);
        return this.http.post(url, data).catch(function (err) {
            throw err;
        });
    };
    RecoveryService.prototype.parsePath = function (path) {
        return {
            purpose: path.split('/')[1],
            coinCode: path.split('/')[2],
            account: path.split('/')[3]
        };
    };
    RecoveryService.prototype.getDerivationStrategy = function (path) {
        var purpose = this.parsePath(path).purpose;
        var derivationStrategy;
        switch (purpose) {
            case '45\'':
                derivationStrategy = 'BIP45';
                break;
            default:
                derivationStrategy = 'BIP44';
                break;
        }
        return derivationStrategy;
    };
    var _a;
    RecoveryService = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_6__angular_common_http__["b" /* HttpClient */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__angular_common_http__["b" /* HttpClient */]) === "function" && _a || Object])
    ], RecoveryService);
    return RecoveryService;
}());

//# sourceMappingURL=recovery.service.js.map

/***/ }),

/***/ "../../../../../src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("../../../platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("../../../../../src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("../../../../../src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 1:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 3:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[5]);
//# sourceMappingURL=main.bundle.js.map