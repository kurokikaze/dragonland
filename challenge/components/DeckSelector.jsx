import {connect} from 'react-redux';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import {A} from 'hookrouter';
import {DeckContent} from './DeckContent/index';
import Edit from './icons/Edit.jsx';
import {changeCurrentDeck} from '../actions/index.js';

const {Option} = Select;

function DeckSelector({deck, decks, currentDeck, setDeck}) {
	return <div>
		<h2>Decks</h2>
		<div>
			<Space>
				<Select onChange={value => setDeck(value)} defaultValue={currentDeck}>
					{decks.map(deck => (<Option key={deck._id} value={deck._id}>{deck.name}</Option>))}
				</Select>
				{deck && <A href={`/deck-editor/${deck._id}`}><Edit size={30} fill='#555' /></A>}
			</Space>
		</div>
		{deck && <DeckContent />}
	</div>;
}

function mapStateToProps(state) {
	return {
		decks: state.decks,
		currentDeck: state.currentDeck,
		deck: state.decks.find(deck => deck._id === state.currentDeck),
	};
}

function mapDispatchToProps(dispatch) {
	return {
		setDeck: (deck) => {
			dispatch(changeCurrentDeck(deck));
		},
	};
}

const enhance = connect(mapStateToProps, mapDispatchToProps);

export {DeckSelector as Base};

export default enhance(DeckSelector);
