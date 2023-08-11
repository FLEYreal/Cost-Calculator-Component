const express = require('express');
require('dotenv').config();

const app = express();

// Get vars from ".env" file
const PORT = process.env.PORT || '8082'

const Rates = require('./rates');
const rates = new Rates();

// Middleware to read JSON
app.use(express.json());

// Routes

app.post('/calculate-cost', async (req, res) => {

    const liraExchangeRate = await rates.getTry();
    const usdExchangeRate = await rates.getUsd();

    // 0. Get data from request
    const {
        initialCostCurrency, // This is a currency of the initial cost, can be only USD | TRY | RUB
        initialCost, // The cost

        commission, // This is an array of objects with the following structure: 
        // { 
        //     type: 'percent' | 'fixed', 
        //     value: number, 
        //     currency: 'TRY' | 'RUB' 
        // }

        rateCommission, // This is a number of percent to increase the exchange rates
        // This value is made because of P2P trading which mostly used to transfer money abroad

        extraCharge // This is an amount of money to increase the price in RUB

    } = req.body;

    // 1. Convert initialCost to RUB
    let rubInitialCost;

    // 2. Convert initialCost to RUB
    if(initialCostCurrency === 'RUB') rubInitialCost = initialCost;
    else if(initialCostCurrency === 'USD') rubInitialCost = initialCost * ((usdExchangeRate / 100) * (100 + rateCommission));
    else if(initialCostCurrency === 'TRY') rubInitialCost = initialCost * ((liraExchangeRate / 100) * (100 + rateCommission));
    else rubInitialCost = initialCost;

    // 3. Add extra charge
    rubInitialCost += extraCharge;

    // 4. Calculate commission
    for (let i = 0; i < commission.length; i++) {

        // If currency is TRY
        if (commission[i].currency === 'TRY') {

            // If commission type is percent, just add %
            if (commission[i].type === 'percent') rubInitialCost += rubInitialCost * (commission[i].value / 100);

            // If commission type is fixed, just add it to the initial cost
            else rubInitialCost += commission[i].value * liraExchangeRate;
        } else {

            // If commission type is percent, just add %
            if (commission[i].type === 'percent') rubInitialCost += rubInitialCost * (commission[i].value / 100);

            // If commission type is fixed, just add it to the initial cost
            else rubInitialCost -= commission[i].value;
        }
    }

    // 5. Return result & log it
    console.log("\"/calculate-cost\":", rubInitialCost)

    res.json({
        result: rubInitialCost
    })
});

app.post('/calculate-profit', async (req, res) => {

    const liraExchangeRate = await rates.getTry();
    const usdExchangeRate = await rates.getUsd();

    // 0. Get data from request
    let {

        cost, // This is a cost of a good, which is in RUB
        spends, // Amount of money spent which is in TRY

        commission, // This is an array of objects with the following structure: 
        // { 
        //     type: 'percent' | 'fixed', 
        //     value: number, 
        //     currency: 'TRY' | 'RUB' 
        // }

        rateCommission, // This is a number of percent to increase the exchange rates
        // This value is made because of P2P trading which mostly used to transfer money abroad

    } = req.body;

    // 1. Calculate commission
    for (let i = 0; i < commission.length; i++) {

        if (commission[i].currency === 'TRY') {

            // If commission type is percent, just substract %
            if (commission[i].type === 'percent') cost -= cost * (commission[i].value / 100);

            // If commission type is fixed, just substract it from the initial cost and convert it to RUB
            else cost -= commission[i].value  * ((liraExchangeRate / 100) * (100 + rateCommission));

        } else {

            // If commission type is percent, just substract %
            if (commission[i].type === 'percent') cost -= cost * (commission[i].value / 100);

            // If commission type is fixed, just substract it from the initial cost
            else cost -= commission[i].value;

        }
    }

    // 2. Substract spends after all commissions:
    cost = cost - (((spends * liraExchangeRate) / 100) * (100 + rateCommission))

    // 3. Return result & log it
    console.log("\"/calculate-profit\":", cost)

    res.json({
        result: cost
    })
})

// Start server
app.listen(PORT, (e) => {
    if (e) console.log('Error: ', e)
    else console.log('Server OK')
})