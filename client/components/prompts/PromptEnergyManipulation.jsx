/* global window */
import {useSelector} from 'react-redux';
import {
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/src/const.ts';
import {getPromptGeneratedBy, getPromptMessage, getPromptType} from '../../selectors';

function PromptChooseCards() {
	const generatedBy = useSelector(getPromptGeneratedBy);

	const freeEnergy = useSelector(state => state.energyPrompt.freeEnergy);
	const cards = useSelector(state => state.energyPrompt.cards);
	const message = useSelector(getPromptMessage);
	const promptType = useSelector(getPromptType);

	const handleSend = () => {
		if (freeEnergy === 0) {
			window.socket.emit('clientAction', {
				type: ACTION_RESOLVE_PROMPT,
				promptType,
				energyOnCreatures: cards,
				generatedBy,
				player: window.playerId,
			});
		}
	};

	return (
		<div className="promptWindow promptEnergyManipulation">
			{(freeEnergy > 0) && <div>Free energy left to distribute: {freeEnergy}</div>}
			{message && <div>{message}</div>}
			<div className="buttonHolder">
				<button onClick={handleSend} disabled={freeEnergy > 0}>OK</button>
			</div>
		</div>
	);
}

export default PromptChooseCards;