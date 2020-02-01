import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import {
    ACTION_RESOLVE_PROMPT,

    TYPE_CREATURE,
    TYPE_RELIC,
    TYPE_SPELL,

    PROMPT_TYPE_SINGLE_CREATURE,
} from 'moonlands/src/const';
import Card from './Card';
import {zoneContent} from '../selectors';
import {
    STEP_ATTACK,
} from '../const';
import {withCardData} from './common';

function ZonePlayerInPlay({ name, content, active, cardClickHandler, isOnCreaturePrompt }) {
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
                    draggable={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
                    available={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
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

function mapStateToProps(state, {zoneId, name, activeStep}) {
    return {
        name,
        active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
        content: zoneContent(zoneId, state),
        isOnCreaturePrompt: state.prompt && state.promptType === PROMPT_TYPE_SINGLE_CREATURE,
        promptGeneratedBy: state.promptGeneratedBy,
    };
};

const enhance = compose(
    connect(mapStateToProps),
    mapProps(propsTransformer),
    withCardData,
);

export default enhance(ZonePlayerInPlay);
