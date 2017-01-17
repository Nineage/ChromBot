"use strict";
/*******************
 * App
 * Main bot process
 *******************/
 
const Discord = require("discord.js");
const fs = require('fs');

// First check if our config file exists
if (!fs.existsSync('./config.js')) {
    console.log('No config found! Generating one with the default options.');
    fs.writeFileSync("./config.js", fs.readFileSync('./config-example.js'));
}

// Check if perms file exists
if (!fs.existsSync('./perms.json')) {
    console.log('Perms.json doesn\'t exist. Creating one with default settings.');
    fs.writeFileSync('./perms.json', JSON.stringify({"broadcast": [], "mod": [], "admin": []}));
}

//create the bot object
const bot = exports.bot = new Discord.Client();
//Load up our globals
global.Config = require('./config.js');
global.Tools = require('./tools.js');
//Require the command parser
const commandParser = require('./command-parser.js');

try {
    if (Config.token) {
        console.log('Bot token specified. Logging in...');
        bot.login(Config.token);
    } else {
        console.log('No token specified. Logging into a user account...');
        bot.login(Config.email, Config.password);
    }
} catch (e) {
    console.log('The login failed! Error message:\n' + e);
    process.exit(1);
}

bot.on("ready", () => {
    console.log('Bot succesfully connected! Awaiting commands.');
});

// Listen for messages
bot.on("message", (msg) => {
    let dm = false;
    let user = msg.member || msg.user || msg.author;
    if (user && user.bot) return;
    if (msg.channel.type === 'dm') { //Simple DM check
        //user = msg.author;
        dm = true;
    }
    let roles = user.roles || {};
    commandParser.parseMsg(user, roles, msg.channel, msg.content, dm);
});

// Close our process when we disconnect
bot.on("disconnected", () => {
    console.log("The bot has been disconnected! Exiting...");
	process.exit(1);

});
