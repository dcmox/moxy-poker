
interface IPokerPlayer {
    name?: string,
    position?: number,
    cards: string[],
    money: number,
    type: 'Player' | 'AI'
    status: 'active' | 'sit out' | 'fold'
}

interface IPokerConfig {
    numPlayers?: number,
    smallBlind: number,
    bigBlind: number,
}

const CardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const CardValueDescriptors = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace']
const CardSuites = ['C', 'S', 'D', 'H']
const CardSuiteDescriptors = ['Clubs', 'Spades', 'Diamond', 'Hearts']
const CardHands = ['High', 'Pair', 'Two Pair', 'Three of a kind', 'Straight', 'Flush', 'Full House', 'Four of a kind', 'Straight flush', 'Royal flush']
const PlayerNames = ['Phil Ivey', 'Daniel Negreanu', 'David Singer', 'Jason Mercier', 'Phil Hellmuth', 'Victor Blom', 'Doyle Brunson', 'Doug Polk', 'Chris Ferguson']

/*
    TODO:
    * Handle player sitting out (not affording small blind)
    * Handle adjusting small / big blinds to next available players
    * Handle determining if game session is over due to lack of players
    * Handle player AI to determine to bet/check/fold based on hands and odds
    * Give player AI different personalities (passive, aggressive, random, passive at first, then aggressive, etc.)
    * Make AI turns be played out at semi-random intervals (not too long though)
    * Await user to make move (bet/check/fold)
    * Display Cards in ASCII form
*/

class MoxyPoker {
    public action: string = '' // 'deal cards' | 'small blind' | 'big blind' | ''
    public liveCards: string[] = []

    private _players: IPokerPlayer[] = []
    private _config: IPokerConfig = {
        bigBlind: 10,
        numPlayers: 4,
        smallBlind: 5,
    }

    private _dealer: number = -1
    private _smallBlind: number = 1
    private _bigBlind: number = 2
    private _turn: number = 1
    private _deck: string[] = []

    constructor(players?: IPokerPlayer[], config?: IPokerConfig) {
        this._players = players || []
        if (config) { this._config = Object.assign(this._config, config) }
        this._setup()
    }

    public roundStart(): void {
        this._assignDealer()
        this._dealCardsToPlayers()
        this._assignBlinds()
        this.action = 'small blind'
        this._awaitPlayerAction()
    }

    public addPlayer(playerName: string, amount: number, type: 'Player' | 'AI'): boolean {
        if (this._players.length >= 10) { return false }
        this._players[this._players.length] = {
            cards: [],
            money: amount,
            name: playerName,
            status: 'active',
            type,
        }
        return true
    }

    public dealCard = (): string => this._deck.shift() || ''

    public cheat = (): string => JSON.stringify(this._players, null, 2)
    private _awaitPlayerAction(): void {
        const player = this._getCurrentPlayer()
        if (player.type === 'AI') {
            if (this.action === 'small blind') {
                const result = this._payBlind(this._config.smallBlind, player)
                if (result === 'sit out') {
                    //
                }
            }
        }
    }

    private _payBlind(amount: number, player: IPokerPlayer): string {
        if (player.money - amount < 0) { return 'sit out' }
        return ''
    }

    private _getCurrentPlayer(): IPokerPlayer {
        return this._players[this._turn]
    }

    private _dealCardsToPlayers(): void {
        for (let i = this._dealer + 1; i < this._players.length; i++) {
            this._players[i].cards = [ this.dealCard(), this.dealCard() ]
        }
        for (let i = 0; i < this._dealer + 1; i++) {
            this._players[i].cards = [ this.dealCard(), this.dealCard() ]
        }
    }

    private _assignDealer(): void {
        this._dealer++
        if (this._dealer >= this._players.length) { this._dealer = 0 }
    }

    private _assignBlinds(): void {
        this._smallBlind = this._dealer + 1
        this._bigBlind = this._dealer + 2
        if (this._bigBlind >= this._players.length) {
            this._bigBlind = 0
        }
        this._turn = this._smallBlind
    }

    private _setup(): void {
        const players = this._shuffle(PlayerNames)
        if (this._players.length === 0) {
            const numPlayers = (this._config.numPlayers || 4) - 1
            this.addPlayer('Player', 1000, 'Player')
            for (let i = 0; i < numPlayers; i++) {
                this.addPlayer(players[i], 1000, 'AI')
            }
        }
        this._deck = this._createDeck()
        this._shuffleDeck()
        this._cutDeck()
    }
    private _shuffleDeck(): void {
        // Shuffle deck 7 times
        for (let i = 0; i < 7; i++) {
            this._shuffle(this._deck)
        }
    }
    private _cutDeck(): void {
        const cutPosition = Math.floor(Math.random() * 45) + 10
        this._deck = [...this._deck.slice(cutPosition), ...this._deck.slice(0, cutPosition)]
    }
    private _createDeck(): string[] {
        const deck: string[] = []
        for (let s = 0; s < 4; s++) {
            for (let v = 0; v < 13; v++) {
                deck[deck.length] = CardValues[v] + CardSuites[s]
            }
        }
        return deck
    }
    private getDescriptor(hand: string): string {
        const [value, suite] = hand.split('')
        return CardValueDescriptors[CardValues.indexOf(value)] + CardSuiteDescriptors[CardSuites.indexOf(suite)]
    }
    private _shuffle = (a: any[]) => a.sort((a: any, b: any) => Math.random() < Math.random() ? -1 : 1)
}

const pokerClient = new MoxyPoker()

console.log(pokerClient)

pokerClient.roundStart()

console.log(pokerClient.cheat())
