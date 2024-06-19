import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the premiums HTML file
app.get('/premiums', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'premiums.html'));
});

// Serve the performance HTML file
app.get('/performance', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'performance.html'));
});

// Serve JSON files for premiums and SMI history
app.get('/SMIHistoryInning1.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SMIHistoryInning1.json'));
});

app.get('/SMIHistoryInning2.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SMIHistoryInning2.json'));
});

app.get('/premiumsInning1.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'premiumsInning1.json'));
});

app.get('/premiumsInning2.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'premiumsInning2.json'));
});

app.get('/scorecardInning1.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scorecardInning1.json'));
});

app.get('/scorecardInning2.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scorecardInning2.json'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
