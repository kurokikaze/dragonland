import {useSelector, useDispatch} from 'react-redux';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import {A} from 'hookrouter';
import {DeckContent} from './DeckContent/index';
import Edit from './icons/Edit.jsx';
import {changeCurrentDeck} from '../actions/index.js';
import { getSelectedDeck, getCurrentDeck, getDecks } from '../selectors';

const {Option} = Select;

function DeckSelector() {
	const dispatch = useDispatch();

	const decks = useSelector(getDecks);
	const currentDeck = useSelector(getCurrentDeck);
	const deck = useSelector(getSelectedDeck);

	return <div>
		<h2>Decks</h2>
		<div>
			<Space>
				<Select onChange={value => dispatch(changeCurrentDeck(value))} defaultValue={currentDeck}>
					{decks.map(deck => (<Option key={deck._id} value={deck._id}>{deck.name}</Option>))}
				</Select>
				{deck && <A href={`/deck-editor/${deck._id}`}><Edit size={30} fill='#555' /></A>}
			</Space>
		</div>
		{deck && <DeckContent />}
	</div>;
}

export default DeckSelector;
