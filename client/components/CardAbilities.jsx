/* global window */
import React from 'react';
import cn from 'classnames';

export const CardAbility = ({name, cost, text, used, onClick}) =>
	(
		<div className={cn('ability', {'used': used})}>
			<b onClick={onClick}>{name}</b>&mdash;{cost && <b>{cost}:</b>} <span>{text}</span>
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
						used={props.data.actionsUsed && props.data.actionsUsed.includes(name)}
						onClick={() => {console.log(`id:${props.id} , power ${name}`); props.onAbilityUse(props.id, name);}}
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
