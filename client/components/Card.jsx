/* global window, document */
import React, {useEffect} from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import {identity} from 'ramda';
import {branch, compose} from 'recompose';
import cn from 'classnames';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_SPELL,
	TYPE_MAGI,
} from 'moonlands/src/const.js';

import {camelCase} from '../utils';

const DraggableTypes = {
	CARD: 'card',
};

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
		return `/images/masked/${camelCase(card.name)}.jpg`;
	} else {
		return `/images/cards/${camelCase(card.name)}.jpg`;
	}
};

function Card({
	id,
	card,
	data,
	onClick,
	draggable,
	isDragging,
	available,
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
				parentNode.classList.add('animated');
				setTimeout(() => {
					parentNode.classList.remove('animated');
					newAttacker.classList.remove('attackSource');
				}, 600);
			}
		}
	}, [attacker]);

	const connector = (draggable && connectDragSource) ? connectDragSource : (target && connectDropTarget ? connectDropTarget : identity);
	const classes = cn(
		'cardHolder',
		card ? typeClass[card.type] : null,
		{
			'dragging': isDragging,
			'available': available,
			'target': target,
			'onPrompt': isOnPrompt,
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
		// Return the data describing the dragged item
		return { id: props.id };
	},

	endDrag(props, monitor) {
		if (!monitor.didDrop()) {
			return;
		}

		// When dropped on a compatible target, do something
		const item = monitor.getItem();
		const dropResult = monitor.getDropResult();
		window.socket.emit('clientAction', {
			type: 'actions/attack',
			source: item.id,
			target: dropResult.id,
		});
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
	drop({id}) {
		return {id};
	},
};

const collectDrop = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	canDrop: !!monitor.canDrop(),
});

const enhance = compose(
	branch(({draggable}) => draggable, DragSource(DraggableTypes.CARD, cardSource, collect)),
	branch(({droppable}) => droppable, DropTarget(DraggableTypes.CARD, cardTarget, collectDrop)),
);

export default enhance(Card);