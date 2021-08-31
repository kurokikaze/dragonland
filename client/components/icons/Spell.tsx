import * as React from 'react';
import {IconProps} from './types';

function Spell({fillColor, size = 50}: IconProps) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{'height':`${size}px`, 'width': `${size}px`, fill: fillColor}}>
			<path d="M103.43 17.84a86.78 86.78 0 00-10.95.76c-20.17 2.75-39.16 13.67-52.32 33.67-24.62 37.4 2.19 98.03 56.62 98.03l1.58-.02v.7h60.57c-10.76 32-30.3 66.6-52.45 101.43a283.2 283.2 0 00-6.29 10.4l34.88 35.74-56.26 9.42c-32.73 85.97-27.42 182.08 48.27 182.08l9.31.06c23.83-.57 46.73-4.3 61.33-12.89a43.1 43.1 0 0010.46-8.42h-32.44c-20.33 5.95-40.8-6.94-47.4-25.92-8.95-25.77 7.52-52.36 31.87-60.45a55.55 55.55 0 0117.56-2.84v-.4H356.1c-.57-44.4 16.35-90.13 49.19-126 23.95-26.18 42.03-60.63 51.3-94.85l-41.23-24.93 38.28-6.9-43.37-25.81 52.12-8.85c-5.23-39.14-28.84-68.12-77.37-68.12-43.88 8.53-162.91 11.56-235.68 4.77-14.89-6.77-30.55-10.73-45.9-10.66zm.47 18.7c13.13.05 27.4 3.81 41.24 10.64l.04-.07a79.34 79.34 0 0111.68 14.98H82.92l10.57 14.78c10.61 14.83 19.8 32 21.1 42.03.64 5.01-.12 7.16-1.82 8.83-1.7 1.67-6.23 3.88-15.99 3.88-40.59 0-56.88-44.96-41.01-69.06C66.24 46.64 79.58 39.22 95 37.12c2.9-.4 5.86-.58 8.9-.57zm14.6 44.24h46.28c4.28 15.73 3.66 33.07-.54 51.51h-32.72c1.9-5.03 2.27-10.57 1.6-15.77-1.53-11.91-7.4-24.07-14.62-35.74zm101.55 317.1a53.58 53.58 0 0113.37 24.9c3.8 16.75 3.1 31.22-1.76 43.21-4.53 11.18-12.58 19.8-22.3 26h237.2c14.44 0 24.88-5.68 32.2-14.32 7.3-8.64 11.2-20.5 10.7-32.35a47.73 47.73 0 00-2.4-13.18l-69.92-8.2 42.02-20.53c-8.32-3.44-18.64-5.54-31.37-5.54H220.05zm-42.67.5a34.82 34.82 0 00-11.28 1.78c-15.1 5.02-25.33 21.54-20.1 36.59 3.67 10.57 15.34 17.7 25.65 13.93l1.55-.57h43.36c.94-6.36.75-13.88-1.36-23.19-3.71-16.36-20.54-28.48-37.82-28.54z"/>
		</svg>
	);
}

export default Spell;