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
import {zoneContent} from '../selectors';
import {
    STEP_ATTACK,
} from '../const';

function ZoneOpponentActiveMagi({ name, content, active }) {
    return (
        <div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
            {content.length ? content.map(cardData =>
                <Card
                    key={cardData.id}
                    id={cardData.id}
                    card={cardData.card}
                    data={cardData.data}
                    onClick={() => {}}
                    droppable={active}
                    target={active}
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
        active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
        content: zoneContent(zoneId, state),
    };
};

const enhance = compose(
    connect(mapStateToProps),
    mapProps(propsTranformer),
);

export default enhance(ZoneOpponentActiveMagi);
