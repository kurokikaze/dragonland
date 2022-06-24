/* global window */
import {useState, useCallback} from 'react';
import {useSelector} from 'react-redux';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import {
	ACTION_PASS,
	ACTION_PLAY,
} from 'moonlands/dist/const';

import Log from './Log/Log.tsx';
import Zone from './zones/Zone.jsx';
import ZoneHand from './zones/ZoneHand.jsx';
import ZoneDiscard from './zones/ZoneDiscard.jsx';
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
import {
	isPromptActive,
	isOurTurn,
	getTimer,
	getCurrentStep,
	getMessage,
	getTimerSeconds,
	getCardsCountInOurDiscard,
	getCardsCountInOpponentDiscard,
	getGameEnded,
	getCardsCountInOurDeck,
	getCardsCountInOpponentDeck,
} from '../selectors';

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

function App() {
	const [discardShown, setDiscardShown] = useState(false);
	const [opponentDiscardShown, setOpponentDiscardShown] = useState(false);

	const handleOurDiscardClick = useCallback(
		() => {
			setDiscardShown(true);
			setOpponentDiscardShown(false);
		},
		[],
	);

	const handleOurDiscardClose = useCallback(
		() => setDiscardShown(false),
		[],
	);

	const handleOpponentDiscardClick = useCallback(
		() => {
			setDiscardShown(false);
			setOpponentDiscardShown(true);
		},
		[],
	);

	const handleOpponentDiscardClose = useCallback(
		() => setOpponentDiscardShown(false),
		[],
	);
	const prompt = useSelector(isPromptActive);
	const ourTurn = useSelector(isOurTurn);
	const timer = useSelector(getTimer);
	const currentStep = useSelector(getCurrentStep);
	const message = useSelector(getMessage);
	const timerSeconds = useSelector(getTimerSeconds);
	const gameEnded = useSelector(getGameEnded);
	const cardsInOpponentDiscard = useSelector(getCardsCountInOpponentDiscard);
	const cardsInOurDiscard = useSelector(getCardsCountInOurDiscard);
	const cardsInOurDeck = useSelector(getCardsCountInOurDeck);
	const cardsInOpponentDeck = useSelector(getCardsCountInOpponentDeck);

	const onPass = useCallback(() => {
		window.socket.emit('clientAction', {
			type: ACTION_PASS,
		});
	});

	const onPlay = useCallback(cardId => {
		window.socket.emit('clientAction', {
			type: ACTION_PLAY,
			payload: {
				card: cardId,
				player: window.playerId,
			},
		});
	});

	return (
		<div className='gameContainer'>
			{timer && <div className="turnTimer">00:{timerSeconds.toString().padStart(2, '0')}</div>}
			<div className="game">
				<DndProvider backend={HTML5Backend}>
					{message && message.type == MESSAGE_TYPE_POWER && <EnhancedPowerMessage id={message.source} power={message.power} display={message.source && message.source.owner !== window.playerId} />}
					{message && message.type == MESSAGE_TYPE_RELIC && <RelicMessage card={message.card} display={message.card.owner !== window.playerId} />}
					{message && message.type == MESSAGE_TYPE_SPELL && <SpellMessage card={message.card} display={message.card.owner !== window.playerId} />}
					{message && message.type == MESSAGE_TYPE_PROMPT_RESOLUTION && <PromptResolutionMessage card={message.chosenTarget} number={message.chosenNumber} />}
					<Zone zoneId='opponentHand' name='Opponent hand' />
					<div className='middleZones'>
						<div className='zone-placeholder'>
							<div className='libraryCounter'>{cardsInOpponentDeck}</div>
							<div className='discardCounter' onClick={handleOpponentDiscardClick}>{cardsInOpponentDiscard}</div>
						</div>
						<ZoneOpponentActiveMagi zoneId='opponentActiveMagi' name='Opponent Active Magi' />
						<ZonePlayerRelics  zoneId='opponentRelics' name='Opponent Relics' />
					</div>
					<ZoneOpponentInPlay zoneId='opponentInPlay' name='Opponent in play' />
					<ZonePlayerInPlay zoneId='playerInPlay' name='Player in play' />
					<div className='middleZones'>
						<ZonePlayerRelics  zoneId='playerRelics' name='Player Relics' />
						<ZonePlayerActiveMagi zoneId='playerActiveMagi' name='Player Active Magi' />
						<div className='zone-placeholder'>
							<div className='discardCounter' onClick={handleOurDiscardClick}>{cardsInOurDiscard}</div>
							<div className='libraryCounter'>{cardsInOurDeck}</div>
						</div>
					</div>
					<ZoneHand zoneId='playerHand' name='Player hand' onCardClick={onPlay} />
					<StepBoard />
					{ourTurn && (currentStep !== STEP_ENERGIZE) && (currentStep !== STEP_DRAW) && <button onClick={onPass}>Pass</button>}
					{!ourTurn && <div>Opponent&apos;s turn</div>}
					{discardShown && <div className='discardOverlay'>
						<h2>Discard</h2>
						<div className='closeIcon' onClick={handleOurDiscardClose}>&times;</div>
						<ZoneDiscard zoneId='playerDiscard' name='Player discard' />
					</div>}
					{opponentDiscardShown && <div className='discardOverlay'>
						<h2>Opponent&apos;s Discard</h2>
						<div className='closeIcon' onClick={handleOpponentDiscardClose}>&times;</div>
						<ZoneDiscard zoneId='opponentDiscard' name='Opponent discard' />
					</div>}
					{prompt && <PromptOverlay />}
					{gameEnded && <EndgameOverlay />}
				</DndProvider>
			</div>
			<Log />
		</div>
	);
}

export default App;
