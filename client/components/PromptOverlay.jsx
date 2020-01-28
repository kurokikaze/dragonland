import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import PromptChooseCards from './PromptChooseCards';
import './style.css';

import {
	PROMPT_TYPE_CHOOSE_CARDS,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
	PROMPT_TYPE_NUMBER_OF_CREATURES,
	PROMPT_TYPE_NUMBER_OF_CREATURES_FILTERED,
	PROMPT_TYPE_SINGLE_MAGI,
	PROMPT_TYPE_RELIC,
	PROMPT_TYPE_NUMBER_OF_RELICS,
	PROMPT_TYPE_NUMBER,
} from 'moonlands/src/const';

function PromptOverlay({promptType, promptParams}) {
    return (
        <div className="promptOverlay">
            {promptType === PROMPT_TYPE_CHOOSE_CARDS && <PromptChooseCards params={promptParams} />}
        </div>
    );
}

function mapStateToProps(state) {
    return {
        promptType: state.promptType,
        promptParams: state.promptParams,
    };
}

const enhance = connect(mapStateToProps);

export default enhance(PromptOverlay);
