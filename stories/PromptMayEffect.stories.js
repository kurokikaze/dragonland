/* global window */
import React from 'react';

import {Base as PromptMayEffect} from '../client/components/prompts/PromptMayEffect.jsx';
// eslint-disable-next-line no-unused-vars
import '../public/stylesheets/game.css';
// eslint-disable-next-line no-unused-vars
import '../client/components/prompts/style.css';

export default {
	title: 'PromptMayEffect',
	component: PromptMayEffect,
	argTypes: {
		effectName: {
			control: 'text',
		},
		effectText: {
			control: 'text',
		}
	},
};

const Template = ({effectName, effectText}) => (<PromptMayEffect
	effect={{
		name: effectName,
		text: effectText,
	}}
	onSend={(value) => window.alert(value ? 'Use effect' : 'Don\'t use effect')}
/>);

export const Simple = Template.bind({});
Simple.args = {
	effectName: 'Flock',
	effectText: 'Choose two creatures to put them into your hand',
	number: 2,
};

