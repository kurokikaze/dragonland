import React from 'react';

import RelicMessage from '../client/components/messages/RelicMessage.jsx';
// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'RelicMessage',
	component: RelicMessage,
	argTypes: {
		cardName: {
			control: 'text',
		},
		display: {
			control: 'boolean',
		}
	},
};

const Template = ({cardName, display}) => <RelicMessage card={{card: cardName}} display={display} />;

export const Simple = Template.bind({});
Simple.args = {
	cardName: 'Magma Armor',
	display: true,
};

