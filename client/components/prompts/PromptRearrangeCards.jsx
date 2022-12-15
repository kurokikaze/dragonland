/* global window */
import {useState} from 'react';
import {useSelector} from 'react-redux';
import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_REARRANGE_CARDS_OF_ZONE,
} from 'moonlands/src/const.ts';
import {DndProvider} from 'react-dnd';
import PromptCardImage from './PromptCardImage.jsx';
import {HTML5Backend} from 'react-dnd-html5-backend';

import {
	getPromptCards,
	getPromptGeneratedBy,
} from '../../selectors';

// const DraggableTypes = {
// 	CARD_IMAGE: 'card_image',
// };

function PromptRearrangeCards() {
	const cards = useSelector(getPromptCards);
	const generatedBy = useSelector(getPromptGeneratedBy);
	const [order, setOrder] = useState(cards.map((_, i) => i));

	const moveCard = (from, to) => {
		const initialFrom = order[from];
		const initialTo = order[to];

		setOrder(order.map((a, i) => {
			if (i === from) return initialTo;
			if (i === to) return initialFrom;
			return a;
		}));
		console.log(`Moving the card from ${from} to ${to}`);
	};

	const handleSend = () => {
		window.socket.emit('clientAction', {
			type: ACTION_RESOLVE_PROMPT,
			promptType: PROMPT_TYPE_REARRANGE_CARDS_OF_ZONE,
			cards: order.map(index => cards[index].id),
			generatedBy,
			player: window.playerId,
		});
	};

	return (
		<div className="promptWindow promptRearrangeCards">
			<h1>Rearrange the cards</h1>
			<DndProvider backend={HTML5Backend}>
				<div className="cardsRow" style={{display: 'flex', flexDirection: 'row'}}>
					{order.map((position, i) => (
						<PromptCardImage card={cards[position].card} onMove={moveCard} key={cards[position].id} id={cards[position].id} index={i} />
					))}
				</div>
			</DndProvider>
			<div className="buttonHolder">
				<button onClick={handleSend}>OK</button>
			</div>
		</div>
	);
}

export default PromptRearrangeCards;