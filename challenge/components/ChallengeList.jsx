import React from 'react';
import {connect} from 'react-redux';
import {acceptChallenge, createChallenge} from '../actions/index.js';

function ChallengeList({challenges, currentDeck, username, acceptChallenge, createChallenge}) {
	const hasChallenged = challenges.some(challenge => challenge.user === username);
	return <div className='challenges'>
		<pre>{JSON.stringify(challenges[0], null, 2)}</pre>
		{challenges.map(challenge => (<div className='challenge' key={challenge.deckId || 'test'}>
			<div>{challenge.user}</div>
			<div>{challenge.deck}</div>
			<div>{challenge.user !== username && <button onClick={() => acceptChallenge(challenge.user, currentDeck)}>Accept!</button>}</div>
		</div>))}
		{!hasChallenged && <div className='create_challenge'>
			<button onClick={() => createChallenge(currentDeck)}>Create challenge!</button>
		</div>}
	</div>;
}

function mapStateToProps(state) {
	return {
		challenges: state.challenges,
		currentDeck: state.currentDeck,
		username: state.username,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		acceptChallenge: (name, deck) => dispatch(acceptChallenge(name, deck)),
		createChallenge: (deckId) => dispatch(createChallenge(deckId)),
	};
}

const enhance = connect(mapStateToProps, mapDispatchToProps);

export {ChallengeList as Base};

export default enhance(ChallengeList);
