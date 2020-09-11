import React from 'react';
import Power from './icons/Power.jsx';

function MagiPowerIcon({active = false, icon = null}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="magiPowerIcon">
			{icon && React.cloneElement(icon, {fillColor, size: 20})}
			{!icon && <Power size={40} icon fillColor={fillColor} />}
		</div>
	);
}

export default MagiPowerIcon;