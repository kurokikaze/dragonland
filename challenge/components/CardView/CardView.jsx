import React from 'react';
import {camelCase} from '../../../common/utils.js';
import cn from 'classnames';

import './styles.css';

export default function CardView({name, className, top = true}) {
	return (
		<div className={cn('cardViewHolder fadeInDown', className, {'showOnTop': top})}>
			<div className='cardView'>
				<img src={`/images/cards/${camelCase(name)}.jpg`} alt={name} />
			</div>
			<span>{name}</span>
		</div>
	);
}
