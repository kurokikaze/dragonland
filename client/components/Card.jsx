import React from 'react';
import ReactDOM from 'react-dom';
import {camelCase} from '../utils';

export default function Card({id, card, data, onClick}) {
    return (
        <div className="cardHolder" data-id={id} onClick={onClick}>
            <img src={`/images/cards/${camelCase(card)}.jpg`} alt={card} />
            <div className="cardEnergy">
                {data.energy || ''}
            </div>
        </div>
    );
}