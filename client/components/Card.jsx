/* global window, document */
import {useLayoutEffect, useRef} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import cn from 'classnames';
import {gsap} from 'gsap';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_SPELL,
	TYPE_MAGI,
} from 'moonlands/dist/const.js';
import {canFirstAttackSecond, canPackHuntWith} from './helpers.js';
import {camelCase} from '../utils.js';

const DraggableTypes = {
	CARD: 'card',
};

// type ClassTypesType = Record<CardType, string>
const typeClass = {
	[TYPE_CREATURE]: 'creature',
	[TYPE_RELIC]: 'relic',
	[TYPE_SPELL]: 'spell',
	[TYPE_MAGI]: 'magi',
};

const getCardUrl = (card, useLocket) => {
	if (!card) {
		return '/images/cards/cardBack.jpg';
	} else if (useLocket) {
		return `/images/masked/${camelCase(card.name)}.png`;
	} else {
		return `/images/cards/${camelCase(card.name)}.jpg`;
	}
};

/*type CardProps = {
	id: string;
	card: MoonlandsCard;
	data: CardData;
	onClick: () => void;
	draggable: boolean;
	isDragging: boolean;
	available: boolean;
	useLocket: boolean;
	modifiedData: MoonlandsCard;
	pack: string[];
	target: boolean;
	connectDragSource: () => void;
	connectDropTarget: () => void;
	isOnPrompt: boolean;
	className: string;
	attacker: boolean;
}*/

function Card({
	id,
	card,
	data,
	onClick,
	draggable,
	droppable,
	guarded,
	available,
	modifiedData,
	pack,
	isOnPrompt,
	className,
	attacker,
	target,
	onPackHunt,
	useLocket = false,
}) {
	useLayoutEffect(() => {
		const attacker = document.querySelector('.attackSource');
		const target = document.querySelector('.attackTarget');
		if (attacker && target) {

			const targetBox = target.getBoundingClientRect();
			const attackerBox = attacker.getBoundingClientRect();
			const offsetX = targetBox.left - attackerBox.left;
			const offsetY = targetBox.top - attackerBox.top;

			const tl = gsap.timeline({});
			tl.to(attacker, {x: offsetX, y: offsetY, duration: 0.3});
			tl.to(attacker, {x: 0, y: 0, duration: 0.4});

			tl.play();
			const additionalAttacker = document.querySelector('.additionalAttacker');
			if (additionalAttacker) {
				const addAttackerBox = additionalAttacker.getBoundingClientRect();
				const addOffsetX = targetBox.left - addAttackerBox.left;
				const addOffsetY = targetBox.top - addAttackerBox.top;
				const tl2 = gsap.timeline({});
				tl2.to(additionalAttacker, {x: addOffsetX, y: addOffsetY, duration: 0.3});
				tl2.to(additionalAttacker, {x: 0, y: 0, duration: 0.4});
	
				tl2.play();
				return () => {tl.clear();tl2.clear();};
			}
			return () => tl.clear();
		}
		
	}, [attacker]);

	const ref = useRef(null);
	const [, drag] = useDrag(() => ({
		// "type" is required. It is used by the "accept" specification of drop targets.
		type: DraggableTypes.CARD,
		// The collect function utilizes a "monitor" instance (see the Overview for what this is)
		// to pull important pieces of state from the DnD system.
		item: () => ({ card, data, id, pack }),
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		})
	}), [card, data, id, pack]);

	const [{ isDragging }, drop] = useDrop(() => ({
		// The type (or types) to accept - strings or symbols
		accept: DraggableTypes.CARD,
		// Props to collect
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop()
		}),
		drop: (item) => {
			const dropTarget = { card, data, id, guarded };

			const canAttack = canFirstAttackSecond(item, dropTarget);

			const canPackHunt = canPackHuntWith(item, dropTarget);

			if (canAttack) {
				console.dir({
					type: 'actions/attack',
					source: item.id,
					target: id,
					additionalAttackers: item.pack ? item.pack.hunters : [],
				});
				window.socket.emit('clientAction', {
					type: 'actions/attack',
					source: item.id,
					target: id,
					additionalAttackers: item.pack ? item.pack.hunters : [],
				});
			} else if (canPackHunt) {
				onPackHunt(id, item.id);
			} else {
				console.log('Problem, capn');
			}
		}
	}), [card, data, id, guarded]);

	if (droppable) {
		drop(ref);
	}
	if (draggable) {
		drag(ref);
	}
	
	const classes = cn(
		'cardHolder',
		card ? typeClass[card.type] : null,
		{
			'dragging': isDragging,
			'available': available,
			'target': target,
			'onPrompt': isOnPrompt,
			'canPackHunt': (card && modifiedData) ? (card.data.canPackHunt && data.attacked < modifiedData.attacksPerTurn && !pack) : null,
		},
		className
	);

	return (
		<div
			className={classes}
			data-id={id}
			onClick={() => onClick && onClick(id)}
			ref={ref}
		>
			<img src={getCardUrl(card, useLocket)} alt={card ? card.name : null} />
			{data && <>
				{(card && data.energy && data.energy !== card.cost) ? <div className="startingEnergy">
					{card.cost}
				</div> : null}
				<div className="cardEnergy">
					{data.energy || ''}
				</div>
			</>}
		</div>
	);
}

export default Card;