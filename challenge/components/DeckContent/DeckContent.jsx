import {connect} from 'react-redux';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import {camelCase} from '../../../common/utils.js';
import CardView from	'../CardView/CardView.jsx';

import './style.css';

function DeckContent({deck}) {
	const magiOne = deck.cards[0];
	const magiTwo = deck.cards[1];
	const magiThree = deck.cards[2];

	const restOfCards = deck.cards.slice(3);

	const cardList = {}

	restOfCards.forEach(card => {
		if (card in cardList) {
			cardList[card] = cardList[card] + 1;
		} else {
	 		cardList[card] = 1;
		}
	})

	return <div className='deckGrid'>
		<Row>
			<Col span={24}><h2>{deck.name}</h2></Col>
		</Row>
		<Row>
			<Col span={24}><h3>Magi</h3></Col>
		</Row>
		<Row>
			<Col span={8}><img className='smaller' src={`/images/cards/${camelCase(magiOne)}.jpg`} /></Col>
			<Col span={8}><img className='smaller' src={`/images/cards/${camelCase(magiTwo)}.jpg`} /></Col>
			<Col span={8}><img className='smaller' src={`/images/cards/${camelCase(magiThree)}.jpg`} /></Col>
		</Row>
		<Row>
			<Col span={24}><h3>Cards</h3></Col>
		</Row>
		<Row>
			<Col span={24} className='cardList'>
				{Object.entries(cardList).map(([card, num], i) => <div key={i} className='cardLink'>{num}x&nbsp;{<CardView name={card} />}</div>)}
			</Col>
		</Row>
	</div>;
}

function mapStateToProps(state) {
	return {
		deck: state.decks.find(deck => deck._id == state.currentDeck),
	};
}

const enhance = connect(mapStateToProps);

export {DeckContent as Base};

export default enhance(DeckContent);
