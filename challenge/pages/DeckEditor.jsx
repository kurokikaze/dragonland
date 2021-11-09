import {default as DeckEditorComponent} from '../components/DeckEditor/DeckEditor.jsx';
import DeckSelector from '../components/DeckSelector.jsx';

export default function DeckEditor({ deckId = null }) {
	return (<div style={{ paddingTop: 50 }}>
		{deckId && <DeckEditorComponent deckId={deckId} />}
		{!deckId && <DeckSelector />}
	</div>);
}