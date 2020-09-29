import React from 'react';
import {connect} from 'react-redux';
import StepIcon from './StepIcon.jsx';
import Energize from './icons/Energize.jsx';
import Attack from './icons/Attack.jsx';
import Power from './icons/Power.jsx';
import Creature from './icons/Creature.jsx';
import Draw from './icons/Draw.jsx';
import {
	STEP_ENERGIZE,
	STEP_PRS_FIRST,
	STEP_ATTACK,
	STEP_CREATURES,
	STEP_PRS_SECOND,
	STEP_DRAW
} from '../const.js';
import './style.css';

function StepBoard({currentStep}) {
	return (
		<div className="StepBoard">
			<StepIcon icon={<Energize />} active={currentStep === STEP_ENERGIZE} />
			<StepIcon icon={<Power />} active={currentStep === STEP_PRS_FIRST} />
			<StepIcon icon={<Attack />} active={currentStep === STEP_ATTACK} />
			<StepIcon icon={<Creature />} active={currentStep === STEP_CREATURES} />
			<StepIcon icon={<Power />} active={currentStep === STEP_PRS_SECOND} />
			<StepIcon icon={<Draw />} active={currentStep === STEP_DRAW} />
		</div>
	);
}

function mapStateToProps(state) {
	return {
		currentStep: state.step,
		promptParams: state.promptParams,
	};
}

const enhance = connect(mapStateToProps);

export {StepBoard as Base};

export default enhance(StepBoard);
