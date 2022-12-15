import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {camelCase} from '../../utils';

const CARD_IMAGE = 'card_image';

const getCardUrl = (card, useLocket) => {
	if (!card) {
		return '/images/cards/cardBack.jpg';
	} else if (useLocket) {
		return `/images/masked/${camelCase(card)}.png`;
	} else {
		return `/images/cards/${camelCase(card)}.jpg`;
	}
};

const PromptCardImage = ({ card, id, index, onMove }) => {
	const ref = useRef(null);
	const [{ handlerId }, drop] = useDrop({
		accept: CARD_IMAGE,
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			};
		},
		hover(item, _monitor) {
			if (!ref.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;
			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return;
			}
			// Determine rectangle on screen
			const hoverBoundingRect = ref.current?.getBoundingClientRect();
			// Get vertical middle
			const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
			// Determine mouse position
			const clientOffset = _monitor.getClientOffset();
			// Get pixels to the top
			const hoverClientX = clientOffset.x - hoverBoundingRect.left;
			// Only perform the move when the mouse has crossed half of the items height
			// When dragging downwards, only move when the cursor is below 50%
			// When dragging upwards, only move when the cursor is above 50%
			// Dragging left
			if (dragIndex < hoverIndex && hoverClientX > hoverMiddleX - 30) {
				return;
			}
			// Dragging right
			if (dragIndex > hoverIndex && hoverClientX < hoverMiddleX + 30) {
				return;
			}
			// Time to actually perform the action
			onMove(dragIndex, hoverIndex);
			// Note: we're mutating the monitor item here!
			// Generally it's better to avoid mutations,
			// but it's good here for the sake of performance
			// to avoid expensive index searches.
			_monitor.internalMonitor.getItem().index = hoverIndex;
		},
	});
	const [, drag] = useDrag({
		type: CARD_IMAGE,
		item: () => {
			return { id, index };
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});	

	drag(drop(ref));

	return (<div
		ref={ref}
		className="movableCard"
		id={`test_${card}`}
		data-handler-id={handlerId}>
		<img src={getCardUrl(card, false)} data-drag-index={index} data-drag-id={id}  alt={card ? card.name : null} />
	</div>);
};

export default PromptCardImage;
