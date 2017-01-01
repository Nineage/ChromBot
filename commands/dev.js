"use strict";
/*******************
 * Dev Commands
 *******************/
 
const reloadCommands = require('../command-parser.js').loadCommands;
const setNick = require('../command-parser.js').setNick;
const setStatus = require('../command-parser.js').setStatus;

exports.commands = {
    eval: function(args) {
        if (!this.can('eval')) return this.deny();
        try {
            var evaluation = eval(args.trim());
            this.sendReply('```' + JSON.stringify(evaluation) + '```');
        }
        catch (e){
            this.sendReply(e.name + ":" + e.message);
        }
    },
    evalhelp: ".eval [code] - I sure hope you know what you are doing.",
    
    hotpatch: function(args) {
        if (!this.can('eval')) return this.deny();
            try {
                reloadCommands();
                this.sendReply('Commands have been reloaded');
            } 
            catch(e) {
                console.error(e.stack);
                console.log("There was a problem hotpatching commands.");
                this.sendReply('There was a problem hotpatching commands.');
            }
    },
    hotpatchhelp: ".hotpatch - Reload commands. Requires excepted status.",
    
    nick: function(args) {
        if (!this.can('admin')) return this.deny();
        setNick(args);
        return this.sendReply("Changed nickname to " + args + "!");
    },
    nickhelp: ".nick [name] - Causes me to change my nickname on this server.",
    
    status: function(args) {
        if (!this.can('admin')) return this.deny();
        let suffix;
        if (args === 'idle') {
            suffix = 'idle';
        } else if (args === 'online') {
            suffix = 'online';
        } else {
            return this.sendReply('Not a valid status');
        }
        setStatus(args, suffix);
        return this.sendReply("Changed status to " + args + "!");
    },
    statushelp: ".status [status] - Changes bot status. Examples: Idle, Online."
};
