import React from 'react';
import ReactDOM from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import {identity} from 'ramda';
import {branch, compose, renderComponent} from 'recompose'
import cn from 'classnames';
import {camelCase} from '../utils';

const DraggableTypes = {
    CARD: 'card',
};

function Card({id, card, data, onClick, draggable, isDragging, available, target, connectDragSource, connectDropTarget}) {
    const connector = (draggable && connectDragSource) ? connectDragSource : (target && connectDropTarget ? connectDropTarget : identity);
    return connector(
        <div 
            className={cn('cardHolder', {'dragging': isDragging, 'available': available, 'target': target})} 
            data-id={id}
            onClick={() => onClick && onClick(id)}
        >
            <img src={`/images/cards/${camelCase(card.name)}.jpg`} alt={card.name} data-card-data={JSON.stringify(card)} />
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

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      return
    }

    // When dropped on a compatible target, do something
    const item = monitor.getItem()
    const dropResult = monitor.getDropResult()
    window.socket.emit('action', {
      type: 'actions/attack',
      source: item.id,
      target: dropResult.id,
    });
  },
}

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging(),
  }
}

const cardTarget = {
  drop({id}) {
    return {id};
  },
}

const collectDrop = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: !!monitor.canDrop(),
});

const enhance = compose(
    branch(({draggable}) => draggable, DragSource(DraggableTypes.CARD, cardSource, collect)),
    branch(({droppable}) => droppable, DropTarget(DraggableTypes.CARD, cardTarget, collectDrop)),
);

export default enhance(Card);