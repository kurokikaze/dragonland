import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import Card from './Card';
import {zoneContent} from '../selectors';

function Zone({ name, content}) {
    return (
        <div className="zone" data-zone-name={name}>
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
        content: zoneContent(zoneId, state),
    };
}

const enhance = connect(mapStateToProps);

export default enhance(Zone);
