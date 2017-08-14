import React, { Component } from 'react';
import './Reader.css';

class Reader extends Component {
    constructor() {
        super()

        this.state = {
            cards: ['red', 'green']
            ,collections: {
                'All': []
            }
            ,deckInPlay: []
            // ,cardsOutOfPlay: []
            ,decks: {}
        }
        this.handleFileSelect= this.handleFileSelect.bind(this)
        this.flip = this.flip.bind(this)
    }

    componentDidMount() {
        // Check localStorage for any saved items. If none, set state to empty array
        let cards = localStorage.getItem('cards') ? JSON.parse(localStorage.getItem('cards')) : [];
        this.setState({cards: cards});

        // Add event listeners to drop zone
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('dragover', this.handleDragOver);
        dropZone.addEventListener('drop', this.handleFileSelect);

        setTimeout(() => {this.buildDeck(this.state.cards);}, 100)
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleFileSelect(e) {
        e.preventDefault();
         
        var file = e.dataTransfer.files[0]; // Drop event saves document
        var reader = new FileReader(); // Make new reader object with FileReader methods
        reader.readAsText(file); // FileReader reads file and places result on reader.result
 
        reader.onload = () => { // Give FileReader time to finish, then map result
            let newCards= reader.result.split('\r').map((card, index) => {
                // Turn each card string into array having a front and back
                return card.split(/,(.+)/).filter(item => item);
            })
            
            let cards = this.state.cards.concat(newCards); // Add newCards to current cards
            localStorage.setItem('cards', JSON.stringify(cards)); // Save to localStorage
            
            this.addCards(cards)
        }
    }

    flip(e) {
        e.stopPropagation();
        const card = e.currentTarget;
        card.classList.toggle('flip');
        card.classList.add('fade-in');
    }

    buildDeck() {
        const cardContainers = document.getElementsByClassName('card-container');
        [].forEach.call(cardContainers, (container, index) => {
            container.style.display = 'flex';
            container.style['margin-right'] = '-230px';
            container.classList.remove('flip');
            container.classList.remove('fade-in');
            if (!index) container.style['transform'] = 'scale(1.15)';
            else container.style['transform'] = 'scale(1)';
        });
        // console.log('containers', cardContainers[0].style);
        // cardContainers[0].style['margin-right'] = '-230px';
        // for (var i = 0; i < 3; i++) {
            // cardContainers[i].style['margin-right'] = '-230px';
            // console.log(cardContainers[i].style)
        // }
        [].forEach.call(document.getElementsByClassName('answer'), (container) => {
            container.style.display = 'flex';
        });

        const cards = Array.from(arguments).reduce((a, b) => a.concat(b)); // Make array of all decks passed in
        if (!cards.length) return;
        
        let deck = [];
        if (cards.length < 8) {
            while (deck.length < 8) {
                deck = deck.concat(this.shuffle(cards))
            }
        }
        else {
            deck = this.shuffle(cards).slice(0, 8);
        }
        this.setDeckInPlay(deck, true);
        return deck;
    }

    addCards(cards) {
        // Save cards to state
        this.setState({
            cards: cards
            ,collections: Object.assign({}, this.state.collections, {'All': cards})
        })
    }

    setDeckInPlay(deck, newGame) {
        this.setState({deckInPlay: deck})
        if (newGame) this.setState({cardsOutOfPlay: []});
    }

    shuffle(deck) {
      let copy = [...deck];
      let shuffled = [];
      while(copy.length) {
        shuffled.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
      }
      return shuffled;
    }

    dropCard(e, direction, index) {
        e.stopPropagation();
        e.target.parentNode.children[0].style.display = 'none';
        e.target.parentNode.children[1].style.display = 'none';

        const next = document.getElementById('deck').children.length ? 
        document.getElementById('deck').children[index + 1] : null;

        const card = e.target.parentNode.parentNode.parentNode;
        card.classList.add(`drop-${direction}`);

        const backFace = e.target.parentNode;

        
        setTimeout(() => {
            card.style.display = 'none';
            card.classList.remove('drop-left');
            card.classList.remove('drop-right');
            [].forEach.call(document.getElementById('deck').children, container => {
                container.style['transform'] = 'scale(1)';
            })

            if (next) {
                next.style['margin-right'] = '50px';
                next.style['transform'] = 'scale(1.15)';
            }
        }, 400);

        setTimeout(() => {
            console.log()
        }, 1000);
        
        this.setState({deckInPlay: this.state.deckInPlay.splice(0)})
    }

    render() {
        let z = Array.from(Array(53).keys()).reverse();
        z.pop();


        return (
            <div className="main-container" id="dropZone">
                <div 
                    className="button" 
                    onClick={() => this.buildDeck(this.state.cards)}>
                    
                    Make random deck
                </div>
                
                <deck id="deck">
                    { 
                        !this.state.deckInPlay.length ? null : this.state.deckInPlay.map((card, index) => (
                            <div    
                                className="card-container" 
                                key={index}
                                ref={index}
                                style={{'zIndex': z[index]}}
                                onClick={(e) => this.flip(e)}>
                                
                                <card className="card">
                                    <div className="front face">{ card[0] }</div>
                                    <div className="back face">{ card[1] }
                                        
                                        <div    
                                            className="right answer" 
                                            ref="right" 
                                            onClick={(e) => this.dropCard(e, 'left', index)}>
                                            
                                            Right
                                        </div>
                                        <div 
                                            className="wrong answer" 
                                            ref="wrong" 
                                            onClick={(e) => this.dropCard(e, 'right', index)}>
                                            
                                            Wrong
                                        </div>
                                    </div>
                                </card>
                            </div>
                        ))
                    }  
                </deck>
                
                <barrier className="barrier"></barrier>
            </div> 
        ) 
    }
}

export default Reader;