'use strict';

const Movedex = require('../data/moves.js').BattleMovedex;
const POKEDEX = require('../data/pokedex.js').BattlePokedex;
const pokemonData = require('../data/formats-data.js').BattleFormatsData;
const allMons = Object.keys(pokemonData);

const sets = require('../data/kunc-sets.js');

//OLD SETS: http://pastebin.com/UJ6e3RER

let kunc = {};

global.answers = {};

class Kunc {
    constructor (id) {
        this.id = id;
        this.scoreboard = {};
        this.pokemon = "";
    }
    getPokemon () {
        let pokemon = sets[~~(sets.length * Math.random())];
        this.pokemon = pokemon.species;
        answers[this.id] = this.pokemon;
        let moveset = pokemon.moves;
        return "**Moveset:** ``" + moveset.join(', ') + "``";
    }
    addScore (userid, username) {
        if (!this.scoreboard[userid]) {
            this.scoreboard[userid] = {
                "username": username,
                score: 1
            };
            return [1, this.getPokemon()];
        } else {
            this.scoreboard[userid].score++;
            if (this.scoreboard[userid].score === 7) {
                this.end();
                return [7, "**" + username + "** has won the game of kunc!"];
            }
            return [this.scoreboard[userid].score, this.getPokemon()];
        }
    }
    end () {
        delete answers[this.id];
        delete kunc[this.id];
    }
}

exports.commands = {
    kunc: function (args) {
        if (!this.can('mod')) return this.deny();
        if (kunc[this.chanId]) return this.sendReply('A game of Kunc is already in progress!');
        kunc[this.chanId] = new Kunc(this.chanId);
        this.sendReply('A game of Kunc has been started! Oh boy!');
        this.sendReply('To participate, type the name of the Pokemon that corresponds to the given moveset!');
        let moveset = kunc[this.chanId].getPokemon();
        this.sendReply(moveset);
    },
    guesskunc: function (args) {
        let game = kunc[this.chanId];
        if (!game) return;
        if (args !== game.pokemon) return;
        let moveset = game.addScore(this.userid, this.username);
        this.sendReply(this.username + " got the correct answer and has " + moveset[0] + " points!");
        this.sendReply(moveset[1]);
    },
    skip: function (args) {
        if (!this.can('mod')) return this.deny();
        if (!kunc[this.chanId]) return this.sendReply('There is no ongoing game!');
        this.sendReply('The Pokemon was skipped! The answer was: ``' + kunc[this.chanId].pokemon + "``");
        this.sendReply(kunc[this.chanId].getPokemon());
    },
    endkunc: function (args) {
        if (!this.can('mod')) return this.deny();
        if (!kunc[this.chanId]) return this.sendReply('There is no ongoing game!');
        this.sendReply('The game of kunc was forcibly ended!');
        kunc[this.chanId].end();
    }
}