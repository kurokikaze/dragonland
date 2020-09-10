/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, withHandlers} from 'recompose';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import {
	ACTION_PASS,
	ACTION_PLAY,

	// ZONE_TYPE_ACTIVE_MAGI,
	// ZONE_TYPE_HAND,
	// ZONE_TYPE_IN_PLAY,
} from 'moonlands/src/const.js';

import Zone from './zones/Zone.jsx';
import ZoneHand from './zones/ZoneHand.jsx';
import ZonePlayerInPlay from './zones/ZonePlayerInPlay.jsx';
import ZonePlayerRelics from './zones/ZonePlayerRelics.jsx';
import ZoneOpponentInPlay from './zones/ZoneOpponentInPlay.jsx';
import ZoneOpponentActiveMagi from './zones/ZoneOpponentActiveMagi.jsx';
import ZonePlayerActiveMagi from './zones/ZonePlayerActiveMagi.jsx';
import PromptOverlay from './prompts/PromptOverlay.jsx';
import PowerMessage from './messages/PowerMessage.jsx';
import StepBoard from './StepBoard.jsx';
import EndgameOverlay from './EndgameOverlay.jsx';

import {withSingleCardData} from './common';
import {isPromptActive, isOurTurn} from '../selectors';

/*
const NO_ACTIVE_STEP = 10;
const STEP_ENERGIZE = 0;
const STEP_PRS_FIRST = 1;
const STEP_ATTACK = 2;
const STEP_CREATURES = 3;
const STEP_PRS_SECOND = 4;
const STEP_DRAW = 5;
*/

const EnhancedMessage = withSingleCardData(PowerMessage);

function App({prompt, message, isOurTurn, onPass, onPlay, gameEnded}) {
	return (
		<div className="game">
			<DndProvider backend={Backend}>
				{message && message.type == 'power' && <EnhancedMessage id={message.source} power={message.power} />}
				<Zone zoneId="opponentHand" name='Opponent hand' />
				<div className='middleZones'>
					<div className='zone-placeholder' />
					<ZoneOpponentActiveMagi zoneId="opponentActiveMagi" name='Opponent Active Magi' />
					<ZonePlayerRelics  zoneId="opponentRelics" name='Opponent Relics' />
				</div>
				<ZoneOpponentInPlay zoneId="opponentInPlay" name='Opponent in play' />
				<ZonePlayerInPlay zoneId="playerInPlay" name='Player in play' />
				<div className='middleZones'>
					<ZonePlayerRelics  zoneId="playerRelics" name='Player Relics' />
					<ZonePlayerActiveMagi zoneId="playerActiveMagi" name='Player Active Magi' />
					<div className='zone-placeholder' />
				</div>
				<ZoneHand zoneId="playerHand" name='Player hand' onCardClick={onPlay} />
				<StepBoard />
				{isOurTurn && <button onClick={() => onPass()}>Pass</button>}
				{prompt && <PromptOverlay />}
				{gameEnded && <EndgameOverlay />}
			</DndProvider>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		prompt: isPromptActive(state),
		isOurTurn: isOurTurn(state),
		message: state.message,
		gameEnded: state.gameEnded,
	};
}

const enhance = compose(
	connect(mapStateToProps),
	withHandlers({
		onPass: () => () => {
			window.socket.emit('clientAction', {
				type: ACTION_PASS,
			});
		},
		onPlay: () => cardId => {
			window.socket.emit('clientAction', {
				type: ACTION_PLAY,
				payload: {
					card: cardId,
					player: window.playerId,
				},
			});
		},
	}),
);

export default enhance(App);
