import React from 'react';

import CreaturePowerIcon from '../client/components/CreaturePowerIcon.jsx';

import Power from '../client/components/icons/Power.tsx';
import Relic from '../client/components/icons/Relic.tsx';
import Spell from '../client/components/icons/Spell.tsx';
import Dagger from '../client/components/icons/Dagger.tsx';
import Energize from '../client/components/icons/Energize.tsx';
import Attack from '../client/components/icons/Attack.tsx';
import Ability from '../client/components/icons/Ability.tsx';
import Velociraptor from '../client/components/icons/Velociraptor.tsx';

// eslint-disable-next-line no-unused-vars
import styles from '../public/stylesheets/game.css';

export default {
	title: 'CreaturePowerIcon',
	component: CreaturePowerIcon,
	argTypes: {
		icon: {
			control: {
				type: 'select',
				options: ['Power', 'Ability', 'Relic', 'Spell', 'Energize', 'Attack', 'Dagger', 'Velociraptor'],
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
		case 'Velociraptor':
			return <CreaturePowerIcon icon={<Velociraptor />} active={active} />;
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

export const VelociraptorIcon = Template.bind({});
AbilityIcon.args = {
	icon: 'Velociraptor',
	active: true,
};
