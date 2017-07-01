'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = undefined;

var SKILL_NAME = "Krypto Kurs";
var GET_FACT_MESSAGE = "Hier ist dein zufälliger Kurs: ";
var HELP_MESSAGE = "Du kannst mich nach einem Kurs für eine beliebige Kryptowährung fragen oder eine bestimmte Anzahl einer Kryptowährung in eine konventionelle Währung umrechnen lassen.";
var HELP_REPROMPT = "Womit kann ich dir helfen?";
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
]

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
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
                this.emit(':tellWithCard', speechOutput, SKILL_NAME, emitString);
        });
    },
    'GetCryptoCurrencyExchangeRateInCurrencyIntent': function () {
        var currency = this.event.request.intent.slots.currency.value;
        var cryptoCurrency = this.event.request.intent.slots.cryptoCurrency.value;
        var currencyShort = '';

        if (currency == 'euro') {
            currencyShort = 'EUR';
        }
        if ((currency == 'dollar') || (currency == 'us-dollar')) {
            currencyShort = 'USD';
        }

        var myRequest = {crCu:cryptoCurrency,cuSh:currencyShort};
        httpGet(myRequest,  (myResult) => {
                this.attributes.lastSearch = {currency};
                this.attributes.lastSearch.lastSpeech = myResult;
                var emitString = '';
                var numberCurrencyValue = 0.0;
                if (currencyShort == 'USD') {
                    numberCurrencyValue = Math.floor((Number(myResult[0].price_usd)) * 100) / 100;
                    emitString = 'Ein ' + myResult[0].name + ' ist momentan $ ' + numberCurrencyValue + ' wert';
                }
                if (currencyShort == 'EUR') {
                    numberCurrencyValue = Math.floor((Number(myResult[0].price_eur)) * 100) / 100;
                    emitString = 'Ein ' + myResult[0].name + ' ist momentan ' + numberCurrencyValue + ' € wert';
                }
                this.emit(':tell', emitString );
        });
    },
    'GetAmountOfCryptoCurrencyInCurrencyIntent': function () {
      var amount = this.event.request.intent.slots.amount.value;
      amount = parseInt(amount);
      var currency = this.event.request.intent.slots.currency.value;
      var cryptoCurrency = this.event.request.intent.slots.cryptoCurrency.value;
      var currencyShort = '';
      console.log('Wert von amount: ', amount);
      console.log('Wert von currency: ', currency);
      console.log('Wert von cryptoCurrency: ', cryptoCurrency);

      if (currency == 'euro') {
          currencyShort = 'EUR';
      }
      if ((currency == 'dollar') || (currency == 'us-dollar')) {
          currencyShort = 'USD';
      }
      console.log('Wert von currencyShort: ', currencyShort);

      var myRequest = {crCu:cryptoCurrency,cuSh:currencyShort};
      httpGet(myRequest,  (myResult) => {
              this.attributes.lastSearch = {currency};
              this.attributes.lastSearch.lastSpeech = myResult;
              var emitString = '';
              var numberCurrencyValue = 0.0;
              var amountOfCryptoCurrencyInCurrency = 0.0;
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
              this.emit(':tell', emitString );
          });
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};

var http = require('http');
// https is a default part of Node.JS.  Read the developer doc:  https://nodejs.org/api/https.html
// try other APIs such as the current bitcoin price : https://btc-e.com/api/2/btc_usd/ticker  returns ticker.last

function httpGet(myData, callback) {
  console.log("got to the http function");
    // GET is a web service request that is fully defined by a URL string
    // Try GET in your browser:
    // http://numbersapi.com/42

    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'api.coinmarketcap.com',
        path: '/v1/ticker/' + encodeURIComponent(myData.crCu) + '/?convert=' + encodeURIComponent(myData.cuSh),
        method: 'GET',
    };

    console.log('Inhalt von curSh: ', myData.curSH);

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            console.log('Zurückgegebene Daten: ', returnData, typeof(returnData));
            var returnDataJSON = JSON.parse(returnData);
            console.log('Zurückgegebener Datenstring als Objekt: ', returnDataJSON);
            console.log('Zurückgegebener Datenstring als Objekt, zugriff auf Key name: ', returnDataJSON[0].price_eur);
            callback(returnDataJSON);  // this will execute whatever function the caller defined, with one argument
        });

    });
    req.end();

}
