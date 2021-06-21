import {useSelector} from 'react-redux';

import {
	PROMPT_TYPE_CHOOSE_CARDS,
	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_MAY_ABILITY,
} from 'moonlands/src/const.ts';

import PromptChooseCards from './PromptChooseCards.jsx';
import PromptChooseCardsInZone from './PromptChooseCardsInZone.jsx';
import PromptChooseNumber from './PromptChooseNumber.jsx';
import PromptMayEffect from './PromptMayEffect.jsx';

import {getPromptType, getPromptMessage} from '../../selectors/index.js'; 

import './style.css';


function PromptOverlay() {
	const promptType = useSelector(getPromptType);
	const promptMessage = useSelector(getPromptMessage);

	return (
		<div className="promptOverlay">
			{promptMessage && <h1 className='promptMessage'>{promptMessage}</h1>}
			{promptType === PROMPT_TYPE_CHOOSE_CARDS && <PromptChooseCards />}
			{promptType === PROMPT_TYPE_NUMBER && <PromptChooseNumber />}
			{promptType === PROMPT_TYPE_MAY_ABILITY && <PromptMayEffect />}
			{promptType === PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE && <PromptChooseCardsInZone />}
		</div>
	);
}

export default PromptOverlay;