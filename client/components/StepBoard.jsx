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

function StepBoard({currentStep, ourTurn}) {
	return (
		<div className={cn('StepBoard', {'ourTurn': ourTurn})}>
			<StepIcon icon={<Energize />} active={currentStep === STEP_ENERGIZE} activeColor={ourTurn ? OUR_TURN_ACTIVE : null} />
			<StepIcon icon={<Power />} active={currentStep === STEP_PRS_FIRST} activeColor={ourTurn ? OUR_TURN_ACTIVE : null} />
			<StepIcon icon={<Attack />} active={currentStep === STEP_ATTACK} activeColor={ourTurn ? OUR_TURN_ACTIVE : null} />
			<StepIcon icon={<Creature />} active={currentStep === STEP_CREATURES} activeColor={ourTurn ? OUR_TURN_ACTIVE : null} />
			<StepIcon icon={<Power />} active={currentStep === STEP_PRS_SECOND} activeColor={ourTurn ? OUR_TURN_ACTIVE : null} />
			<StepIcon icon={<Draw />} active={currentStep === STEP_DRAW} activeColor={ourTurn ? OUR_TURN_ACTIVE : null} />
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
