var challenges = [];

export function addChallenge(challenge) {
	challenges.push(challenge);
}

export function removeChallenge(deckId) {
	challenges = challenges.filter(challenge => challenge.deckId !== deckId);
}

export function removeByName(username) {
	challenges = challenges.filter(challenge => challenge.user !== username);
}
export function getChallenges() {
	return challenges;
}