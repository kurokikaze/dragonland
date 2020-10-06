/* globals window */
import React from 'react';
import CreaturePowerIcon from './CreaturePowerIcon.jsx';
import MagiPowerIcon from './MagiPowerIcon.jsx';
import Ability from './icons/Ability.jsx';
import cn from 'classnames';
import { TYPE_MAGI } from 'moonlands/src/const.js';

export const CardAbility = ({name, cost, text, used, onClick}) =>
	(
		<div className={cn('ability', {'used': used})}>
			<span className='abilityName' onClick={onClick}>{name}</span>&nbsp;&mdash;&nbsp;<span className='abilityCost'>{cost}</span>: <span>{text}</span>
		</div>
	);

export const OpponentCardAbility = ({name, cost, text}) =>
	(
		<div className='opponentAbility'>
			<span className='abilityName'>{name}</span>&nbsp;&mdash;&nbsp;<span className='abilityCost'>{cost}</span>: <span>{text}</span>
		</div>
	);

// eslint-disable-next-line react/display-name
export const withAbilities = Component => (props) => {
	const isOpponent = props.data.controller !== window.playerId;
	const hasAbilities = (props.card.data && props.card.data.powers);
	const hasUnusedAbilities = hasAbilities && props.card.data.powers.some(power => !(props.data.actionsUsed || []).includes(power.name));
	const hasEffects = props.card.data && (props.card.data.effects || props.card.data.triggerEffects);

	const PowerIcon = (props.card.type === TYPE_MAGI) ? MagiPowerIcon : CreaturePowerIcon;
	const iconType = (props.card.type === TYPE_MAGI) ? 'cardIcons' : 'magiCardIcons';

	const showAbilities = hasAbilities && !props.isOnPrompt && !props.isDragging;
	const showEffects = hasEffects && !props.isOnPrompt && !props.isDragging;
	const AbilityComponent = isOpponent ? OpponentCardAbility : CardAbility;
	return <>
		{(showAbilities || showEffects) && <div className='cardAbilityHolder'>
			{hasAbilities && (props.actionsAvailable || isOpponent) && <div className='cardAbilities'>
				{props.card.data.powers.map(({name, text, cost}, i) =>
					<AbilityComponent 
						key={i}
						name={name}
						text={text}
						cost={cost}
						used={props.data.actionsUsed && props.data.actionsUsed.includes(name)}
						onClick={() => {console.log(`id:${props.id} , power ${name}`); props.onAbilityUse(props.id, name);}}
					/>
				)}
			</div>}
			{hasEffects && <div className='cardAbilities'>
				{[...(props.card.data.effects || []), ...(props.card.data.triggerEffects || [])].map(({name, text}, i) =>
					<p key={i}><b>Effect &mdash; {name}</b>: {text}</p>
				)}
			</div>}
			<div className='abilityIconHolder'>
				<Component 
					{...props}
				/>
				<div className={iconType}>
					{showEffects && <PowerIcon icon={<Ability />} />}
					{showAbilities && <PowerIcon active={hasUnusedAbilities && props.actionsAvailable} />}
				</div>
			</div>
		</div>
		}
		{!(showAbilities || showEffects) && <Component {...props}/>}
	</>;
};
