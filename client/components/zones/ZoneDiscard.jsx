import {compose} from 'recompose';

import Card from '../Card.jsx';

import {withCardData, withZoneContent} from '../common';

import {withView} from '../CardView.jsx';

const CardWithView = withView(Card);

function ZoneDiscard({ name, content }) {
	return (
		<div className='zone zone-discard' data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<CardWithView
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
				/>,
			) : null}
		</div>
	);
}

const enhance = compose(
	withZoneContent,
	withCardData,
);

export default enhance(ZoneDiscard);
