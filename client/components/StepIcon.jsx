import React from 'react';

function StepIcon({icon, active = false}) {
	const fillColor = active ? '#F8E71C' : '#9A9A8F';

	return (
		<div className="stepIcon">
			{React.cloneElement(icon, {fillColor})}
		</div>
	);
}

export default StepIcon;