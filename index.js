const express = require('express');
require('dotenv').config();

const app = express();

// Get vars from ".env" file
const PORT = process.env.PORT || '8082'
const liraExchangeRate = process.env.liraExchangeRate;
const usdExchangeRate = process.env.usdExchangeRate;

// Middleware to read JSON
app.use(express.json());

// Routes

app.post('/calculate-cost', (req, res) => {

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

        extraCharge // This is an amount of money to increase the price in RUB

    } = req.body;

    // 1. Convert initialCost to RUB
    let rubInitialCost;

    // 2. Convert initialCost to RUB
    if(initialCostCurrency === 'RUB') rubInitialCost = initialCost;
    else if(initialCostCurrency === 'USD') rubInitialCost = initialCost * usdExchangeRate;
    else if(initialCostCurrency === 'TRY') rubInitialCost = initialCost * liraExchangeRate;
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

app.post('/calculate-profit', (req, res) => {

    // 0. Get data from request
    let {

        cost, // This is a cost of a good, which is in RUB

        commission, // This is an array of objects with the following structure: 
        // { 
        //     type: 'percent' | 'fixed', 
        //     value: number, 
        //     currency: 'TRY' | 'RUB' 
        // }

    } = req.body;

    // 1. Calculate commission
    for (let i = 0; i < commission.length; i++) {

        if (commission[i].currency === 'TRY') {

            // If commission type is percent, just substract %
            if (commission[i].type === 'percent') cost -= cost * (commission[i].value / 100);

            // If commission type is fixed, just substract it from the initial cost and convert it to RUB
            else cost -= commission[i].value  * liraExchangeRate;

        } else {

            // If commission type is percent, just substract %
            if (commission[i].type === 'percent') cost -= cost * (commission[i].value / 100);

            // If commission type is fixed, just substract it from the initial cost
            else cost -= commission[i].value;

        }
    }

    // 2. Return result & log it
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