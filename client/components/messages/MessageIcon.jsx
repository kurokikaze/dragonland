import React from 'react';

function MagiPowerIcon({icon}) {
	return (
		<div className="messageIcon">
			{React.cloneElement(icon, {fillColor: 'lightgray'})}
		</div>
	);
}

export default MagiPowerIcon;