/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, withHandlers, withStateHandlers} from 'recompose';
import {getAvailableStartingCards} from '../../selectors';
import cn from 'classnames';
import Card from '../Card.jsx';
import {withView} from '../CardView.jsx';
import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
} from 'moonlands/dist/const';

function PromptChooseCards({cards, message, triggerElement, selected, onSend, numberOfCards}) {
	const CardDisplay = (cards.length > 4) ? withView(Card) : Card;

	return (
		<div className="promptWindow promptChooseCards">
			<h1>Choose {numberOfCards} card(s)</h1>
			{message && <h3>{message}</h3>}
			<div className={cn('cardsRow', {'smallCards': cards.length > 4})}>
				{cards.map(({card, id}, i) => (
					<div className={cn('zoneCardSelect', {'chosen': selected.includes(id)})} key={i}>
						<CardDisplay
							id={`test${i}`}
							card={{name: card}}
							data={{}}
							onClick={() => triggerElement(id)}
						/>
					</div>
				))}
			</div>
			<div className="buttonHolder">
				<button onClick={() => onSend()} disabled={numberOfCards !== selected.length}>OK</button>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		cards: state.promptParams.cards,
		zone: state.promptParams.zone,
		zoneOwner: state.promptParams.zoneOwner,
		message: state.promptParams.message,
		generatedBy: state.promptGeneratedBy,
		availableCards: getAvailableStartingCards(state.promptParams.cards, state),
		numberOfCards: state.promptParams.numberOfCards,
	};
};

const enhance  = compose(
	connect(mapStateToProps),
	withStateHandlers(
		() => ({selected: []}),
		{
			triggerElement: ({selected}) => (cardId) => ({
				selected: selected.includes(cardId) ? selected.filter(e => e !== cardId): [...selected, cardId],
			}),
		}
	),
	withHandlers({
		onSend: props => () => {
			window.socket.emit('clientAction', {
				type: ACTION_RESOLVE_PROMPT,
				promptType: PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
				zone: props.zone,
				zoneOwner: props.zoneOwner,
				cards: props.selected,
				generatedBy: props.generatedBy,
				player: window.playerId,
			});
		},
	}),
);

export {PromptChooseCards as Base};

export default enhance(PromptChooseCards);