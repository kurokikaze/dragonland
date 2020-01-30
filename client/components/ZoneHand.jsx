import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import {
    TYPE_CREATURE,
    TYPE_RELIC,
    TYPE_SPELL,
} from 'moonlands/src/const';
import {byName} from 'moonlands/src/cards';
import Card from './Card';
import {zoneContent, getMagiEnergy} from '../selectors';
import {
    STEP_CREATURES,
    STEP_PRS_FIRST,
    STEP_PRS_SECOND,
} from '../const';

const canCast = (cardType, cardCost, magiEnergy, currentStep) => 
    (cardCost <= magiEnergy) && (
         (cardType == TYPE_CREATURE && currentStep == STEP_CREATURES) ||
         ([TYPE_RELIC, TYPE_SPELL].includes(cardType) && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(currentStep))
    );

function ZoneHand({ name, content, onCardClick, active, magiEnergy, currentStep }) {
    return (
        <div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
            {content.length ? content.map(cardData =>
                <Card
                    key={cardData.id}
                    id={cardData.id}
                    card={cardData.card}
                    data={cardData.data}
                    onClick={onCardClick}
                    available={active && canCast(cardData.card.type, cardData.card.cost, magiEnergy, currentStep)}
                />,
            ) : null}
        </div>
    );
}

const propsTranformer = props => ({
    ...props,
    content: props.content.map(cardData => ({
        ...cardData,
        card: byName(cardData.card),
    })),
});

function mapStateToProps(state, {zoneId, name, activeStep}) {
    return {
        name,
        currentStep: state.step,
        magiEnergy: getMagiEnergy(state),
        active: state.activePlayer == window.playerId,
        content: zoneContent(zoneId, state),
    };
};

const enhance = compose(
    connect(mapStateToProps),
    mapProps(propsTranformer),
);

export default enhance(ZoneHand);
