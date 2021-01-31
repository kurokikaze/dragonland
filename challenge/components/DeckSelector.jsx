import React from 'react';
import {connect} from 'react-redux';
import {Select} from 'antd';
import {A} from 'hookrouter';
import {DeckContent} from './DeckContent/index';
import {changeCurrentDeck, fetchDeck} from '../actions/index.js';

const {Option} = Select;

function DeckSelector({deck, decks, currentDeck, setDeck}) {
	return <div>
		<h2>Decks</h2>
		<Select onChange={value => setDeck(value)} defaultValue={currentDeck}>
			{decks.map(deck => (<Option key={deck._id} value={deck._id}>{deck.name}</Option>))}
		</Select>
		{deck && <A href={`/deck-editor/${deck._id}`}>Edit deck</A>}
		{deck && <DeckContent />}
	</div>;
}

function mapStateToProps(state) {
	return {
		decks: state.decks,
		currentDeck: state.currentDeck,
		deck: state.deck,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setDeck: (deck) => {
			dispatch(changeCurrentDeck(deck));
			dispatch(fetchDeck(deck));
		},
	};
}

const enhance = connect(mapStateToProps, mapDispatchToProps);

export {DeckSelector as Base};

export default enhance(DeckSelector);
