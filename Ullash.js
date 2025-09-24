const { spawn } = require("child_process");
const axios = require("axios");
const logger = require("./utils/log");

///////////////////////////////////////////////////////////
//========= Create website for dashboard/uptime =========//
///////////////////////////////////////////////////////////

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;
const healthPort = process.env.HEALTH_PORT || 3000;

// Serve the index.html file
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// ========= ADD UPTIME ROBOT HEALTH CHECK ========= //
app.get('/health', function (req, res) {
    res.status(200).json({
        status: 'OK',
        bot: 'ISLAMICK BOT - Running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        restarts: global.countRestart || 0,
        memory: process.memoryUsage()
    });
});

// Start the main server
app.listen(port, () => {
    logger(`Server is running on port ${port}...`, "[ Starting ]");
}).on('error', (err) => {
    if (err.code === 'EACCES') {
        logger(`Permission denied. Cannot bind to port ${port}.`, "[ Error ]");
    } else {
        logger(`Server error: ${err.message}`, "[ Error ]");
    }
});

// ========= START HEALTH CHECK SERVER ========= //
const healthApp = express();

healthApp.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'Bot is running', 
        time: new Date().toISOString(),
        restarts: global.countRestart || 0
    });
});

healthApp.listen(healthPort, () => {
    logger(`Health check server running on port ${healthPort}`, "[ Health ]");
}).on('error', (err) => {
    logger(`Health server error: ${err.message}`, "[ Health Error ]");
});

/////////////////////////////////////////////////////////
//========= Create start bot and make it loop =========//
/////////////////////////////////////////////////////////

// Initialize global restart counter
global.countRestart = global.countRestart || 0;

function startBot(message) {
    if (message) logger(message, "[ Starting ]");

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "Cyber.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit !== 0 && global.countRestart < 5) {
            global.countRestart += 1;
            logger(`Bot exited with code ${codeExit}. Restarting... (${global.countRestart}/5)`, "[ Restarting ]");
            startBot();
        } else {
            logger(`Bot stopped after ${global.countRestart} restarts.`, "[ Stopped ]");
        }
    });

    child.on("error", (error) => {
        logger(`An error occurred: ${JSON.stringify(error)}`, "[ Error ]");
    });
};

////////////////////////////////////////////////
//========= Check update from Github =========//
////////////////////////////////////////////////

axios.get("https://raw.githubusercontent.com/cyber-ullash/cyber-bot/main/data.json")
    .then((res) => {
        logger(res.data.name, "[ NAME ]");
        logger(`Version: ${res.data.version}`, "[ VERSION ]");
        logger(res.data.description, "[ DESCRIPTION ]");
    })
    .catch((err) => {
        logger(`Failed to fetch update info: ${err.message}`, "[ Update Error ]");
    });

// Start the bot
startBot();

logger(`Uptime Robot Health Check: http://localhost:${healthPort}/health`, "[ Setup ]");
logger(`Dashboard: http://localhost:${port}`, "[ Setup ]");
