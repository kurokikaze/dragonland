/* global window */
import {useState} from 'react';
import {useSelector} from 'react-redux';
import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_CHOOSE_CARDS,
} from 'moonlands/src/const.ts';
import cn from 'classnames';
import Card from '../Card.jsx';
import {getPromptCards, getPromptGeneratedBy, getActivePlayerMagi, getAvailableCards} from '../../selectors';

function PromptChooseCards() {
	const cards = useSelector(getPromptCards);
	const generatedBy = useSelector(getPromptGeneratedBy);
	const magi = useSelector(getActivePlayerMagi);
	const availableCards = useSelector(getAvailableCards);

	const [selected, setSelected] = useState([]);

	const triggerElement = cardName =>
		availableCards.includes(cardName) && setSelected(selected => selected.includes(cardName) ? selected.filter(e => e !== cardName): [...selected, cardName]);

	const handleSend = () => {
		window.socket.emit('clientAction', {
			type: ACTION_RESOLVE_PROMPT,
			promptType: PROMPT_TYPE_CHOOSE_CARDS,
			cards: selected,
			generatedBy,
			player: window.playerId,
		});
	};

	return (
		<div className="promptWindow promptChooseCards">
			<div className='promptMagi'>
				<Card
					id={magi.id}
					card={{name: magi.card}}
					data={{}}
				/>
			</div>
			<h1>Choose starting cards</h1>
			<div className="cardsRow">
				{cards.map(card => (
					<div className={cn('cardSelect', {'chosen': selected.includes(card)})} key={card}>
						<Card
							id={`test_${card}`}
							card={{ name: card }}
							data={{}}
							onClick={() => triggerElement(card)}
						/>
					</div>
				))}
			</div>
			<div className="buttonHolder">
				<button onClick={handleSend}>OK</button>
			</div>
		</div>
	);
}

export default PromptChooseCards;