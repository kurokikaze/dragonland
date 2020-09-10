/* global window */
import React from 'react';
import CreaturePowerIcon from './CreaturePowerIcon.jsx';
import MagiPowerIcon from './MagiPowerIcon.jsx';
import cn from 'classnames';
import { TYPE_MAGI } from 'moonlands/src/const.js';

export const CardAbility = ({name, cost, text, used, onClick}) =>
	(
		<div className={cn('ability', {'used': used})}>
			<b onClick={onClick}>{name}</b>&mdash;{cost && <b>{cost}:</b>} <span>{text}</span>
		</div>
	);

// eslint-disable-next-line react/display-name
export const withAbilities = Component => (props) => {
	const ourCard = (props.data.controller || props.owner) === window.playerId;
	const hasAbilities = (props.card.data && props.card.data.powers);
	const hasUnusedAbilities = hasAbilities && props.card.data.powers.some(power => !(props.data.actionsUsed || []).includes(power.name));
	const PowerIcon = (props.card.type === TYPE_MAGI) ? MagiPowerIcon : CreaturePowerIcon;

	return (ourCard && hasAbilities && !props.isOnPrompt) ? (
		<div className='cardAbilityHolder'>
			<div className='cardAbilities'>
				{props.card.data.powers.map(({name, text, cost}, i) =>
					<CardAbility 
						key={i}
						name={name}
						text={text}
						cost={cost}
						used={props.data.actionsUsed && props.data.actionsUsed.includes(name)}
						onClick={() => {console.log(`id:${props.id} , power ${name}`); props.onAbilityUse(props.id, name);}}
					/>
				)}
			</div>
			<div className='abilityIconHolder'>
				<Component 
					{...props}
				/>
				<PowerIcon active={hasUnusedAbilities && props.actionsAvailable} />
			</div>
		</div>
	) : (
		<Component {...props}/>
	);
};
