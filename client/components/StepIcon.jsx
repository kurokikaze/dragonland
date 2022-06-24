import {cloneElement} from 'react';

function StepIcon({icon, active = false, activeColor = '#F8E71C', inactiveColor = '#9A9A8F'}) {
	const fillColor = active ? activeColor : inactiveColor;

	return (
		<div className="stepIcon">
			{cloneElement(icon, {fillColor})}
		</div>
	);
}

export default StepIcon;