import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import Card from './Card';

function Zone({ name, content}) {
    return (
        <div className="zone" data-zone-name={name}>
            {`Cards`}
            {content.length ? content.map(cardData =>
                <Card
                    key={cardData.id}
                    id={cardData.id}
                    card={cardData.card}
                    data={cardData.data}
                />,
            ) : null}
        </div>
    );
}

function mapStateToProps(state, {zoneId, name}) {
    return {
        name,
        content: (state.zones && state.zones[zoneId]) ? state.zones[zoneId] : [],
    }
}

const enhance = connect(mapStateToProps);

export default enhance(Zone);
