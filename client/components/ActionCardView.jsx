import { useSelector } from 'react-redux';
import { byName } from 'moonlands/dist/cards.js';
import cn from 'classnames'; 
import { MESSAGE_TYPE_POWER, MESSAGE_TYPE_RELIC } from '../const.js';
import { getPowerSource } from '../selectors';
import { camelCase } from '../utils.js';

function ActionCardView() {
	const message = useSelector(state => state.message);

	const show = message && 
		(message.type === MESSAGE_TYPE_POWER || message.type === MESSAGE_TYPE_RELIC);

	const relic = message && message.type === MESSAGE_TYPE_RELIC;
	const relicCard = relic ? message.card.card : null;
	const source = useSelector(getPowerSource(message?.source || ''));
	let power = null;
	let sourceCard = null;
	if (source) {
		console.log(`Found one: ${JSON.stringify(source)}`);
		sourceCard = byName(source.card);
		if (sourceCard) {
			power = sourceCard.data.powers.find(({ name }) => name === message.power);
		}
	}
	
	return <div> 
		{show && <div className={cn('action-card-view', { 'power-view': power, 'relic-view': relic })}>
			{power && <div className='power-view'>
				<h3>{power.name}</h3>
				<p>{power.text}</p>
			</div>}
			{relic && <div className="cardViewHolder relic"><div className="cardView"><img src={`/images/cards/${camelCase(relicCard)}.jpg`}/></div></div>}
		</div>}
	</div>;
}

export default ActionCardView;
