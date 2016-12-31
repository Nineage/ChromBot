let hangman = {};

class Hangman {
    constructor (word) {
        this.word = word.split("");
        this.guessed = [];
        for (let i = 0; i < word.length; i++) {
            this.guessed[i] = "_";
        }
        this.guesses = 6;
    }
    guessLetter (letter) {
        if (~this.word.indexOf(letter) && !~this.guessed.indexOf(letter)) {
            
        } 
    }
}