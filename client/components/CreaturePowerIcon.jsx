import React from 'react';
import Power from './icons/Power.jsx';

function CreaturePowerIcon({active = false}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="creaturePowerIcon">
			<Power size={20} fillColor={fillColor} />
		</div>
	);
}

export default CreaturePowerIcon;