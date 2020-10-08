import React from 'react';

import CreaturePowerIcon from '../client/components/CreaturePowerIcon.jsx';

import Power from '../client/components/icons/Power.jsx';
import Relic from '../client/components/icons/Relic.jsx';
import Spell from '../client/components/icons/Spell.jsx';
import Dagger from '../client/components/icons/Dagger.jsx';
import Energize from '../client/components/icons/Energize.jsx';
import Attack from '../client/components/icons/Attack.jsx';
import Ability from '../client/components/icons/Ability.jsx';

// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'CreaturePowerIcon',
	component: CreaturePowerIcon,
	argTypes: {
		icon: {
			control: {
				type: 'select',
				options: ['Power', 'Ability', 'Relic', 'Spell', 'Energize', 'Attack', 'Dagger'],
			},
		},
		active: {
			control: 'boolean',
		},
	},
};

const Template = ({icon, active}) => {
	switch (icon) {
		case 'Power':
			return <CreaturePowerIcon icon={<Power />} active={active} />;
		case 'Relic':
			return <CreaturePowerIcon icon={<Relic />} active={active} />;
		case 'Spell':
			return <CreaturePowerIcon icon={<Spell />} active={active} />;
		case 'Ability':
			return <CreaturePowerIcon icon={<Ability />} active={active} />;
		case 'Energize':
			return <CreaturePowerIcon icon={<Energize />} active={active} />;
		case 'Dagger':
			return <CreaturePowerIcon icon={<Dagger />} active={active} />;
		case 'Attack':
			return <CreaturePowerIcon icon={<Attack />} active={active} number={2} />;
	}
};

export const PowerIcon = Template.bind({});
PowerIcon.args = {
	icon: 'Power',
	active: true,
};


export const AbilityIcon = Template.bind({});
AbilityIcon.args = {
	icon: 'Ability',
	active: true,
};
