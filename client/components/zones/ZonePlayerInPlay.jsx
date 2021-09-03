/* global window */
import {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import cn from 'classnames';
import {
	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
	TYPE_CREATURE,
	PROMPT_TYPE_REARRANGE_ENERGY_ON_CREATURES,
	PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
	PROMPT_TYPE_DISTRIBUTE_DAMAGE_ON_CREATURES,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';
import {
	STEP_ATTACK,
	CLIENT_ACTION,
} from '../../const';
import {
	addToPack,
	dismissPack,
} from '../../actions';
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
	UNFILTERED_CREATURE_PROMPTS,
	FILTERED_CREATURE_PROMPTS,
	getPromptFilter,
	getCardDetails,
} from '../common.js';
import {withAbilities} from '../CardAbilities.jsx';
import {withEnergyManipulation} from '../CardEnergyManipulation.jsx';
import Velociraptor from '../icons/Velociraptor.tsx';

import './style.css';

const CardWithAbilities = withAbilities(Card);
const CardWithEnergyManipulation = withEnergyManipulation(Card);

const packHuntFilter = cardData => cardData.card.data && cardData.card.data.canPackHunt;

const getPacks = state => state.packs;

function ZonePlayerInPlay({
	name,
}) {
	const packs = useSelector(getPacks);
	const rawContent = useSelector(getCardDetails);
	const content = rawContent.inPlay.filter(card => card.card.type === TYPE_CREATURE && card.data.controller === window.playerId);

	const prsAvailable = useSelector(isPRSAvailable);
	const animation = useSelector(getAnimation);
	const ourTurn = useSelector(isOurTurn);
	const currentStep = useSelector(getCurrentStep);
	const active = ourTurn && currentStep === STEP_ATTACK;
	const isOnPrompt = useSelector(isPromptActive);
	const promptType = useSelector(getPromptType);
	const promptParams = useSelector(getPromptParams);
	const promptGeneratedBy = useSelector(getPromptGeneratedBy);

	const SelectedCard = (
		promptType === PROMPT_TYPE_REARRANGE_ENERGY_ON_CREATURES ||
		promptType === PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES ||
		promptType === PROMPT_TYPE_DISTRIBUTE_DAMAGE_ON_CREATURES)
		? CardWithEnergyManipulation
		: CardWithAbilities;

	const dispatch = useDispatch();

	const hasPackHunters = content.some(packHuntFilter);
	const packHuntersList = content.filter(packHuntFilter).map(({id}) => id);

	const isOnUnfilteredPrompt = isOnPrompt && UNFILTERED_CREATURE_PROMPTS.includes(promptType);
	const isOnFilteredPrompt = isOnPrompt && FILTERED_CREATURE_PROMPTS.includes(promptType);
	const promptFilter = useCallback(getPromptFilter(promptType, promptParams), [promptType, promptParams]);

	const onAddToPack = (leader, hunter) => {
		dispatch(addToPack(leader, hunter));
	};

	const onRemovePack = (leader) => {
		dispatch(dismissPack(leader));
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
						card={cardData.originalCard}
						data={cardData.data}
						modifiedData={cardData.card.data}
						onClick={cardClickHandler}
						isOnPrompt={isOnUnfilteredPrompt || (isOnFilteredPrompt && promptFilter(cardData))}
						draggable={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
						target={active && hasPackHunters && cardData.data.attacked < cardData.card.data.attacksPerTurn && !packs.some(({leader}) => leader === cardData.id) && packHuntersList.some(id => id !== cardData.id)}
						pack={packs.find(({ leader }) => leader === cardData.id)}
						droppable={active && hasPackHunters && !packs.some(({leader}) => leader === cardData.id) && packHuntersList.some(id => id !== cardData.id)}
						available={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
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
