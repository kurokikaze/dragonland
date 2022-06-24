/* global window */
import {useSelector} from 'react-redux';

import {
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_MAY_ABILITY,
} from 'moonlands/src/const.ts';
import {getPromptGeneratedBy} from '../../selectors';

const getPromptEffect = state => state.promptParams.effect || { name: 'none', text: 'none' };

function PromptMayEffect() {
	const generatedBy = useSelector(getPromptGeneratedBy);
	const effect = useSelector(getPromptEffect);

	const handleSend = value => {
		window.socket.emit('clientAction', {
			type: ACTION_RESOLVE_PROMPT,
			promptType: PROMPT_TYPE_MAY_ABILITY,
			useEffect: value,
			generatedBy: generatedBy,
			player: window.playerId,
		});
	};
	return (
		<div className="promptWindow promptMayEffect">
			<h1>Do you want to use {effect.name}</h1>
			<div className="effectText">{effect.text}</div>
			<div className="buttons">
				<button onClick={() => handleSend(true)}>Yes</button>
				<button onClick={() => handleSend(false)}>No</button>
			</div>
		</div>
	);
}

export default PromptMayEffect;