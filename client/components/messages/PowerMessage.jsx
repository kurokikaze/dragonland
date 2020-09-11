import React from 'react';
import MessageIcon from './MessageIcon.jsx';
import Power from '../icons/Power.jsx';

export default function PowerMessage ({card, power, display = false, chosenTarget = null, chosenNumber = null}) {
	return (card && display &&
		<div className="BaseMessage">
			<MessageIcon icon={<Power />} />
			<div className='BaseMessage__messages'>
				<div className='BaseMessage__message'>
					<span className="PowerMessage__source">{card.card}</span> uses power <span className="PowerMessage__power">{power}</span>
				</div>
				{chosenTarget && <div className='BaseMessage__target'>Chosen target is {chosenTarget.card}</div>}
				{chosenNumber !== null && <div className='BaseMessage__number'>Chosen number is {chosenNumber}</div>}
			</div>
		</div>
	);
}