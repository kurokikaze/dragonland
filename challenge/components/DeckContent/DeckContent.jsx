import React from 'react';
import {connect} from 'react-redux';
import {Row, Col} from 'antd';
import {camelCase} from '../../../common/utils.js';

import './style.css';

const CardView = ({name}) => {
	return (
		<div className='cardViewHolder fadeInDown'>
			<div className='cardView'>
				<img src={`/images/cards/${camelCase(name)}.jpg`} alt={name} />
			</div>
			<span>{name}</span>
		</div>
	);
};

function DeckContent({deck}) {
	const magiOne = deck.cards[0];
	const magiTwo = deck.cards[1];
	const magiThree = deck.cards[2];

	const restOfCards = deck.cards.slice(3);

	return <div className='deckGrid'>
		<Row>
			<Col span={24}><h2>{deck.name}</h2></Col>
		</Row>
		<Row>
			<Col span={24}><h3>Magi</h3></Col>
		</Row>
		<Row>
			<Col span={8}><img className={'smaller'} src={`/images/cards/${camelCase(magiOne)}.jpg`} /></Col>
			<Col span={8}><img className={'smaller'} src={`/images/cards/${camelCase(magiTwo)}.jpg`} /></Col>
			<Col span={8}><img className={'smaller'} src={`/images/cards/${camelCase(magiThree)}.jpg`} /></Col>
		</Row>
		<Row>
			<Col span={24}><h3>Cards</h3></Col>
		</Row>
		<Row>
			<Col span={24} className='cardList'>
				{restOfCards.map((card, i) => <div key={i} className='cardLink'>{<CardView name={card} />}</div>)}
			</Col>
		</Row>
	</div>;
}

function mapStateToProps(state) {
	return {
		deck: state.deck,
	};
}

const enhance = connect(mapStateToProps);

export {DeckContent as Base};

export default enhance(DeckContent);
