import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {
    TYPE_CREATURE,
    TYPE_RELIC,
    TYPE_SPELL,
} from 'moonlands/src/const';
import Card from './Card';
import {
    STEP_ATTACK,
} from '../const';
import {withCardData, withZoneContent} from './common';

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

function mapStateToProps(state, {name, activeStep}) {
    return {
        active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
    };
};

const enhance = compose(
    withZoneContent,
    connect(mapStateToProps),
    withCardData,
);

export default enhance(ZoneOpponentActiveMagi);
