import React from 'react';

import CreatureMessage from '../client/components/messages/CreatureMessage.jsx';
// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'CreatureMessage',
	component: CreatureMessage,
	argTypes: {
		cardName: {
			control: 'text',
		},
		display: {
			control: 'boolean',
		}
	},
};

const Template = ({cardName, display}) => <CreatureMessage card={{card: cardName}} display={display} />;

export const Simple = Template.bind({});
Simple.args = {
	cardName: 'Lava Arbol',
	display: true,
};

