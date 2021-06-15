import {A} from 'hookrouter';
import {default as DeckEditorComponent} from '../components/DeckEditor/DeckEditor.jsx';

export default function DeckEditor({deckId}) {
	return (<div>
		<h2>Deck editor: {deckId}</h2>
		<A href="/">Go home</A>
		<DeckEditorComponent deckId={deckId} />
	</div>);
}