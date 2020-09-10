import React from 'react';
import MessageIcon from './MessageIcon.jsx';
import Relic from '../icons/Relic.jsx';

export default function RelicMessage ({card, display}) {
	return (card && display &&
		<div className="BaseMessage">
			<MessageIcon icon={<Relic />} />
			<div className='BaseMessage__message'>
				Opponent plays relic <span className="RelicMessage__relic">{card.card}</span>
			</div>
		</div>
	);
}