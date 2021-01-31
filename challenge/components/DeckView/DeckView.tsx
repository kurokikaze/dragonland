import React from 'react';
import { cards } from 'moonlands/dist/cards';
import cn from 'classnames';
import {camelCase} from '../../../common/utils.js';
import CardView from '../CardView/CardView.jsx';
import Remove from '../icons/Remove.jsx';
import Add from '../icons/Add.jsx';

import './style.css';

type Props = {
	ourCards: string[]
	addToDeck: (card: string) => void
	removeFromDeck: (card: string) => void
	onMagiEditor: (place: number) => void
	magiEditor: number | null
}

export default function DeckView({ourCards, addToDeck, removeFromDeck, onMagiEditor, magiEditor}: Props) {
	const magiOne = ourCards[0];
	const magiTwo = ourCards[1];
	const magiThree = ourCards[2];

	// @ts-ignore
	const startingCards = new Set([magiOne, magiTwo, magiThree].map(magi => cards.find(card => card.name === magi).data.startingCards).flat());
	const deckCards = ourCards.slice(3);

	const distinctCards: string[] = deckCards.filter((card, i) => deckCards.indexOf(card) === i);

	return (
		<div>
			<div>Cards: {ourCards.length}</div>
			<div className='magiHolder'>
				<div
					onClick={() => onMagiEditor((magiEditor === null) ? 0 : null)}
					className={cn('magiVignette', {'chosenMagi': magiEditor === 0})}
					style={{backgroundImage: `url(/images/cards/${camelCase(magiOne)}.jpg)`}}
				>&nbsp;</div>
				<div
					onClick={() => onMagiEditor((magiEditor === null) ? 1 : null)}
					className={cn('magiVignette', {'chosenMagi': magiEditor === 1})}
					style={{'backgroundImage': `url(/images/cards/${camelCase(magiTwo)}.jpg)`}}
				>&nbsp;</div>
				<div
					onClick={() => onMagiEditor((magiEditor === null) ? 2 : null)}
					className={cn('magiVignette', {'chosenMagi': magiEditor === 2})}
					style={{'backgroundImage': `url(/images/cards/${camelCase(magiThree)}.jpg)`}}
				>&nbsp;</div>
			</div>
			<div className='deckView'>
				<ul>
					{distinctCards.map(card => <li key={card}>
						<CardView name={card} className={cn('deckView', {'startingCard': startingCards.has(card)})} />
						<div className='cardCount'>[{deckCards.filter(c => c === card).length}]</div>
						<div onClick={() => removeFromDeck(card)}><Remove size={20} color={'red'} /></div>
						{deckCards.filter(c => c === card).length < 3 && ourCards.length < 43 && <div onClick={() => addToDeck(card)}><Add size={20} color='green' /></div>}
						{(deckCards.filter(c => c === card).length === 3 || ourCards.length >= 43) && <div><Add size={20} color='grey' /></div>}
					</li>)}
				</ul>
			</div>
		</div>
	);
}
