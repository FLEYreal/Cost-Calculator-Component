const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || '8082'

const liraExchangeRate = process.env.liraExchangeRate;

app.use(express.json());

app.post('/calculate', (req, res) => {
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

    let rubInitialCost = initialCost * liraExchangeRate;

    for(let i = 0; i < commission.length; i++) {
        if(commission[i].currency === 'TRY') {
            if(commission[i].type === 'percent') {
                rubInitialCost += rubInitialCost * commission[i].value / 100;
            } else {
                rubInitialCost += commission[i].value;
            }
        } else {
            if(commission[i].type === 'percent') {
                rubInitialCost += commission[i].value / liraExchangeRate;
            } else {
                rubInitialCost += commission[i].value * liraExchangeRate;
            }
        }
    }

    console.log(rubInitialCost, extraCharge)
    res.json({
        result: rubInitialCost + extraCharge
    })
});

app.listen(PORT, (e) => {
    if(e) {
        console.log('Error: ', e)
    } else {
        console.log('Server OK')
    }
})