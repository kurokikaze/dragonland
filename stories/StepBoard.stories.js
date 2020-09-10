import React from 'react';

import {Base as StepBoard} from '../client/components/StepBoard.jsx';
// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'StepBoard',
	component: StepBoard,
	argTypes: {
		currentStep: {
			control: {
				type: 'number',
				min: 0,
				max: 5,
				step: 1,
			},
		},
	},
};

const Template = ({currentStep}) => <StepBoard currentStep={currentStep} />;

export const Simple = Template.bind({});
Simple.args = {
	currentStep: 0,
};

