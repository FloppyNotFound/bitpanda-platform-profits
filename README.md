[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<h1>
<p align="center"><a href="https://www.bitpanda.com/en" target="_blank">Bitpanda</a>  Platform Profits Calculator</p>
</h1>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://paypal.me/floppynotfound" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
<a href="https://twitter.com/floppynotfound" target="_blank"><img src="https://img.shields.io/twitter/follow/floppynotfound.svg?style=social&label=Follow"></a>

</p>

## Description

[Bitpanda Platform](https://developers.bitpanda.com/platform/) Profits is a tool for calculating profits and amount of avalable assets by using the FIFO method (first in, first out).

Transactions done after holding a crypto for more than one year are tax free in Germany. This is respected within the app.

Note that Metal assets and fees are currently not implemented and therefore might not be calculated correctly.

## Disclaimer

You are free to use the code and the tool "as is". I am not giving tax advices and cannot be made liable for potential errors. Feel free to contact me if you stumble upon a scenario which you think is not yet implemented.

## Installation

```bash
$ yarn
# or
$ npm install
```

## Running the app

```bash
# development
$ yarn start
# or
$ npm run start

# watch mode
$ yarn start:dev
# or
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Starting the calculation

To be able to run the calculation, you need a Bitpanda Platform API token, which can be created on the Bitpanda website within your user settings.

Once you created a token, you can start the calculation by opening the website and providing the "apiToken" as a query parameter (replace TOKEN with the actual token):

http://localhost:3000/?apiToken=TOKEN

## Test

```bash
# unit tests
$ yarn test
# or
$ npm run test
```

## Support

If you like this tool and it helps you getting a better view on your Bitpanda assets and profits, I'd appreciate if you support my work via [Paypal Me](https://paypal.me/floppynotfound) or <a href="bitcoin:3ALWrVpWQdeYWzBivV33eSfpU1GcvxbJXW">Bitcoin </a> (Wallet Adress: 3ALWrVpWQdeYWzBivV33eSfpU1GcvxbJXW, min BTC 0.0010).

## Stay in touch

- Author - [Felix Wagner](https://twitter.com/floppynotfound)
- Twitter - [@FloppyNotFound](https://twitter.com/floppynotfound)

## License

Bitpanda Platform Profits is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
