import React from 'react';
import ChallengeList from './ChallengeList.jsx';
import DeckSelector from  './DeckSelector.jsx';

function ChallengeApp() {
	return <div>
		<h2>Challenges</h2>
		<ChallengeList />
		<DeckSelector />
	</div>;
}

export default ChallengeApp;
