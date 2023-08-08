const axios = require('axios');

class Rates {
    constructor() {
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
    }

    async getRate(currency) {
        try {
            const response = await axios.get(`${this.apiUrl}${currency}`);
            const rate = response.data.rates['RUB'];
            return rate;
        } catch (error) {
            console.error(`Не удалось получить курс валюты: ${error}`);
        }
    }

    async getUsd() {
        return this.getRate('USD');
    }

    async getUsdt() {
        return this.getRate('USDT');
    }

    async getTry() {
        return this.getRate('TRY');
    }

    async getEur() {
        return this.getRate('EUR');
    }
}

module.exports = Rates;
