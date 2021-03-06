import {
	TYPE_CREATURE,

	RESTRICTION_TYPE,
	RESTRICTION_ENERGY_LESS_THAN_STARTING,
	RESTRICTION_REGION,
	RESTRICTION_CREATURE_TYPE,
} from 'moonlands/dist/const.js';

const getRestrictionFilter = (restriction, value) => {
	switch(restriction) {
		case RESTRICTION_TYPE:
			return card => card.card.type === value;
		case RESTRICTION_REGION:
			return card => card.card.region === value;
		case RESTRICTION_CREATURE_TYPE:
			return card => (card.card.type === TYPE_CREATURE && card.card.name.split(' ').includes(value));
		case RESTRICTION_ENERGY_LESS_THAN_STARTING:
			return card => (card.card.type === TYPE_CREATURE && card.data.energy < card.card.cost);
	}
};

export default getRestrictionFilter;
