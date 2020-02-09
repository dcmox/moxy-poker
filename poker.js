var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var CardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var CardValueDescriptors = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];
var CardSuites = ['C', 'S', 'D', 'H'];
var CardSuiteDescriptors = ['Clubs', 'Spades', 'Diamond', 'Hearts'];
var CardHands = ['High', 'Pair', 'Two Pair', 'Three of a kind', 'Straight', 'Flush', 'Full House', 'Four of a kind', 'Straight flush', 'Royal flush'];
var PlayerNames = ['Phil Ivey', 'Daniel Negreanu', 'David Singer', 'Jason Mercier', 'Phil Hellmuth', 'Victor Blom', 'Doyle Brunson', 'Doug Polk', 'Chris Ferguson'];
/*
    TODO:
    * Handle player sitting out (not affording small blind)
    * Handle adjusting small / big blinds to next available players
    * Handle termining if game session is over due to lack of players
    * Handle player AI to determine to bet/check/fold based on hands and odds
    * Give player AI different personalities (passive, aggressive, random, passive at first, then aggressive, etc.)
    * Make AI turns be played out at semi-random intervals (not too long though)
    * Await user to make move (bet/check/fold)
    * Display Cards in ASCII form
*/
var MoxyPoker = /** @class */ (function () {
    function MoxyPoker(players, config) {
        var _this = this;
        this.action = ''; // 'deal cards' | 'small blind' | 'big blind' | ''
        this.liveCards = [];
        this._players = [];
        this._config = {
            bigBlind: 10,
            numPlayers: 4,
            smallBlind: 5
        };
        this._dealer = -1;
        this._smallBlind = 1;
        this._bigBlind = 2;
        this._turn = 1;
        this._deck = [];
        this.dealCard = function () { return _this._deck.shift() || ''; };
        this.cheat = function () { return JSON.stringify(_this._players, null, 2); };
        this._shuffle = function (a) { return a.sort(function (a, b) { return Math.random() < Math.random() ? -1 : 1; }); };
        this._players = players || [];
        if (config) {
            this._config = Object.assign(this._config, config);
        }
        this._setup();
    }
    MoxyPoker.prototype.roundStart = function () {
        this._assignDealer();
        this._dealCardsToPlayers();
        this._assignBlinds();
        this.action = 'small blind';
        this._awaitPlayerAction();
    };
    MoxyPoker.prototype.addPlayer = function (playerName, amount, type) {
        if (this._players.length >= 10) {
            return false;
        }
        this._players[this._players.length] = {
            cards: [],
            money: amount,
            name: playerName,
            status: 'active',
            type: type
        };
        return true;
    };
    MoxyPoker.prototype._awaitPlayerAction = function () {
        var player = this._getCurrentPlayer();
        if (player.type === 'AI') {
            if (this.action === 'small blind') {
                var result = this._payBlind(this._config.smallBlind, player);
                if (result === 'sit out') {
                    //
                }
            }
        }
    };
    MoxyPoker.prototype._payBlind = function (amount, player) {
        if (player.money - amount < 0) {
            return 'sit out';
        }
        return '';
    };
    MoxyPoker.prototype._getCurrentPlayer = function () {
        return this._players[this._turn];
    };
    MoxyPoker.prototype._dealCardsToPlayers = function () {
        for (var i = this._dealer + 1; i < this._players.length; i++) {
            this._players[i].cards = [this.dealCard(), this.dealCard()];
        }
        for (var i = 0; i < this._dealer + 1; i++) {
            this._players[i].cards = [this.dealCard(), this.dealCard()];
        }
    };
    MoxyPoker.prototype._assignDealer = function () {
        this._dealer++;
        if (this._dealer >= this._players.length) {
            this._dealer = 0;
        }
    };
    MoxyPoker.prototype._assignBlinds = function () {
        this._smallBlind = this._dealer + 1;
        this._bigBlind = this._dealer + 2;
        if (this._bigBlind >= this._players.length) {
            this._bigBlind = 0;
        }
        this._turn = this._smallBlind;
    };
    MoxyPoker.prototype._setup = function () {
        var players = this._shuffle(PlayerNames);
        if (this._players.length === 0) {
            var numPlayers = (this._config.numPlayers || 4) - 1;
            this.addPlayer('Player', 1000, 'Player');
            for (var i = 0; i < numPlayers; i++) {
                this.addPlayer(players[i], 1000, 'AI');
            }
        }
        this._deck = this._createDeck();
        this._shuffleDeck();
        this._cutDeck();
    };
    MoxyPoker.prototype._shuffleDeck = function () {
        // Shuffle deck 7 times
        for (var i = 0; i < 7; i++) {
            this._shuffle(this._deck);
        }
    };
    MoxyPoker.prototype._cutDeck = function () {
        var cutPosition = Math.floor(Math.random() * 45) + 10;
        this._deck = __spreadArrays(this._deck.slice(cutPosition), this._deck.slice(0, cutPosition));
    };
    MoxyPoker.prototype._createDeck = function () {
        var deck = [];
        for (var s = 0; s < 4; s++) {
            for (var v = 0; v < 13; v++) {
                deck[deck.length] = CardValues[v] + CardSuites[s];
            }
        }
        return deck;
    };
    MoxyPoker.prototype.getDescriptor = function (hand) {
        var _a = hand.split(''), value = _a[0], suite = _a[1];
        return CardValueDescriptors[CardValues.indexOf(value)] + CardSuiteDescriptors[CardSuites.indexOf(suite)];
    };
    return MoxyPoker;
}());
var pokerClient = new MoxyPoker();
console.log(pokerClient);
pokerClient.roundStart();
console.log(pokerClient.cheat());
