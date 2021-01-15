import React from 'react';
import Power from './icons/Power.tsx';

function MagiPowerIcon({active = false, number = null, icon = null}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="magiPowerIcon">
			{icon && React.cloneElement(icon, {fillColor, size: 40})}
			{!icon && <Power size={40} fillColor={fillColor} />}
			{number && <div className='iconNumber'>{number}</div>}
		</div>
	);
}

export default MagiPowerIcon;