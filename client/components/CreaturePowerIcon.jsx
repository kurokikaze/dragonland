import React from 'react';
import Power from './icons/Power.jsx';

function CreaturePowerIcon({active = false, icon = null}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="creaturePowerIcon">
			{icon && React.cloneElement(icon, {fillColor, size: 20})}
			{!icon && <Power size={20} icon fillColor={fillColor} />}
		</div>
	);
}

export default CreaturePowerIcon;
