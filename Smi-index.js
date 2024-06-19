import { DataProcessor } from './dataProcessor.js';
import { writeFileSync } from 'fs';

// Define enhanced weightages for events
const weightages = {
    single: 1,
    double: 2,
    triple: 3,
    four: 8,
    six: 12,
    noBall: 3,
    wide: 3,
    dotBall: -2,
    wicket: -10,
    maidenOver: -6,
    consecutiveWickets: -15,
    runRateChange: -4,
    randomVolatility: 2 // Adding a small random factor for volatility
};

function calculateSMIForInning(inningIndex) {
    let SMI = 1000;
    let SMIHistory = [SMI];

    const ballByBallEvents = dataProcessor.getBallByBallEvents(inningIndex);

    let totalRuns = 0;
    let totalBalls = 0;
    let wicketsInCurrentOver = 0;
    let previousRunRate = 0;

    ballByBallEvents.forEach(event => {
        const runs = event.runs;
        const extras = event.extras;
        const wicket = event.wicket;
        let SMIChange = 0;

        if (runs > 0) {
            if (runs === 1) SMIChange += weightages.single;
            if (runs === 2) SMIChange += weightages.double;
            if (runs === 3) SMIChange += weightages.triple;
            if (runs === 4) SMIChange += weightages.four;
            if (runs === 6) SMIChange += weightages.six;
        }
        if (extras > 0) {
            SMIChange += extras * weightages.noBall;
        }

        if (runs === 0) SMIChange += weightages.dotBall;
        if (wicket) {
            SMIChange += weightages.wicket;
            wicketsInCurrentOver += 1;
        }

        totalBalls += 1;
        if (totalBalls % 6 === 0) {
            if (wicketsInCurrentOver > 1) {
                SMIChange += weightages.consecutiveWickets;
            }
            wicketsInCurrentOver = 0;

            const overs = totalBalls / 6;
            const currentRunRate = totalRuns / overs;
            const runRateChange = currentRunRate - previousRunRate;
            SMIChange += runRateChange * weightages.runRateChange;
            previousRunRate = currentRunRate;

            if (overs > 0 && totalRuns === 0) {
                SMIChange += weightages.maidenOver;
            }
        }

        totalRuns += runs + extras;

        SMI += SMIChange + (Math.random() - 0.5) * weightages.randomVolatility;
        SMI = Math.round(SMI);
        SMIHistory.push(SMI);
    });

    return SMIHistory;
}

const filePath = 'data/1346944.json';
const dataProcessor = new DataProcessor(filePath);

const SMIHistoryInning1 = calculateSMIForInning(0);
const SMIHistoryInning2 = calculateSMIForInning(1);

writeFileSync('public/SMIHistoryInning1.json', JSON.stringify(SMIHistoryInning1, null, 2));
writeFileSync('public/SMIHistoryInning2.json', JSON.stringify(SMIHistoryInning2, null, 2));

console.log('SMI history for both innings has been saved.');
