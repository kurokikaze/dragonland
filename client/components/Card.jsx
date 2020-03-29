/* global window */
import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import {identity} from 'ramda';
import {branch, compose} from 'recompose';
import cn from 'classnames';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_SPELL,
	TYPE_MAGI,
} from 'moonlands/src/const';

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

function Card({id, card, data, onClick, draggable, isDragging, available, target, connectDragSource, connectDropTarget, isOnPrompt}) {
	const connector = (draggable && connectDragSource) ? connectDragSource : (target && connectDropTarget ? connectDropTarget : identity);
	return connector(
		<div
			className={cn('cardHolder', card ? typeClass[card.type] : null, {'dragging': isDragging, 'available': available, 'target': target, 'onPrompt': isOnPrompt})} 
			data-id={id}
			onClick={() => onClick && onClick(id)}
		>
			<img src={`/images/cards/${card ? camelCase(card.name) : 'cardBack'}.jpg`} alt={card ? card.name : null} />
			<div className="cardEnergy">
				{data.energy || ''}
			</div>
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