const axios = require('axios');

class Rates {
    // Constructor
    constructor() {
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
    }

    // Function that gets the rate of the needed currency from the "this.apiUrl"
    async getRate(currency) {
        try {
            const response = await axios.get(`${this.apiUrl}${currency}`);
            const rate = response.data.rates['RUB'];
            return rate;
        } catch (error) {
            console.error(`Не удалось получить курс валюты: ${error}`);
        }
    }

    // Get Dollars to Rub rate
    async getUsd() {
        return this.getRate('USD');
    }

    // Get Tether to Rub rate
    async getUsdt() {
        return this.getRate('USDT');
    }

    // Get Lira to Rub rate
    async getTry() {
        return this.getRate('TRY');
    }

    // Get Euro to Rub rate
    async getEur() {
        return this.getRate('EUR');
    }
}

module.exports = Rates;
