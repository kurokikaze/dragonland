import Card from '../Card.jsx';
import {useCardData, useZoneContent} from '../common';
import {withView} from '../CardView.jsx';

const CardWithView = withView(Card);

function ZoneDiscard({ name, zoneId }) {
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);

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

export default ZoneDiscard;
