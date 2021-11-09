export const getDecks = state=> state.decks;
export const getCurrentDeck = state => state.currentDeck;
export const getSelectedDeck = state => state.decks.find(deck => deck._id === state.currentDeck);
