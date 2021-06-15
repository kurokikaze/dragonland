/* global window */
import {connect} from 'react-redux';
import {compose, withHandlers} from 'recompose';

import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_MAY_ABILITY,
} from 'moonlands/dist/const';

function PromptMayEffect({onSend, effect}) {
	return (
		<div className="promptWindow promptMayEffect">
			<h1>Do you want to use {effect.name}</h1>
			<div className="effectText">{effect.text}</div>
			<div className="buttons">
				<button onClick={() => onSend(true)}>Yes</button>
				<button onClick={() => onSend(false)}>No</button>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		effect: state.promptParams.effect || {name: 'none', text: 'none'},
		generatedBy: state.promptGeneratedBy,
	};
};

const enhance  = compose(
	connect(mapStateToProps),
	withHandlers({
		onSend: props => (value) => {
			window.socket.emit('clientAction', {
				type: ACTION_RESOLVE_PROMPT,
				promptType: PROMPT_TYPE_MAY_ABILITY,
				useEffect: value,
				generatedBy: props.generatedBy,
				player: window.playerId,
			});
		},
	}),
);

export {PromptMayEffect as Base};

export default enhance(PromptMayEffect);