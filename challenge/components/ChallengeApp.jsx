import React from 'react';
import {A} from 'hookrouter';
  
import ChallengeList from './ChallengeList.jsx';
import DeckSelector from  './DeckSelector.jsx';

import 'antd/dist/antd.css';

function ChallengeApp() {
	return <div>
		<h2>Challenges</h2>
		<A href="/deck-editor">Open deck editor</A>
		<ChallengeList />
		<DeckSelector />
	</div>;
}

export default ChallengeApp;
