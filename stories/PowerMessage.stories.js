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
		display: {
			control: 'boolean',
		}
	},
};

const Template = ({cardName, powerName, display}) => <PowerMessage card={{owner: undefined, card: cardName}} power={powerName} display={display} />;

export const Simple = Template.bind({});
Simple.args = {
	cardName: 'Cinder',
	powerName: 'Revitalize',
	display: true,
};

