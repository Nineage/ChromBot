"use strict";
/*******************
 * Basic Commands
 *******************/

const fs = require("fs");
const urban = require("urban");
const request = require("request");
const qs = require("querystring");
let perms = require('../command-parser.js').perms;

const getGif = function (tags, func) {
    let params = {
        "api_key": Config.giphyconfig.api_key,
        "rating": Config.giphyconfig.rating,
        "format": "json",
        "limit": 1
    };
    let query = qs.stringify(params);
    if (tags) {
        query += "&tag=" + tags.join('+');
    }
    request(Config.giphyconfig.url + "?" + query, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.error("giphy: Got error: " + body);
            console.log(error);
        } else {
           try{
                let responseObj = JSON.parse(body);
                func(responseObj.data.id);
            } catch(err){
                func(undefined);
            }
        }
    }.bind(this));
}

exports.commands = {
    say: function (args) {
        if (!this.can('mod')) return this.deny();
        return this.sendReply(args);
    },
    sayhelp: ".say [msg] - Causes me to say the message. Requires mod.",
    
    setperms: function (args) {
        if (!this.can('admin')) return this.deny();
        let parts = (args.split(","));
        if (!parts[1]) return this.sendReply("Missing arguments. Correct syntax: .setperms [group], [permission]");
        let group = parts[0].trim();
        let permission = parts[1].trim().toLowerCase();
        if (isNaN(Number(group))) return this.sendReply("Group must be a numerical ID.");
        if (permission === "admin") {
            perms["admin"].push(group);
            perms["mod"].push(group);
            perms["broadcast"].push(group);
        } else if (permission === "mod") {
            perms["mod"].push(group);
            perms["broadcast"].push(group);
        } else if (permission === "broadcast") {
            perms["broadcast"].push(group);
        } else {
            return this.sendReply("Valid permission settings: broadcast, mod, admin");
        }
        fs.writeFileSync('./perms.json', JSON.stringify(perms));
        return this.sendReply("Permissions set!");
    },
    setpermshelp: ".setperms [group], [broadcast/mod/admin] - Has me allow a role to perform certain commands.",
    
    listperms: function (args) {
        if (!this.can('admin')) this.deny();
        if (isNaN(Number(args))) return this.sendReply("Group must be a numerical ID.");
        if (~perms["admin"].indexOf(args)) return this.sendReply("The specified group has Admin permissions.");
        if (~perms["mod"].indexOf(args)) return this.sendReply("The specified group has Mod permissions.");
        if (~perms["broadcast"].indexOf(args)) return this.sendReply("The specified group has Broadcast permissions.");
        return this.sendReply("The specified group has no permissions :(");
    },
    listpermshelp: ".listperms [group] - Lists what permission level a group has access to.",
    
    urban: function (args) {
        let result = args ? urban(args) : urban.random();
        result.first(json => {
            if (json) {
			    let message = "Urban Dictionary: **" + json.word + "**\n\n" + json.definition;
				if (json.example) {
					message += "\n\n__Example__:\n" + json.example;
				}
				this.sendReply(message);
			} else {
				this.sendReply("No matches found");
			}
        });
    },
    urbanhelp: ".urban [word] - Returns an urbandictionary definition for a word. You can specify no word for a random definition!",
    
    gif: function (args) {
        let tags = args.split(" ");
	    getGif(tags, id => {
		    if (id) {
			    this.sendReply("http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
			else {
			    this.sendReply("Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
	    });
	},
	
	image: function(args) {
		if (!Config.youtube_api_key || !Config.google_custom_search) return this.sendReply("Image search requires both a YouTube API key and a Google Custom Search key!");
		let page = 1;
		request("https://www.googleapis.com/customsearch/v1?key=" + Config.youtube_api_key + "&cx=" + Config.google_custom_search + "&q=" + (args.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=10&start="+ page, (err, res, body) => {
			if (err) {
			    console.error(err);
			    return;
			}
			let data;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.error(error);
				return;
			}
			if(!data) return this.sendReply( "Error:\n" + JSON.stringify(data));
			if (!data.items || data.items.length == 0) return this.sendReply( "No result for '" + args + "'");
			let randResult = data.items[0];
			return this.sendReply(randResult.title + '\n' + randResult.link);
		});
	}
};