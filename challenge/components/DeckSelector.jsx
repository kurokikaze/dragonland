import React from 'react';
import {connect} from 'react-redux';
import {changeCurrentDeck} from '../actions/index.js';

function DeckSelector({decks, currentDeck, setDeck}) {
	return <div>
		<h2>Decks</h2>
		<h4>{currentDeck}</h4>
		<select onChange={(event) => {console.dir(event.target.value); setDeck(event.target.value);}} defaultValue={currentDeck}>
			{decks.map(deck => (<option key={deck._id} value={deck._id}>{deck.name}</option>))}
		</select>
	</div>;
}

function mapStateToProps(state) {
	return {
		decks: state.decks,
		currentDeck: state.currentDeck,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setDeck: (deck) => dispatch(changeCurrentDeck(deck)),
	};
}

const enhance = connect(mapStateToProps, mapDispatchToProps);

export {DeckSelector as Base};

export default enhance(DeckSelector);
