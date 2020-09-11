import React from 'react';

import PowerMessage from '../client/components/messages/PowerMessage.jsx';
// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'PowerMessage',
	component: PowerMessage,
	argTypes: {
		cardName: {
			control: 'text',
		},
		powerName: {
			control: 'text',
		},
		targetName: {
			control: 'text',
		},
		number: {
			control: 'number',
		},
		display: {
			control: 'boolean',
		}
	},
};

const Template = ({cardName, powerName, targetName, number = null, display}) => 
	<PowerMessage 
		card={{card: cardName}} 
		power={powerName}
		display={display}
		chosenNumber={number}
		chosenTarget={targetName ? {card: targetName} : null} 
	/>;

export const Simple = Template.bind({});
Simple.args = {
	cardName: 'Cinder',
	powerName: 'Revitalize',
	targetName: '',
	display: true,
};

