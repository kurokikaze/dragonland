import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, withHandlers, withStateHandlers} from 'recompose';
import {camelCase} from '../utils';
import Card from './Card';

import {
    ACTION_RESOLVE_PROMPT,
    PROMPT_TYPE_CHOOSE_CARDS,
} from 'moonlands/src/const';

function PromptChooseCards({params, triggerElement, selected, onSend}) {
    return (
        <div className="promptWindow promptChooseCards">
            <h1>Choose starting cards</h1>
            <div className="cardsRow">
                {params.map((card, i) => (
                    <div className={`cardSelect ${selected.includes(card) ? 'chosen' : ''}`} key={i}>
                        <Card id={`test${i}`} card={{name: card}} data={{}} onClick={() => triggerElement(card)} />
                    </div>
                ))}
            </div>
            <div className="buttonHolder">
                <button onClick={() => onSend()}>OK</button>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    generatedBy: state.promptGeneratedBy,
});

const enhance  = compose(
    connect(mapStateToProps),
    withStateHandlers(
        ({params}) => ({selected: params}),
        {
            triggerElement: ({selected}) => (cardName) => ({
                selected: selected.includes(cardName) ? selected.filter(e => e !== cardName): [...selected, cardName],
            }),
        }
    ),
    withHandlers({
        onSend: props => event => {
            window.socket.emit('action', {
                type: ACTION_RESOLVE_PROMPT,
                promptType: PROMPT_TYPE_CHOOSE_CARDS,
                cards: props.selected,
                generatedBy: props.generatedBy,
                player: window.playerId,
            });
        },
    }),
);

export default enhance(PromptChooseCards);