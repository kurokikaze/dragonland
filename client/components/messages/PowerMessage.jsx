import MessageIcon from './MessageIcon.jsx';
import Power from '../icons/Power.tsx';

export default function PowerMessage ({card, power, display = false}) {
	return ((card && display) ?
		<div className="BaseMessage">
			<MessageIcon icon={<Power />} />
			<div className='BaseMessage__messages'>
				<div className='BaseMessage__message'>
					<span className="PowerMessage__source">{card.card}</span> uses power <span className="PowerMessage__power">{power}</span>
				</div>
			</div>
		</div>
		: null
	);
}