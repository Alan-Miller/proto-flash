import React, { Component } from 'react';
import './Reader.css';

class Reader extends Component {
    constructor() {
        super()

        this.state = {cards: []}
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
            let newCards= reader.result.split('\r').map((card, indx) => {
                // Turn each card string into array having a front and back
                return card.split(/,(.+)/).filter(item => item);
            })
            
            let cards = this.state.cards.concat(newCards); // Add newCards to current cards
            localStorage.setItem('cards', JSON.stringify(cards)); // Save to localStorage
            
            // Save cards to state
            this.setState({
                cards: cards
            })
        }
    }

    flip(e) {
        e.stopPropagation();
        const card = e.currentTarget
        console.log(card)
        card.classList.toggle('flip');
        setTimeout(() => {card.classList.remove('flip')}, 1000)
    }

    render() {
        return (
            <div id="main-container">
                <main>
                    { 
                        !this.state.cards.length ? null : this.state.cards.map((card, indx) => (
                            <div className="card-container" onClick={(e) => this.flip(e)}>
                                <div className="card" key={indx}>
                                    <div className="front face">{ card[0] }</div>
                                    <div className="back face">{ card[1] }</div>
                                </div>
                            </div>
                        )) 
                    }   
) 
                </main>
                <sidebar>Sidebar
                    <h2 className="drop-h">Drop zone</h2>
                    <div id="dropZone"></div>
                </sidebar>
            </div>
        )
    }
}

export default Reader;