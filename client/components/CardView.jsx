import {camelCase} from '../utils.js';

// eslint-disable-next-line react/display-name
export const withView = Component => (props) => {
	console.dir(props);
	return (
		<div className='cardViewHolder fadeInDown'>
			{props.card && <div className='cardView'>
				<img src={`/images/cards/${camelCase(props.card.name)}.jpg`} alt={props.card.name} />
			</div>}
			<Component 
				{...props} 
			/>
		</div>
	);
};
