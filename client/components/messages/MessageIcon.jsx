import {cloneElement} from 'react';

function MagiPowerIcon({icon}) {
	return (
		<div className="messageIcon">
			{cloneElement(icon, {fillColor: 'lightgray'})}
		</div>
	);
}

export default MagiPowerIcon;