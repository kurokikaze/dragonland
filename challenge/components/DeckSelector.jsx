import React from 'react';
import {connect} from 'react-redux';
import {Select} from 'antd';
import {changeCurrentDeck} from '../actions/index.js';

const {Option} = Select;

function DeckSelector({decks, currentDeck, setDeck}) {
	return <div>
		<h2>Decks</h2>
		<pre>{currentDeck}</pre>
		<Select onChange={value => setDeck(value)} defaultValue={currentDeck}>
			{decks.map(deck => (<Option key={deck._id} value={deck._id}>{deck.name}</Option>))}
		</Select>
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
