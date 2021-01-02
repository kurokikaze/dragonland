/* global window */
import React from 'react';
import {connect} from 'react-redux';
import cn from 'classnames';

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

const OUR_TURN_ACTIVE = '#32bb32';
const NOT_OUR_TURN_ACTIVE = '#F8E71C';

function StepBoard({currentStep, ourTurn}) {
	const activeColor = ourTurn ? OUR_TURN_ACTIVE : NOT_OUR_TURN_ACTIVE;

	return (
		<div className={cn('StepBoard', {'ourTurn': ourTurn})}>
			<StepIcon icon={<Energize />} active={currentStep === STEP_ENERGIZE} activeColor={activeColor} />
			<StepIcon icon={<Power />} active={currentStep === STEP_PRS_FIRST} activeColor={activeColor} />
			<StepIcon icon={<Attack />} active={currentStep === STEP_ATTACK} activeColor={activeColor} />
			<StepIcon icon={<Creature />} active={currentStep === STEP_CREATURES} activeColor={activeColor} />
			<StepIcon icon={<Power />} active={currentStep === STEP_PRS_SECOND} activeColor={activeColor} />
			<StepIcon icon={<Draw />} active={currentStep === STEP_DRAW} activeColor={activeColor} />
		</div>
	);
}

function mapStateToProps(state) {
	return {
		currentStep: state.step,
		ourTurn: state.activePlayer == window.playerId,
	};
}

const enhance = connect(mapStateToProps);

export {StepBoard as Base};

export default enhance(StepBoard);
