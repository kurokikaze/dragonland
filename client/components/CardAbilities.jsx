/* global window */
import React from 'react';
import cn from 'classnames';

export const CardAbility = ({name, cost, text, used}) =>
	(
		<div className={cn('ability', {'used': used})}>
			<b>{name}</b>&mdash;{cost && <b>{cost}:</b>} <span>{text}</span>
		</div>
	);

export const withAbilities = Component => (props) => {
	const ourCard = props.data.controller === window.playerId;
	const hasAbilities = (props.card.data && props.card.data.powers);
	return (ourCard && hasAbilities && !props.isOnPrompt) ? (
		<div className='cardAbilityHolder'>
			<div className='cardAbilities'>
				{props.card.data.powers.map(({name, text, cost}, i) =>
					<CardAbility 
						key={i}
						name={name}
						text={text}
						cost={cost}
					/>
				)}
			</div>
			<Component 
				{...props} 
			/>
		</div>
	) : (
		<Component {...props}/>
	);
};
