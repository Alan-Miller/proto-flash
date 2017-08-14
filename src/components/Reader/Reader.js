import React, { Component } from 'react';
import './Reader.css';

class Reader extends Component {
    constructor() {
        super()

        this.state = {
            cards: []
            ,collections: {
                'All': []
            }
            ,deckInPlay: []
            // ,cardsOutOfPlay: []
            ,decks: {}
            ,firstCardIndex: 0
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
        this.setState({firstCardIndex: 0})
        const cardContainers = document.getElementsByClassName('card-container');
        [].forEach.call(cardContainers, (container, index) => {
            container.style.display = 'flex';
            container.classList.remove('flip');
            container.classList.remove('fade-in');
        });
        [].forEach.call(document.getElementsByClassName('answer'), container => {
            container.style.display = 'flex';
        });

        const cards = Array.from(arguments).reduce((a, b) => a.concat(b)); // Make array of all decks passed in
        if (!cards.length) return;
        
        let deck = [];
        if (cards.length < 4) {
            while (deck.length < 4) {
                deck = deck.concat(this.shuffle(cards))
            }
        }
        else {
            deck = this.shuffle(cards).slice(0, 4);
        }
        this.setDeckInPlay(deck);
        return deck;
    }

    dropCard(e, direction, index) {
        e.stopPropagation();
        [].forEach.call(e.target.parentNode.children, button => button.style.display = 'none');

        const card = e.target.parentNode.parentNode.parentNode;
        card.classList.add(`drop-${direction}`);

        this.setState(Object.assign({}, {firstCardIndex: this.state.firstCardIndex + 1}))

        setTimeout(() => {
            card.style.display = 'none';
            card.classList.remove('drop-left', 'drop-right');
        }, 400);

        this.setState({deckInPlay: this.state.deckInPlay.splice(0)})
    }

    addCards(cards) {
        // Save cards to state
        this.setState({
            cards: cards
            ,collections: Object.assign({}, this.state.collections, {'All': cards})
        })
    }

    setDeckInPlay(deck) {
        this.setState({deckInPlay: deck})
    }

    shuffle(deck) {
      let copy = [...deck];
      let shuffled = [];
      while(copy.length) {
        shuffled.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
      }
      return shuffled;
    }


    render() {
        let z = Array.from(Array(53).keys()).reverse();
        z.pop();
 
        const cardContainerStyles = {
            marginRight: '-230px'
            ,display: 'flex'
        }
        const firstCardContainerStyles = {
            marginRight: '50px'
            ,transform: 'scale(1)'
        }
        let firstIndex = this.state.firstCardIndex;
        
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
                                style={Object.assign({}, cardContainerStyles, this.state.firstCardIndex === index && firstCardContainerStyles, {'zIndex': z[index]})}
                                onClick={(e) => this.flip(e)}>
                                
                                <card className="card">
                                    <div className="front face">{ card[0] }, index: {index}, firstIndex: {firstIndex}, zIndex: {z[index]}</div>
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