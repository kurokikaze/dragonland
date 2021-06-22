/* global window */
import {useState, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {
	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
	TYPE_CREATURE,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';
import {
	STEP_ATTACK,
	CLIENT_ACTION,
} from '../../const';
import {
	isPRSAvailable,
	getAnimation,
	isOurTurn,
	isPromptActive,
	getCurrentStep,
	getPromptType,
	getPromptParams,
	getPromptGeneratedBy,
} from '../../selectors';
import {
	useZoneContent,
	useCardData,
	UNFILTERED_CREATURE_PROMPTS,
	FILTERED_CREATURE_PROMPTS,
	getPromptFilter,
} from '../common.js';
import {withAbilities} from '../CardAbilities.jsx';
import Velociraptor from '../icons/Velociraptor.tsx';

import './style.css';

const CardWithAbilities = withAbilities(Card);

const packHuntFilter = cardData => cardData.card.data && cardData.card.data.canPackHunt;

function ZonePlayerInPlay({
	name,
	zoneId,
}) {
	const SelectedCard = CardWithAbilities;

	const [packs, setPacks] = useState([]);
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);
	const prsAvailable = useSelector(isPRSAvailable);
	const animation = useSelector(getAnimation);
	const ourTurn = useSelector(isOurTurn);
	const currentStep = useSelector(getCurrentStep);
	const active = ourTurn && currentStep === STEP_ATTACK;
	const isOnPrompt = useSelector(isPromptActive);
	const promptType = useSelector(getPromptType);
	const promptParams = useSelector(getPromptParams);
	const promptGeneratedBy = useSelector(getPromptGeneratedBy);

	const hasPackHunters = content.some(packHuntFilter);
	const packHuntersList = content.filter(packHuntFilter).map(({id}) => id);

	const isOnUnfilteredPrompt = isOnPrompt && UNFILTERED_CREATURE_PROMPTS.includes(promptType);
	const isOnFilteredPrompt = isOnPrompt && FILTERED_CREATURE_PROMPTS.includes(promptType);
	const promptFilter = useCallback(getPromptFilter(promptType, promptParams), [promptType, promptParams]);

	const onAddToPack = (newLeader, newHunter) => {
		const pack = packs.find(p => p.leader === newLeader);
		if (pack) {
			setPacks(packs.map(({leader, hunters}) => leader === newLeader ? {leader, hunters: [...hunters, newHunter]} : {leader, hunters}));
		} else {
			setPacks([...packs, {leader: newLeader, hunters: [newHunter]}]);
		}
	};

	useEffect(() => {
		const ids = new Set(content.map(({id}) => id));
		setPacks(packs => active ? packs.filter(({leader}) => ids.has(leader)) : []);
	}, [content, active]);

	const onRemovePack = (leaderId) => {
		setPacks(packs.filter(({leader}) => leader !== leaderId));
	};

	const cardClickHandler = isOnPrompt ? cardId => {
		window.socket.emit(CLIENT_ACTION, {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: promptGeneratedBy,
		});
	} : () => {};

	const abilityUseHandler = (id, powerName) => window.socket.emit(CLIENT_ACTION, {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	});

	return (
		<div className={cn('zone', 'zone-player-creatures', 'zone-creatures', {'zone-active' : active})} data-zone-name={name}>
			{content.filter(({id}) => !packs.some(pack => pack.hunters.includes(id))).map(cardData =>
				<div key={cardData.id} className='packHolder'>
					<SelectedCard
						id={cardData.id}
						card={cardData.card}
						data={cardData.data}
						modifiedData={cardData.modifiedData}
						onClick={cardClickHandler}
						isOnPrompt={isOnUnfilteredPrompt || (isOnFilteredPrompt && promptFilter(cardData))}
						draggable={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.modifiedData.attacksPerTurn}
						target={active && hasPackHunters && cardData.data.attacked < cardData.modifiedData.attacksPerTurn && !packs.some(({leader}) => leader === cardData.id) && packHuntersList.some(id => id !== cardData.id)}
						pack={packs.find(({leader}) => leader === cardData.id)}
						droppable={active && hasPackHunters && !packs.some(({leader}) => leader === cardData.id) && packHuntersList.some(id => id !== cardData.id)}
						available={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.modifiedData.attacksPerTurn}
						actionsAvailable={prsAvailable}
						onAbilityUse={abilityUseHandler}
						onPackHunt={onAddToPack}
						className={cn({'attackTarget': animation && animation.target === cardData.id})}
					/>
					{packs.some(({leader}) => leader === cardData.id) ? 
						<div className='packHuntCounter' onClick={() => onRemovePack(cardData.id)}>+ <Velociraptor size={20} fillColor='#fff' /></div>
						: null}
				</div>
			)}
		</div>
	);
}

export default ZonePlayerInPlay;
