import {mapProps} from 'recompose';
import {connect} from 'react-redux';
import {byName} from 'moonlands/src/cards';
import {zoneContent} from '../selectors';

const propsTransformer = props => ({
    ...props,
    content: props.content.map(cardData => ({
        ...cardData,
        card: byName(cardData.card),
    })),
});

export const withCardData = mapProps(propsTransformer);

function mapStateToProps(state, {zoneId}) {
    return {
        content: zoneContent(zoneId, state),
    };
}

export const withZoneContent = connect(mapStateToProps);
