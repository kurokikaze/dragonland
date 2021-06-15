/* global window, document */
import {useEffect} from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import identity from 'ramda/src/identity';
import {branch, compose} from 'recompose';
import cn from 'classnames';
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
	isDragging,
	available,
	modifiedData,
	pack,
	target,
	connectDragSource,
	connectDropTarget,
	isOnPrompt,
	className,
	attacker,
	useLocket = false,
}) {
	useEffect(() => {
		const attacker = document.querySelector('.attackSource');
		const target = document.querySelector('.attackTarget');
		if (attacker && target) {
			const targetBox = target.getBoundingClientRect();
			const attackerBox = attacker.getBoundingClientRect();
			const offsetX = targetBox.left - attackerBox.left;
			const offsetY = targetBox.top - attackerBox.top;

			attacker.style.setProperty('--targetOffsetX', `${offsetX}px`);
			attacker.style.setProperty('--targetOffsetY', `${offsetY}px`);

			const newAttacker = attacker.cloneNode(true);
			const parentNode = attacker.parentNode;

			if (parentNode && parentNode.classList) {
				// if (parentNode.contains(attacker)) {
				// 	parentNode.replaceChild(newAttacker, attacker);
				// }
				// @ts-ignore
				parentNode.closest('.zone').classList.add('animated');
				setTimeout(() => {
					// @ts-ignore
					parentNode.closest('.zone').classList.remove('animated');
					// @ts-ignore
					newAttacker.classList.remove('attackSource');
				}, 600);
			}
		}
	}, [attacker]);
	let connector = identity;

	if (draggable && connectDragSource && target && connectDropTarget) {
		connector = compose(
			connectDragSource,
			connectDropTarget,
		);
	} else if (draggable && connectDragSource) {
		connector = connectDragSource;
	} else if (target && connectDropTarget) {
		connector = connectDropTarget;
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

	return connector(
		<div
			className={classes}
			data-id={id}
			onClick={() => onClick && onClick(id)}
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

const cardSource = {
	beginDrag(props) {
		return props;
	},

	endDrag(props, monitor) {
		if (!monitor.didDrop()) {
			return;
		}

		// When dropped on a compatible target, do something
		const item = monitor.getItem();
		const dropResult = monitor.getDropResult();

		const canAttack = canFirstAttackSecond(item, dropResult);

		const canPackHunt = canPackHuntWith(item, dropResult);

		if (canAttack) {
			let additionalAttackers = [];

			if (props.pack) {
				additionalAttackers = props.pack.hunters;
			}

			window.socket.emit('clientAction', {
				type: 'actions/attack',
				source: item.id,
				target: dropResult.id,
				additionalAttackers,
			});
		} else if (canPackHunt) {
			props.onPackHunt(dropResult.id, item.id);
		}
	},
};

function collect(connect, monitor) {
	return {
		// Call this function inside render()
		// to let React DnD handle the drag events:
		connectDragSource: connect.dragSource(),
		// You can ask the monitor about the current drag state:
		isDragging: monitor.isDragging(),
	};
}

const cardTarget = {
	drop(card) {
		return card;
	},
};

const collectDrop = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	canDrop: !!monitor.canDrop(),
});

const enhance = compose(
	branch(({droppable}) => droppable, DropTarget(DraggableTypes.CARD, cardTarget, collectDrop)),
	branch(({draggable}) => draggable, DragSource(DraggableTypes.CARD, cardSource, collect)),
);

export default enhance(Card);