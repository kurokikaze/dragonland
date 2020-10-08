import React from 'react';
import Power from './icons/Power.jsx';

function CreaturePowerIcon({active = false, icon = null, number = null}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="creaturePowerIcon">
			{icon && React.cloneElement(icon, {fillColor, size: 20})}
			{!icon && <Power size={20} icon fillColor={fillColor} />}
			{number && <div className='iconNumber'>{number}</div>}
		</div>
	);
}

export default CreaturePowerIcon;
