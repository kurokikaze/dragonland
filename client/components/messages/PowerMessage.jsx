/* global window */
import React from 'react';

export default function PowerMessage ({card, power}) {
	return (card && card.owner !== window.playerId &&
		<div className="PowerMessage">
			<div><span className="PowerMessage__source">{card.card}</span> uses power <span>{power}</span></div>
		</div>
	);
}