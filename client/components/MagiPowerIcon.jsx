import React from 'react';
import Power from './icons/Power.jsx';

function MagiPowerIcon({active = false}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="magiPowerIcon">
			<Power size={40} fillColor={fillColor} />
		</div>
	);
}

export default MagiPowerIcon;