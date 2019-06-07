# Recovery Tool
A simple UI to recover funds from Copay backups.

## Installation
Get the source code:

```
git clone git@github.com:bitpay/copay-recovery.git && cd copay-recovery
npm install
```

Now you can run server with

```
npm start
```

### Postinstall (DEPRECATED)

It is not necessary anymore (running automaticaly after `npm install`).

For the use of Crypto in our code, a modification must be done in the @ angular / cli code.

Go to /copay-recovery/node_modules/@angular/cli/models/webpack-configs/common.js

And replace this node definition:
```
Node: {
             Fs: 'empty',
             Global: true,
             Crypto: true,
             Tls: 'empty',
             Net: 'empty'
             Process: true,
             Module: false,
             ClearImmediate: false,
             SetImmediate: false
       }
```

Specifically:
Crypto: 'empty' for crypto: true,

You can see the original discussion about this here: https://github.com/angular/angular-cli/issues/1548

## Public Installation

There is a public install of this software hosted at github at: 
https://bitpay.github.io/copay-recovery/

## About Recovery Tool

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.8.

### Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Publish web on Github Pages (gh-pages)

Simple command to generate pages for [Copay Recovery](https://bitpay.github.io/copay-recovery/):

```
npm run publish
```

### Install dependencies:

`npm i -g angular-cli-ghpages`

### To publish the web:

Go to `master` branch and run:

```
ngh
```

Successfully published!
