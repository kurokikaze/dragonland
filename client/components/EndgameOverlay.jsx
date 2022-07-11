/* global window */
import {useRef, useEffect} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';

import './style.css';

const getWinner = state => state.winner;

function PromptOverlay() {
	const overlay = useRef();

	useEffect(() => {
		setTimeout(() => {
			if (overlay.current) {
				overlay.current.classList.add('prompt-animation');
			}
		}, 0);
	}, [overlay]);

	const winner = useSelector(getWinner);
	const youWin = winner === window.playerId;

	return (
		<div className="promptOverlay endgame" ref={overlay}>
			<h1 className={cn({'win': youWin})}>{youWin ? 'VICTORY' : 'DEFEAT'}</h1>
			<p>
				{`Player ${winner} has won`}
			</p>
		</div>
	);
}

export default PromptOverlay;
