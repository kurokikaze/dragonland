/* global window */
import {useSelector} from 'react-redux';
import {
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/src/const.ts';
import {getPromptGeneratedBy, getPromptMessage, getPromptType} from '../../selectors';

function PromptDistributeDamage() {
	const generatedBy = useSelector(getPromptGeneratedBy);

	const freeDamage = useSelector(state => state.energyPrompt.freeEnergy);
	const cards = useSelector(state => state.energyPrompt.cards);
	const promptType = useSelector(getPromptType);

	const handleSend = () => {
		if (freeDamage === 0) {
			window.socket.emit('clientAction', {
				type: ACTION_RESOLVE_PROMPT,
				promptType,
				damageOnCreatures: cards,
				generatedBy,
				player: window.playerId,
			});
		}
	};

	return (
		<div className="promptWindow promptEnergyManipulation">
			{(freeDamage > 0) && <div>Damage left to distribute: {freeDamage}</div>}
			<div className="buttonHolder">
				<button onClick={handleSend} disabled={freeDamage > 0}>OK</button>
			</div>
		</div>
	);
}

export default PromptDistributeDamage;