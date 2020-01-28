import React from 'react';
import ReactDOM from 'react-dom';
import Zone from './Zone';
import PromptOverlay from './PromptOverlay';
import {connect} from 'react-redux';

import {isPromptActive} from '../selectors';

function App({prompt}) {
    return (
        <div className="game">
            <Zone zoneId="opponentHand" name='Opponent hand' />
            <Zone zoneId="opponentActiveMagi" name='Opponent Active Magi' />
            <Zone zoneId="opponentInPlay" name='Opponent in play' />
            <Zone zoneId="playerInPlay" name='Player in play' />
            <Zone zoneId="playerActiveMagi" name='Player Active Magi' />
            <Zone zoneId="playerHand" name='Player hand' />
            {prompt && <PromptOverlay />}
        </div>
    );
}

function mapStateToProps(state) {
    return {
        prompt: isPromptActive(state),
    };
}

const enhance = connect(mapStateToProps);

export default enhance(App);
