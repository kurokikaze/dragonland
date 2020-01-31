import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import cn from 'classnames';

import './style.css';

function PromptOverlay({winner, youWin}) {
    return (
        <div className="promptOverlay endgame">
            <h1 className={cn({'win': youWin})}>{youWin ? 'VICTORY' : 'DEFEAT'}</h1>
            <p>
                {`Player ${winner} has won`}
            </p>
        </div>
    );
}

function mapStateToProps(state) {
    return {
        winner: state.winner,
        youWin: state.winner === window.playerId,
    };
}

const enhance = connect(mapStateToProps);

export default enhance(PromptOverlay);
