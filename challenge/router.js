import ChallengePage from './pages/Challenge.jsx';
import DeckEditor from './pages/DeckEditor.jsx';

const routes = {
	// eslint-disable-next-line react/display-name
	'/': () => <ChallengePage />,
	// eslint-disable-next-line react/display-name
	'/deck-editor/:deck': ({deck}) => <DeckEditor deckId={deck} />,
	// eslint-disable-next-line react/display-name
	'/deck-editor': () => <DeckEditor deckId={null} />,
};

export default routes;