import React from 'react';
import {IconProps} from './types';

function Ability({fillColor, size = 50}: IconProps) {
	return (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox="0 0 512 512" style={{'height':`${size}px`, 'width': `${size}px`, fill: fillColor}}>
			<path d="M256 23C127.42 23 23 127.42 23 256s104.42 233 233 233 233-104.42 233-233S384.58 23 256 23zm-6.1 18.09C128.05 47.81 130.08 256 256 256c125.22 0 127.94 205.87 8.17 214.83-2.71.1-5.43.17-8.17.17-118.85 0-215-96.15-215-215 0-116.81 92.88-211.69 208.9-214.91zM256 103c22.54 0 41 18.46 41 41s-18.46 41-41 41-41-18.46-41-41 18.46-41 41-41zm0 224c-22.54 0-41 18.46-41 41s18.46 41 41 41 41-18.46 41-41-18.46-41-41-41z"/>
		</svg>
	);
}

export default Ability;
