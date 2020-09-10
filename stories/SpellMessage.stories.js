import React from 'react';

import SpellMessage from '../client/components/messages/SpellMessage.jsx';
// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'SpellMessage',
	component: SpellMessage,
	argTypes: {
		cardName: {
			control: 'text',
		},
		display: {
			control: 'boolean',
		}
	},
};

const Template = ({cardName, display}) => <SpellMessage card={{card: cardName}} display={display} />;

export const Simple = Template.bind({});
Simple.args = {
	cardName: 'Thermal Blast',
	display: true,
};

