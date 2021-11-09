import ChallengeList from './ChallengeList.jsx';
import DeckSelector from  './DeckSelector.jsx';

import 'antd/dist/antd.css';


function ChallengeApp() {
	return (
		<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
			<div style={{ maxWidth: 800 }}>
				<ChallengeList />
				<DeckSelector />
			</div>
		</div>);
}

export default ChallengeApp;
