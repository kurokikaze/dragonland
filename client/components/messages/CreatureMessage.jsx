import MessageIcon from './MessageIcon.jsx';
import Creature from '../icons/Creature.tsx';

export default function CreatureMessage ({card, display}) {
	return ((card && display) ?
		<div className="BaseMessage">
			<MessageIcon icon={<Creature />} />
			<div className='BaseMessage__message'>
				Opponent plays creature <span className="CreatureMessage__creature">{card.card}</span>
			</div>
		</div>
		: null
	);
}