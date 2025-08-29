const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

// ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// make sure scores file exists and is valid JSON
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2));
} else {
    // if file exists but is corrupted, reset it (prevents crashing)
    try {
        JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
    } catch (err) {
        console.warn('scores.json corrupt — resetting file.', err);
        fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2));
    }
}

function readScores() {
    try {
        return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
    } catch (err) {
        console.error('Error reading scores, returning empty array', err);
        return [];
    }
}

// atomic write: write to tmp file then rename
function writeScores(scores) {
    const tmp = SCORES_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(scores, null, 2), 'utf8');
    fs.renameSync(tmp, SCORES_FILE);
}

app.get('/scores', (req, res) => {
    const scores = readScores();
    res.json(scores);
});

app.post('/scores', (req, res) => {
    const { name, score, difficulty, unitSize } = req.body;

    if (!name || score == null || !difficulty || !unitSize) {
        return res.status(400).json({ error: 'Missing data' });
    }

    const scores = readScores();
    scores.unshift({
        id: Date.now(),
        name,
        score,
        difficulty,
        unitSize,
        createdAt: new Date().toISOString()
    });

    try {
        writeScores(scores);
        return res.json({ message: 'Score saved!' });
    } catch (err) {
        console.error('Failed to write scores file', err);
        return res.status(500).json({ error: 'Failed to save score' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

