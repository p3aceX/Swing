import { readFileSync, writeFileSync } from 'fs';
import { calculatePremiums } from './option_premiums.mjs';

class DataProcessor {
    constructor(filePath) {
        this.data = this.loadData(filePath);
        this.inningSummaries = this.processData();
    }

    loadData(filePath) {
        const rawData = readFileSync(filePath);
        return JSON.parse(rawData);
    }

    processData() {
        return this.data.innings.map(inning => {
            const totalRuns = inning.overs.reduce((sum, over) => {
                return sum + over.deliveries.reduce((overSum, delivery) => {
                    return overSum + delivery.runs.total;
                }, 0);
            }, 0);

            const totalWickets = inning.overs.reduce((sum, over) => {
                return sum + over.deliveries.filter(delivery => delivery.wickets).length;
            }, 0);

            const battingSummary = this.summarizeBatting(inning);
            const bowlingSummary = this.summarizeBowling(inning);
            const fallOfWickets = this.summarizeFallOfWickets(inning);

            return {
                team: inning.team,
                totalRuns,
                totalWickets,
                overs: `${inning.overs.length}.${inning.overs[inning.overs.length - 1].deliveries.length}`,
                battingSummary,
                bowlingSummary,
                fallOfWickets
            };
        });
    }

    summarizeBatting(inning) {
        const batterStats = {};

        inning.overs.forEach(over => {
            over.deliveries.forEach(delivery => {
                const batter = delivery.batter;
                const runs = delivery.runs.batter;
                const balls = delivery.extras ? 0 : 1; // Exclude extras from ball count
                const dismissal = delivery.wickets ? `${delivery.wickets[0].kind} b ${delivery.wickets[0].fielders ? delivery.wickets[0].fielders[0].name : ''}` : '';

                if (!batterStats[batter]) {
                    batterStats[batter] = { Runs: 0, Balls: 0, Fours: 0, Sixes: 0, Dismissal: '' };
                }

                batterStats[batter].Runs += runs;
                batterStats[batter].Balls += balls;
                if (runs === 4) batterStats[batter].Fours += 1;
                if (runs === 6) batterStats[batter].Sixes += 1;
                if (dismissal) batterStats[batter].Dismissal = dismissal;
            });
        });

        return Object.keys(batterStats).map(batter => {
            const stats = batterStats[batter];
            return {
                batter,
                ...stats,
                StrikeRate: ((stats.Runs / stats.Balls) * 100).toFixed(2)
            };
        });
    }

    summarizeBowling(inning) {
        const bowlerStats = {};

        inning.overs.forEach(over => {
            over.deliveries.forEach(delivery => {
                const bowler = delivery.bowler;
                const runs = delivery.runs.total;
                const balls = delivery.extras ? 0 : 1; // Exclude extras from ball count
                const wickets = delivery.wickets ? delivery.wickets.length : 0;

                if (!bowlerStats[bowler]) {
                    bowlerStats[bowler] = { Runs: 0, Balls: 0, Wickets: 0 };
                }

                bowlerStats[bowler].Runs += runs;
                bowlerStats[bowler].Balls += balls;
                bowlerStats[bowler].Wickets += wickets;
            });
        });

        return Object.keys(bowlerStats).map(bowler => {
            const stats = bowlerStats[bowler];
            const overs = Math.floor(stats.Balls / 6);
            const remainingBalls = stats.Balls % 6;
            return {
                bowler,
                overs: `${overs}.${remainingBalls}`,
                runs: stats.Runs,
                wickets: stats.Wickets,
                economyRate: ((stats.Runs / stats.Balls) * 6).toFixed(2)
            };
        });
    }

    summarizeFallOfWickets(inning) {
        const fallOfWickets = [];
        let totalRuns = 0;

        inning.overs.forEach(over => {
            over.deliveries.forEach(delivery => {
                totalRuns += delivery.runs.total;
                if (delivery.wickets) {
                    delivery.wickets.forEach(wicket => {
                        fallOfWickets.push(`${totalRuns}-${wicket.player_out} (${delivery.batter}, ${over.over}.${delivery.batter})`);
                    });
                }
            });
        });

        return fallOfWickets;
    }

    getInningSummaries() {
        return this.inningSummaries;
    }

    getBattingSummary(inningIndex) {
        return this.inningSummaries[inningIndex].battingSummary;
    }

    getBowlingSummary(inningIndex) {
        return this.inningSummaries[inningIndex].bowlingSummary;
    }

    getFallOfWickets(inningIndex) {
        return this.inningSummaries[inningIndex].fallOfWickets;
    }

    getBallByBallEvents(inningIndex) {
        return this.data.innings[inningIndex].overs.flatMap(over => over.deliveries.map(delivery => ({
            over: over.over,
            batter: delivery.batter,
            bowler: delivery.bowler,
            runs: delivery.runs.total,
            runsBatsman: delivery.runs.batter,
            extras: delivery.runs.extras || 0,
            wicket: delivery.wickets ? delivery.wickets.map(w => w.player_out).join(', ') : null,
            kind: delivery.wickets ? delivery.wickets.map(w => w.kind).join(', ') : null
        })));
    }

    getRunRate(inningIndex) {
        const totalRuns = this.inningSummaries[inningIndex].totalRuns;
        const overs = parseFloat(this.inningSummaries[inningIndex].overs);
        return (totalRuns / overs).toFixed(2);
    }

    getTarget(inningIndex) {
        if (inningIndex === 0) {
            return null; // First inning, no target
        } else {
            return this.inningSummaries[inningIndex - 1].totalRuns + 1; // Target for second inning
        }
    }

    getCompleteScoreCard() {
        return this.inningSummaries.map((inning, index) => ({
            team: inning.team,
            totalRuns: inning.totalRuns,
            totalWickets: inning.totalWickets,
            overs: inning.overs,
            batting: this.getBattingSummary(index),
            bowling: this.getBowlingSummary(index),
            fallOfWickets: this.getFallOfWickets(index),
            ballByBallEvents: this.getBallByBallEvents(index),
            runRate: this.getRunRate(index),
            target: this.getTarget(index)
        }));
    }

    calculateOptionPremiums() {
        const currentSMI = 1000; // Example SMI, you may need to update this based on real match data
        const strikePrices = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
        const T = 0.5; // Normalized time, adjust as per your match data
        const r = 0.01; // Risk-free rate
        const sigma = 0.28; // Volatility
        const wpfBatting = 0.65; // Example WPF for batting team, you should update this based on real-time odds

        const premiums = calculatePremiums(currentSMI, strikePrices, T, r, sigma, wpfBatting);
        
        console.log('Strike Price | Call Premium | Put Premium');
        premiums.forEach(premium => {
            console.log(`${premium.strike}          | ${premium.callPremium.toFixed(2)}         | ${premium.putPremium.toFixed(2)}`);
        });

        // Save the premiums to JSON files for both innings
        writeFileSync('public/premiumsInning1.json', JSON.stringify(premiums, null, 2));
        writeFileSync('public/premiumsInning2.json', JSON.stringify(premiums, null, 2));
    }

    getPremiumsData(inningIndex) {
        return JSON.parse(readFileSync(`public/premiumsInning${inningIndex}.json`));
    }

    saveBallByBallEvents() {
        const ballByBallEventsInning1 = this.getBallByBallEvents(0);
        const ballByBallEventsInning2 = this.getBallByBallEvents(1);

        writeFileSync('public/ballByBallEventsInning1.json', JSON.stringify(ballByBallEventsInning1, null, 2));
        writeFileSync('public/ballByBallEventsInning2.json', JSON.stringify(ballByBallEventsInning2, null, 2));
        
        console.log('Ball-by-ball events have been generated and saved.');
    }
}

const filePath = 'data/1346926.json';
const dataProcessor = new DataProcessor(filePath);
dataProcessor.saveBallByBallEvents();
dataProcessor.calculateOptionPremiums();

export { DataProcessor };
