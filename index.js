const express = require('express');
require('dotenv').config();

const app = express();

// Get vars from ".env" file
const PORT = process.env.PORT || '8082'
const liraExchangeRate = process.env.liraExchangeRate;

// Middleware to read JSON
app.use(express.json());

// Routes

app.post('/calculate-cost', (req, res) => {

    // 0. Get data from request
    const {

        initialCost, // This cost needs to be in TRY currency

        commission, // This is an array of objects with the following structure: 
        // { 
        //     type: 'percent' | 'fixed', 
        //     value: number, 
        //     currency: 'TRY' | 'RUB' 
        // }

        extraCharge // This is an amount of money to increase the price in RUB

    } = req.body;

    // 1. Convert initialCost to RUB
    let rubInitialCost = initialCost * liraExchangeRate;

    // 2. Calculate commission
    for (let i = 0; i < commission.length; i++) {

        // If currency is TRY
        if (commission[i].currency === 'TRY') {

            // If commission type is percent so add % and convert to RUB
            if (commission[i].type === 'percent') rubInitialCost += rubInitialCost * commission[i].value / 100;

            // If commission type is fixed, just add it to the initial cost
            else rubInitialCost += commission[i].value;

        } else {

            // If commission type is percent, just add %
            if (commission[i].type === 'percent') rubInitialCost += commission[i].value / liraExchangeRate;

            // If commission type is fixed, just add it to the initial cost
            else rubInitialCost -= commission[i].value;

        }
    }

    // 3. Add extra charge
    let result = rubInitialCost + extraCharge;

    // 4. Return result & log it
    console.log("\"/calculate-cost\":", result)

    res.json({
        result: result
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

            // If commission type is percent so substract % and convert to RUB
            if (commission[i].type === 'percent') cost -= cost * commission[i].value / 100;

            // If commission type is fixed, just substract it from the initial cost and convert it to RUB
            else cost -= commission[i].value;

        } else {

            // If commission type is percent, just substract %
            if (commission[i].type === 'percent') cost -= commission[i].value / liraExchangeRate;

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