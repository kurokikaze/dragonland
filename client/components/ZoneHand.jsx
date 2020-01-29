import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import {byName} from 'moonlands/src/cards';
import Card from './Card';
import {zoneContent} from '../selectors';

const STEP_CREATURES = 3;
const STEP_PRS_FIRST = 4;

function ZoneHand({ name, content, onCardClick, active }) {
    return (
        <div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
            {content.length ? content.map(cardData =>
                <Card
                    key={cardData.id}
                    id={cardData.id}
                    card={cardData.card}
                    data={cardData.data}
                    onClick={onCardClick}
                    inActiveZone={active}
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
        active: state.step === activeStep && state.activePlayer == window.playerId,
        content: zoneContent(zoneId, state),
    };
}

const enhance = compose(
    connect(mapStateToProps),
    mapProps(propsTranformer),
);

export default enhance(ZoneHand);
