import React from 'react';
import {camelCase} from '../utils';

export const withView = Component => (props) => {
	return (
		<div className='cardViewHolder fadeInDown'>
			<div className='cardView'>
				<img src={`/images/cards/${camelCase(props.card.name)}.jpg`} alt={props.card.name} />
			</div>
			<Component 
				{...props} 
			/>
		</div>
	);
};
