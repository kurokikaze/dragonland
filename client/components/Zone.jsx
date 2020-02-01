import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import Card from './Card';
import {zoneContent} from '../selectors';
import {withCardData} from './common';

function Zone({ name, content, onCardClick, active }) {
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

function mapStateToProps(state, {zoneId, name, activeStep}) {
    return {
        name,
        active: state.step === activeStep && state.activePlayer == window.playerId,
        content: zoneContent(zoneId, state),
    };
}

const enhance = compose(
    connect(mapStateToProps),
    withCardData,
);

export default enhance(Zone);
