/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, withHandlers, withStateHandlers} from 'recompose';
import {getAvailableStartingCards} from '../../selectors';
import cn from 'classnames';
import Card from '../Card';

import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
} from 'moonlands/src/const';

function PromptChooseCards({cards, triggerElement, selected, onSend, numberOfCards}) {
	return (
		<div className="promptWindow promptChooseCards">
			<h1>Choose {numberOfCards} card(s)</h1>
			<div className="cardsRow">
				{cards.map(({card, id}, i) => (
					<div className={cn('zoneCardSelect', {'chosen': selected.includes(id)})} key={i}>
						<Card
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

export default enhance(PromptChooseCards);