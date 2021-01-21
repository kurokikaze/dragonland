import React from 'react';
import {connect} from 'react-redux';

import PromptChooseCards from './PromptChooseCards.jsx';
import PromptChooseCardsInZone from './PromptChooseCardsInZone.jsx';
import PromptChooseNumber from './PromptChooseNumber.jsx';
import PromptMayEffect from './PromptMayEffect.jsx';


import {getPromptType} from '../../selectors/index.js'; 

import './style.css';

import {
	PROMPT_TYPE_CHOOSE_CARDS,
	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_MAY_ABILITY,
} from 'moonlands/dist/const';

function PromptOverlay({promptType, promptParams, promptMessage}) {
	return (
		<div className="promptOverlay">
			{promptMessage && <h1 className='promptMessage'>{promptMessage}</h1>}
			{promptType === PROMPT_TYPE_CHOOSE_CARDS && <PromptChooseCards cards={promptParams} />}
			{promptType === PROMPT_TYPE_NUMBER && <PromptChooseNumber value={promptParams.min} />}
			{promptType === PROMPT_TYPE_MAY_ABILITY && <PromptMayEffect />}
			{promptType === PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE && <PromptChooseCardsInZone />}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		promptType: getPromptType(state),
		promptParams: state.promptParams || { min: 0, max: 10},
		promptMessage: state.promptMessage,
	};
}

const enhance = connect(mapStateToProps);

export default enhance(PromptOverlay);
