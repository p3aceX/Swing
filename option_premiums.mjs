import { log, pow, sqrt, exp } from 'mathjs';
import pkg from 'jstat';
const { jStat } = pkg;

// Black-Scholes formula for Call and Put options
function blackScholesCall(S, K, T, r, sigma) {
    const d1 = (log(S / K) + (r + 0.5 * pow(sigma, 2)) * T) / (sigma * sqrt(T));
    const d2 = d1 - sigma * sqrt(T);
    const call = S * jStat.normal.cdf(d1, 0, 1) - K * exp(-r * T) * jStat.normal.cdf(d2, 0, 1);
    return call;
}

function blackScholesPut(S, K, T, r, sigma) {
    const d1 = (log(S / K) + (r + 0.5 * pow(sigma, 2)) * T) / (sigma * sqrt(T));
    const d2 = d1 - sigma * sqrt(T);
    const put = K * exp(-r * T) * jStat.normal.cdf(-d2, 0, 1) - S * jStat.normal.cdf(-d1, 0, 1);
    return put;
}

// Function to calculate adjusted premiums
function calculatePremiums(currentSMI, strikePrices, T, r, sigma, wpfBatting) {
    let premiums = [];
    strikePrices.forEach(strike => {
        const callPremium = blackScholesCall(currentSMI, strike, T, r, sigma);
        const putPremium = blackScholesPut(currentSMI, strike, T, r, sigma);
        const adjustedCallPremium = callPremium * wpfBatting;
        const adjustedPutPremium = putPremium * (1 - wpfBatting);
        premiums.push({ strike, callPremium: adjustedCallPremium, putPremium: adjustedPutPremium });
    });
    return premiums;
}

// Export the calculatePremiums function
export { calculatePremiums };
