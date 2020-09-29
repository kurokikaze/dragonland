/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, withHandlers} from 'recompose';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import {
	ACTION_PASS,
	ACTION_PLAY,
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
import RelicMessage from './messages/RelicMessage.jsx';
import SpellMessage from './messages/SpellMessage.jsx';
import PromptResolutionMessage from './messages/PromptResolutionMessage.jsx';

import StepBoard from './StepBoard.jsx';
import EndgameOverlay from './EndgameOverlay.jsx';

import {withSingleCardData} from './common';
import {isPromptActive, isOurTurn} from '../selectors';

import {
	MESSAGE_TYPE_POWER,
	MESSAGE_TYPE_RELIC,
	MESSAGE_TYPE_SPELL,
	MESSAGE_TYPE_PROMPT_RESOLUTION,

	// Steps without priority
	STEP_ENERGIZE,
	STEP_DRAW,
} from '../const.js';

const EnhancedPowerMessage = withSingleCardData(PowerMessage);

function App({prompt, message, isOurTurn, currentStep, onPass, onPlay, gameEnded}) {
	return (
		<div className="game">
			<DndProvider backend={Backend}>
				{message && message.type == MESSAGE_TYPE_POWER && <EnhancedPowerMessage id={message.source} power={message.power} display={message.source && message.source.owner !== window.playerId} />}
				{message && message.type == MESSAGE_TYPE_RELIC && <RelicMessage card={message.card} display={message.card.owner !== window.playerId} />}
				{message && message.type == MESSAGE_TYPE_SPELL && <SpellMessage card={message.card} display={message.card.owner !== window.playerId} />}
				{message && message.type == MESSAGE_TYPE_PROMPT_RESOLUTION && <PromptResolutionMessage card={message.chosenTarget} number={message.chosenNumber} />}
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
				{isOurTurn && (currentStep !== STEP_ENERGIZE) && (currentStep !== STEP_DRAW) && <button onClick={() => onPass()}>Pass</button>}
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
		currentStep: state.step,
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
