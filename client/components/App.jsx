import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, withHandlers} from 'recompose';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import {
    ACTION_PASS,
    ACTION_PLAY,

    ZONE_TYPE_ACTIVE_MAGI,
    ZONE_TYPE_HAND,
    ZONE_TYPE_IN_PLAY,
} from 'moonlands/src/const';

import Zone from './Zone';
import ZoneHand from './ZoneHand';
import ZonePlayerInPlay from './ZonePlayerInPlay';
import ZoneOpponentInPlay from './ZoneOpponentInPlay';
import ZoneOpponentActiveMagi from './ZoneOpponentActiveMagi';
import PromptOverlay from './PromptOverlay';
import StepBoard from './StepBoard';

import {isPromptActive, isOurTurn} from '../selectors';

const NO_ACTIVE_STEP = 10;
const STEP_ENERGIZE = 0;
const STEP_PRS_FIRST = 1;
const STEP_ATTACK = 2;
const STEP_CREATURES = 3;
const STEP_PRS_SECOND = 4;
const STEP_DRAW = 5;

function App({prompt, isOurTurn, onPass, onPlay}) {
    return (
        <div className="game">
            <DndProvider backend={Backend}>
                <Zone zoneId="opponentHand" name='Opponent hand' />
                <ZoneOpponentActiveMagi zoneId="opponentActiveMagi" name='Opponent Active Magi' />
                <ZoneOpponentInPlay zoneId="opponentInPlay" name='Opponent in play' />
                <ZonePlayerInPlay zoneId="playerInPlay" name='Player in play' />
                <Zone zoneId="playerActiveMagi" name='Player Active Magi' />
                <ZoneHand zoneId="playerHand" name='Player hand' onCardClick={onPlay} />
                <StepBoard />
                {isOurTurn && <button onClick={() => onPass()}>Pass</button>}
                {prompt && <PromptOverlay />}
            </DndProvider>
        </div>
    );
}

function mapStateToProps(state) {
    return {
        prompt: isPromptActive(state),
        isOurTurn: isOurTurn(state),
    };
}

const enhance = compose(
    connect(mapStateToProps),
    withHandlers({
        onPass: props => event => {
            window.socket.emit('action', {
                type: ACTION_PASS,
            });
        },
        onPlay: props => cardId => {
            window.socket.emit('action', {
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
