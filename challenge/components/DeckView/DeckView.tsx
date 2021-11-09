import * as React from 'react';
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

function MagiView({name, id, chosenMagi, onMagiEditor}) {
	const magi = cards.find(card => card.name === name);
	return (<div className='magiCard'>
		<div
			onClick={() => onMagiEditor(!chosenMagi ? id : null)}
			className={cn('magiVignette', {'chosenMagi': chosenMagi})}
			style={{backgroundImage: `url(/images/cards/${camelCase(name)}.jpg)`}}
		>
		</div>
		<CardView name={magi.name} className='deckView' top={false} />
		{magi && <div className='startingEnergy'>{magi.data?.startingEnergy}</div>}
		{magi && <div className='energizeRate'>+{magi.data?.energize}</div>}
	</div>);
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
			<div>Cards: <span style={{ color: ourCards.length === 43 ? 'green' : '#333'}}>{ourCards.length}</span></div>
			<div className='magiHolder'>
				<MagiView name={magiOne} id={0} onMagiEditor={onMagiEditor} chosenMagi={magiEditor === 0} />
				<MagiView name={magiTwo} id={1} onMagiEditor={onMagiEditor} chosenMagi={magiEditor === 1} />
				<MagiView name={magiThree} id={2} onMagiEditor={onMagiEditor} chosenMagi={magiEditor === 2} />
			</div>
			<div className='deckView'>
				<ul>
					{distinctCards.map(card => <li key={card}>
						<CardView name={card} className={cn('deckView', {'startingCard': startingCards.has(card)})} top={false} />
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
