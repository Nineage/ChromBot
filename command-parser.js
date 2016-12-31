"use strict";
/*******************
 * Command Parser
 * Checks messages for commands
 *******************/
global.commands = {};
const bot = require('./app.js').bot;
const fs = require('fs');

let perms = exports.perms = require('./perms.json');
if (!perms.broadcast || !perms.mod || !perms.admin) {
    console.log('Warning: perms.json is not valid. Please check your file.');
    perms = {"broadcast": [], "mod": [], "admin": []};
}

let setNick = exports.setNick = function (nick) {
    bot.user.setUsername(nick);
}

let setStatus = exports.setStatus = function (status, suffix) {
    bot.user.setStatus(status, suffix);
}

// Load up commands
let loadCommands = exports.loadCommands = function () {
    fs.readdirSync('./commands').forEach(function(file) {
        if (file.substr(-3) === '.js') {
            Tools.uncacheTree('./commands/' + file);
            try {
                Object.assign(commands, require('./commands/' + file).commands);
            }
            catch (e){
                console.log(e.stack);
                console.log('There was a problem loading commands. Check file: ' + file);
            }
        }
    });
}
loadCommands();

class Context {
    constructor (args, msg) {
        this.args = args || '';
        this.member = msg.member;
        this.userid = msg.member.id || '';
        this.username = msg.member.username || msg.member.user.username; //I don't know if this is the best way
        this.roles = msg.member.roles;
        this.channel = msg.channel;
        this.chanId = this.channel.id || 0;
    }
    can (perm) {
        if (Config.exceptions && ~Config.exceptions.indexOf(this.userid)) return true;
        if (this.channel.type === "dm" && perm === "broadcast") return true; //sure
        if (!this.roles) return false; //todo: fix for pm
        let roles = perms[perm];
        if (!roles) return false;
        if (roles) {
            for (let i = 0; i < roles.length; i++) {
                if (this.roles.has(roles[i])) {
                    return true;
                }
            }
        }
        return false;
    }
    sendReply (text) {
        this.channel.sendMessage(text);
    }
    sendPM (text) {
        this.member.sendMessage(text);
    }
    parseMsg (command, args) {
        let cmd = commands[command];
        if (cmd && typeof cmd === 'function') cmd.call(this, args);
    }
    deny () {
        this.member.sendMessage("You do not have access to this command!");
    }
}

let parseMsg = exports.parseMsg = function (user, roles, channel, text) {
     if (!text || !text.length || text.length < 2) return;
     if (answers[channel.id] && toId(text) === answers[channel.id]) text = '.guesskunc ' + toId(text); //KUNC CHECK
     if (text[0] === Config.commandChar) {
         let words = text.split(" ");
         let cmd = commands[words[0].substr(1)];
         if (cmd) {
            if (typeof cmd !== 'function') {
                if (~words[0].indexOf("help")) return;
                 cmd = commands[cmd];
             }
             let args = text.substr(words[0].length + 1);
             let msg = {
                 "member": user,
                 "roles": roles,
                 "channel": channel
             };
             let context = new Context(user, msg);
             cmd.call(context, args);
         }
     }
}