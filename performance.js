import { writeFileSync } from 'fs';
import { DataProcessor } from './dataProcessor.js';

const filePath = 'data/1346944.json';
const dataProcessor = new DataProcessor(filePath);

const inningSummaries = dataProcessor.getInningSummaries();
const completeScoreCard = dataProcessor.getCompleteScoreCard();

// Generate performance HTML content based on the scorecard
const performanceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Match Performance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        .inning-summary {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            margin-bottom: 20px;
            padding: 15px;
        }
        .inning-summary h2 {
            margin-top: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table, th, td {
            border: 1px solid #dee2e6;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f1f1f1;
        }
    </style>
</head>
<body>
    <h1>Match Performance</h1>
    ${inningSummaries.map((inning, index) => `
    <div class="inning-summary">
        <h2>${inning.team} - Inning ${index + 1}</h2>
        <p>Total Runs: ${inning.totalRuns}</p>
        <p>Total Wickets: ${inning.totalWickets}</p>
        <p>Overs: ${inning.overs}</p>
        <h3>Batting Summary</h3>
        <table>
            <tr>
                <th>Batter</th>
                <th>Runs</th>
                <th>Balls</th>
                <th>Fours</th>
                <th>Sixes</th>
                <th>Strike Rate</th>
                <th>Dismissal</th>
            </tr>
            ${inning.battingSummary.map(batter => `
            <tr>
                <td>${batter.batter}</td>
                <td>${batter.Runs}</td>
                <td>${batter.Balls}</td>
                <td>${batter.Fours}</td>
                <td>${batter.Sixes}</td>
                <td>${batter.StrikeRate}</td>
                <td>${batter.Dismissal}</td>
            </tr>
            `).join('')}
        </table>
        <h3>Bowling Summary</h3>
        <table>
            <tr>
                <th>Bowler</th>
                <th>Overs</th>
                <th>Runs</th>
                <th>Wickets</th>
                <th>Economy Rate</th>
            </tr>
            ${inning.bowlingSummary.map(bowler => `
            <tr>
                <td>${bowler.bowler}</td>
                <td>${bowler.overs}</td>
                <td>${bowler.runs}</td>
                <td>${bowler.wickets}</td>
                <td>${bowler.economyRate}</td>
            </tr>
            `).join('')}
        </table>
        <h3>Fall of Wickets</h3>
        <p>${inning.fallOfWickets.join(', ')}</p>
    </div>
    `).join('')}
</body>
</html>
`;

// Save the performance HTML to a file
writeFileSync('public/performance.html', performanceHTML);

console.log('Performance HTML has been generated and saved.');
