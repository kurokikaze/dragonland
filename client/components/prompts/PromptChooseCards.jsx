/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, withHandlers, withStateHandlers} from 'recompose';
import {getAvailableStartingCards} from '../../selectors';
import cn from 'classnames';
import Card from '../Card';

import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_CHOOSE_CARDS,
} from 'moonlands/src/const';

function PromptChooseCards({cards, triggerElement, selected, onSend, availableCards}) {
	return (
		<div className="promptWindow promptChooseCards">
			<h1>Choose starting cards</h1>
			<div className="cardsRow">
				{cards.map((card, i) => (
					<div className={cn('cardSelect', {'chosen': selected.includes(card)})} key={i}>
						<Card
							id={`test${i}`}
							card={{name: card}}
							data={{}}
							onClick={availableCards.includes(card) ? () => triggerElement(card) : () => null}
						/>
					</div>
				))}
			</div>
			<div className="buttonHolder">
				<button onClick={() => onSend()}>OK</button>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		cards: state.promptParams.cards,
		generatedBy: state.promptGeneratedBy,
		availableCards: getAvailableStartingCards(state.promptParams.cards, state),
	};
};

const enhance  = compose(
	connect(mapStateToProps),
	withStateHandlers(
		({availableCards}) => ({selected: availableCards}),
		{
			triggerElement: ({selected}) => (cardName) => ({
				selected: selected.includes(cardName) ? selected.filter(e => e !== cardName): [...selected, cardName],
			}),
		}
	),
	withHandlers({
		onSend: props => () => {
			window.socket.emit('action', {
				type: ACTION_RESOLVE_PROMPT,
				promptType: PROMPT_TYPE_CHOOSE_CARDS,
				cards: props.selected,
				generatedBy: props.generatedBy,
				player: window.playerId,
			});
		},
	}),
);

export default enhance(PromptChooseCards);