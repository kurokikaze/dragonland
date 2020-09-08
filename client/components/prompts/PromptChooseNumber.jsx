/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, withHandlers, withStateHandlers} from 'recompose';

import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_NUMBER
} from 'moonlands/src/const.js';

const makeArray = (min, max) => Array.apply(null, {length: max + 1}).map(Number.call, Number).slice(min);

function PromptChooseCards({min, max, options, onSend, setValue}) {
	return (
		<div className="promptWindow promptChooseCards">
			<h1>Choose number from {min} to {max}</h1>
			<div className="cardsRow">
				<select onChange={event => setValue(event.target.value)}>
					{options.map(value => <option key={value} value={value}>{value}</option>)}
				</select>
			</div>
			<div className="buttonHolder">
				<button onClick={() => onSend()}>OK</button>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => ({
	min: state.promptParams.min || 1,
	max: state.promptParams.max,
	options: makeArray(state.promptParams.min, state.promptParams.max),
	generatedBy: state.promptGeneratedBy,
});

const enhance  = compose(
	connect(mapStateToProps),
	withStateHandlers(
		({value}) => ({selected: value}),
		{
			setValue: () => number => ({
				selected: number,
			}),
		}
	),
	withHandlers({
		onSend: props => () => {
			window.socket.emit('clientAction', {
				type: ACTION_RESOLVE_PROMPT,
				promptType: PROMPT_TYPE_NUMBER,
				number: props.selected,
				generatedBy: props.generatedBy,
				player: window.playerId,
			});
		},
	}),
);

export default enhance(PromptChooseCards);