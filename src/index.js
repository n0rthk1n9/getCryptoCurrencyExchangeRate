'use strict';
var Alexa = require('alexa-sdk');
var http = require('http');

var APP_ID = 'amzn1.ask.skill.XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'; // replace with your own Skill-ID

var SKILL_NAME = "Krypto Kurs";
var GET_FACT_MESSAGE = "Hier ist dein zufälliger Kurs: ";
var HELP_MESSAGE = "Du kannst mich nach einem Kurs für eine beliebige Kryptowährung fragen oder eine bestimmte Anzahl einer Kryptowährung in eine konventionelle Währung umrechnen lassen.";
var STOP_MESSAGE = "Auf Wiedersehen und danke, dass du Krypto Kurs benutzt hast!";

var data = [
  "Bitcoin",
  "Ethereum",
  "Lykke",
  "Ripple",
  "Litecoin",
  "NEM",
  "Dash",
  "IOTA",
  "BitShares",
  "Monero",
  "Stratis",
  "Zcash",
  "AntShares",
  "Golem",
  "Steem",
  "Siacoin",
  "Waves",
  "BitConnect",
  "Gnosis",
  "Bytecoin",
  "Iconomi",
  "Augur",
  "Dogecoin",
  "Lisk",
  "Byteball"
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    // sample code form github provided by Amazon is wrong at this point!
    // alexa.appId is the right variable to put your local specified APP_ID in
    // alexa.APP_ID is WRONG!!
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetCryptoCurrencyExchangeRateIntent');
    },
    'GetCryptoCurrencyExchangeRateIntent': function () {
        var factArr = data;
        var factIndex = Math.floor(Math.random() * factArr.length);
        var cryptoCurrency = factArr[factIndex];
        var currency = 'euro';
        var currencyShort = 'EUR';
        var myRequest = {crCu:cryptoCurrency,cuSh:currencyShort};

        httpGet(myRequest,  (myResult) => {
                this.attributes.lastSearch = {currency};
                this.attributes.lastSearch.lastSpeech = myResult;
                var emitString = '';
                var numberCurrencyValue = 0.0;
                if (currencyShort == 'EUR') {
                    numberCurrencyValue = Math.floor((Number(myResult[0].price_eur)) * 100) / 100;
                    emitString = 'Ein ' + myResult[0].name + ' ist momentan ' + numberCurrencyValue + ' € wert';
                }
                var speechOutput = GET_FACT_MESSAGE + emitString;
                var smallImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/50/Bitcoin.png';
                this.emit(':tellWithCard', speechOutput, SKILL_NAME, emitString, smallImageUrl);
        });
    },
    'GetCryptoCurrencyExchangeRateInCurrencyIntent': function () {
        var currency = this.event.request.intent.slots.currency.value;
        var cryptoCurrency = this.event.request.intent.slots.cryptoCurrency.value;
        var currencyShort = '';

        if (currency == 'euro') {
            currencyShort = 'EUR';
        } else if (currency == 'dollar') {
            currencyShort = 'USD';
        } else if (currency == 'pfund') {
            currencyShort = 'GBP';
        } else {
            currencyShort = 'EUR';
        }

        var myRequest = {crCu:cryptoCurrency,cuSh:currencyShort};
        httpGet(myRequest,  (myResult) => {
                this.attributes.lastSearch = {currency};
                this.attributes.lastSearch.lastSpeech = myResult;
                var emitString = '';
                var numberCurrencyValue = 0.0;
                if (myResult[0] === undefined) {
                    var speechOutput = 'Das habe ich leider nicht verstanden, bitte versuche es noch einmal.';
                    this.emit(':ask', speechOutput);
                } else {
                    if (currencyShort == 'USD') {
                        numberCurrencyValue = Math.floor((Number(myResult[0].price_usd)) * 100) / 100;
                        emitString = 'Ein ' + myResult[0].name + ' ist momentan $ ' + numberCurrencyValue + ' wert';
                    }
                    if (currencyShort == 'EUR') {
                        numberCurrencyValue = Math.floor((Number(myResult[0].price_eur)) * 100) / 100;
                        emitString = 'Ein ' + myResult[0].name + ' ist momentan ' + numberCurrencyValue + ' € wert';
                    }
                    if (currencyShort == 'GBP') {
                        numberCurrencyValue = Math.floor((Number(myResult[0].price_gbp)) * 100) / 100;
                        emitString = 'Ein ' + myResult[0].name + ' ist momentan £ ' + numberCurrencyValue + ' wert';
                    }
                    this.emit(':tell', emitString);
                }

        });
    },
    'GetAmountOfCryptoCurrencyInCurrencyIntent': function () {
      var amount = this.event.request.intent.slots.amount.value;
      amount = parseInt(amount);
      if (isNaN(amount)) {
        var speechOutput = 'Das habe ich leider nicht verstanden, bitte versuche es noch einmal.';
        this.emit(':ask', speechOutput);
      } else {
          var currency = this.event.request.intent.slots.currency.value;
          var cryptoCurrency = this.event.request.intent.slots.cryptoCurrency.value;
          var currencyShort = '';

          if (currency == 'euro') {
              currencyShort = 'EUR';
          } else if (currency == 'dollar') {
              currencyShort = 'USD';
          } else if (currency == 'pfund') {
              currencyShort = 'GBP';
          } else {
              currencyShort = 'EUR';
          }

          var myRequest = {crCu:cryptoCurrency,cuSh:currencyShort};
          httpGet(myRequest,  (myResult) => {
                  this.attributes.lastSearch = {currency};
                  this.attributes.lastSearch.lastSpeech = myResult;
                  var emitString = '';
                  var numberCurrencyValue = 0.0;
                  var amountOfCryptoCurrencyInCurrency = 0.0;
                  if (myResult[0] === undefined) {
                      var speechOutput = 'Das habe ich leider nicht verstanden, bitte versuche es noch einmal.';
                      this.emit(':ask', speechOutput);
                  } else {
                      if (currencyShort == 'USD') {
                          numberCurrencyValue = Math.floor((Number(myResult[0].price_usd)) * 100) / 100;
                          amountOfCryptoCurrencyInCurrency = amount * numberCurrencyValue;
                          amountOfCryptoCurrencyInCurrency = Math.floor((Number(amountOfCryptoCurrencyInCurrency)) * 100) / 100;
                          if (amount > 1) {
                            emitString = amount + ' ' + myResult[0].name + ' sind momentan $ ' + amountOfCryptoCurrencyInCurrency + ' wert';
                          } else {
                            emitString = amount + ' ' + myResult[0].name + ' ist momentan $ ' + amountOfCryptoCurrencyInCurrency + ' wert';
                          }
                      }
                      if (currencyShort == 'EUR') {
                          numberCurrencyValue = Math.floor((Number(myResult[0].price_eur)) * 100) / 100;
                          amountOfCryptoCurrencyInCurrency = amount * numberCurrencyValue;
                          amountOfCryptoCurrencyInCurrency = Math.floor((Number(amountOfCryptoCurrencyInCurrency)) * 100) / 100;
                          if (amount > 1) {
                            emitString = amount + ' ' + myResult[0].name + ' sind momentan ' + amountOfCryptoCurrencyInCurrency + ' € wert';
                          } else {
                            emitString = amount + ' ' + myResult[0].name + ' ist momentan ' + amountOfCryptoCurrencyInCurrency + ' € wert';
                          }
                      }
                      if (currencyShort == 'GBP') {
                          numberCurrencyValue = Math.floor((Number(myResult[0].price_gbp)) * 100) / 100;
                          amountOfCryptoCurrencyInCurrency = amount * numberCurrencyValue;
                          amountOfCryptoCurrencyInCurrency = Math.floor((Number(amountOfCryptoCurrencyInCurrency)) * 100) / 100;
                          if (amount > 1) {
                            emitString = amount + ' ' + myResult[0].name + ' sind momentan £ ' + amountOfCryptoCurrencyInCurrency + ' wert';
                          } else {
                            emitString = amount + ' ' + myResult[0].name + ' ist momentan £ ' + amountOfCryptoCurrencyInCurrency + ' wert';
                          }
                      }
                      this.emit(':tell', emitString );
                  }
              });
          }
    },
    'Unhandled': function () {
        var speechOutput = HELP_MESSAGE;
        this.emit(':tell', speechOutput);
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        this.emit(':tell', speechOutput);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};

function httpGet(myData, callback) {
    var options = {
        host: 'api.coinmarketcap.com',
        path: '/v1/ticker/' + encodeURIComponent(myData.crCu) + '/?convert=' + encodeURIComponent(myData.cuSh),
        method: 'GET',
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            var returnDataJSON = JSON.parse(returnData);
            callback(returnDataJSON);
        });

    });
    req.end();

}
