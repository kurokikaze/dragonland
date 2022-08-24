/* global window */
import {useState} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import Card from '../Card.jsx';
import {withView} from '../CardView.jsx';
import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_CHOOSE_UP_TO_N_CARDS_FROM_ZONE,
} from 'moonlands/src/const.ts';
import {
	getPromptCards,
	getPromptZone,
	getPromptMessage,
	getPromptNumberOfCards,
	getPromptZoneOwner,
	getPromptGeneratedBy,
} from '../../selectors';

function PromptChooseUpToNCards() {
	const cards = useSelector(getPromptCards);
	const zone = useSelector(getPromptZone);
	const message = useSelector(getPromptMessage);
	const zoneOwner = useSelector(getPromptZoneOwner);
	const numberOfCards = useSelector(getPromptNumberOfCards);
	const generatedBy = useSelector(getPromptGeneratedBy);
	
	const [selected, setSelected] = useState([]);

	const CardDisplay = (cards.length > 4) ? withView(Card) : Card;

	const handleSend = () => {
		window.socket.emit('clientAction', {
			type: ACTION_RESOLVE_PROMPT,
			promptType: PROMPT_TYPE_CHOOSE_UP_TO_N_CARDS_FROM_ZONE,
			zone,
			zoneOwner,
			cards: selected,
			generatedBy,
			player: window.playerId,
		});
	};

	const triggerElement = cardName =>
		setSelected(selected => selected.includes(cardName) ? selected.filter(e => e !== cardName): [...selected, cardName]);

	return (
		<div className="promptWindow promptChooseCards">
			<h1>Choose up to {numberOfCards} card(s)</h1>
			{message && <h3>{message}</h3>}
			<div className={cn('cardsRow', {'smallCards': cards.length > 4})}>
				{cards.map(({card, id}) => (
					<div className={cn('zoneCardSelect', {'chosen': selected.includes(id)})} key={id}>
						<CardDisplay
							id={`card_${card}`}
							card={{name: card}}
							data={{}}
							onClick={() => triggerElement(id)}
						/>
					</div>
				))}
			</div>
			<div className="buttonHolder">
				<button onClick={handleSend} disabled={numberOfCards < selected.length}>OK</button>
			</div>
		</div>
	);
}

export default PromptChooseUpToNCards;