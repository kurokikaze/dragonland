import React from 'react';
import {connect} from 'react-redux';

import PromptChooseCards from './PromptChooseCards';
import PromptChooseCardsInZone from './PromptChooseCardsInZone';
import PromptChooseNumber from './PromptChooseNumber';
import '../style.css';

import {
	PROMPT_TYPE_CHOOSE_CARDS,
	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
} from 'moonlands/src/const.js';

function PromptOverlay({promptType, promptParams, promptMessage}) {
	return (
		<div className="promptOverlay">
			{promptMessage && <h1 className='promptMessage'>{promptMessage}</h1>}
			{promptType === PROMPT_TYPE_CHOOSE_CARDS && <PromptChooseCards cards={promptParams} />}
			{promptType === PROMPT_TYPE_NUMBER && <PromptChooseNumber value={promptParams.min} />}
			{promptType === PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE && <PromptChooseCardsInZone />}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		promptType: state.promptType,
		promptParams: state.promptParams || { min: 0, max: 10},
		promptMessage: state.promptMessage,
	};
}

const enhance = connect(mapStateToProps);

export default enhance(PromptOverlay);
