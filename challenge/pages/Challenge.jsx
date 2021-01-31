import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import App from '../components/ChallengeApp.jsx';
import {fetchChallenges} from '../actions/index.js';


export default function ChallengePage() {
	const dispatch = useDispatch();
	
	useEffect(() => {
		const intervalTimer = setInterval(() => {
			dispatch(fetchChallenges());
		}, 5000);
        
		return () => clearInterval(intervalTimer);
	}, []);

	return (<App />);

}