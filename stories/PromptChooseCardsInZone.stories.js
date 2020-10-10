/* global window */
import React, {useState} from 'react';

import {Base as PromptChooseCardsInZone} from '../client/components/prompts/PromptChooseCardsInZone.jsx';
// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';
// eslint-disable-next-line no-unused-vars
import promptStyles from '../client/components/prompts/style.css';

export default {
	title: 'PromptChooseCardsInZone',
	component: PromptChooseCardsInZone,
	argTypes: {
		cardName: {
			control: 'text',
		},
		display: {
			control: 'boolean',
		}
	},
};
// triggerElement, selected, onSend, numberOfCards
const Template = ({cards, number, message}) => {
	const [selected, setSelected] = useState([]);

	return <PromptChooseCardsInZone
		cards={cards}
		numberOfCards={number}
		message={message}
		triggerElement={id => {
			if (selected.includes(id)) {
				setSelected(selected.filter(card => card !== id));
			} else {
				setSelected([...selected, id]);
			}
		}}
		onSend={() => window.alert(selected.join(', '))}
		selected={selected}
	/>;
};

export const Simple = Template.bind({});
Simple.args = {
	cards: [{
		id: 'testId1', 
		card: 'Arbolit',
	}, {
		id: 'testId2', 
		card: 'Fire Grag',
	}, {
		id: 'testId3', 
		card: 'Fire Grag',
	}, {
		id: 'testId4', 
		card: 'Lava Aq',
	}, {
		id: 'testId5', 
		card: 'Flame Hyren',
	}],
	message: 'Choose two creatures to put them into your hand',
	number: 2,
};

