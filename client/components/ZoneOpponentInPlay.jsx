import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import {
    TYPE_CREATURE,
    TYPE_RELIC,
    TYPE_SPELL,
    ACTION_RESOLVE_PROMPT,
    PROMPT_TYPE_SINGLE_CREATURE,
} from 'moonlands/src/const';
import Card from './Card';
import {
    STEP_ATTACK,
} from '../const';
import {withCardData, withZoneContent} from './common';

function ZoneOpponentInPlay({ name, content, active, cardClickHandler, isOnCreaturePrompt }) {
    return (
        <div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
            {content.length ? content.map(cardData =>
                <Card
                    key={cardData.id}
                    id={cardData.id}
                    card={cardData.card}
                    data={cardData.data}
                    onClick={cardClickHandler}
                    isOnPrompt={isOnCreaturePrompt}
                    droppable={active && cardData.card.type === TYPE_CREATURE}
                    target={active && cardData.card.type === TYPE_CREATURE}
                />,
            ) : null}
        </div>
    );
}

const propsTransformer = props => ({
    ...props,
    cardClickHandler: props.isOnCreaturePrompt ? cardId => {
        window.socket.emit('action', {
            type: ACTION_RESOLVE_PROMPT,
            target: cardId,
            generatedBy: props.promptGeneratedBy,
        });
    } : () => {},
});

function mapStateToProps(state, {name, activeStep}) {
    return {
        active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
        isOnCreaturePrompt: state.prompt && state.promptType === PROMPT_TYPE_SINGLE_CREATURE,
        promptGeneratedBy: state.promptGeneratedBy,
    };
};

const enhance = compose(
    withZoneContent,
    connect(mapStateToProps),
    mapProps(propsTransformer),
    withCardData,
);

export default enhance(ZoneOpponentInPlay);
