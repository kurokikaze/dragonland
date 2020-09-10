import React from 'react';
import {connect} from 'react-redux';
import StepIcon from './StepIcon.jsx';
import Energize from './icons/Energize.jsx';
import Attack from './icons/Attack.jsx';
import Power from './icons/Power.jsx';
import Creature from './icons/Creature.jsx';
import Draw from './icons/Draw.jsx';

import './style.css';

import {
} from 'moonlands/src/const.js';

function StepBoard({currentStep}) {
	return (
		<div className="stepBoard">
			<StepIcon icon={<Energize />} active={currentStep === 0} />
			<StepIcon icon={<Power />} active={currentStep === 1} />
			<StepIcon icon={<Attack />} active={currentStep === 2} />
			<StepIcon icon={<Creature />} active={currentStep === 3} />
			<StepIcon icon={<Power />} active={currentStep === 4} />
			<StepIcon icon={<Draw />} active={currentStep === 5} />
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

export default enhance(StepBoard);
