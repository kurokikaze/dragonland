import {mapProps} from 'recompose';
import {byName} from 'moonlands/src/cards';

const propsTransformer = props => ({
    ...props,
    content: props.content.map(cardData => ({
        ...cardData,
        card: byName(cardData.card),
    })),
});

export const withCardData = mapProps(propsTransformer);