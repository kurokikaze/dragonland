import * as React from 'react'

export default function Add({size = 200, color = '#000'}) {
	return (
		<svg t="1612118658923" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill={color} width={size} height={size}>
			<path d="M832 1024H192c-106.048 0-192-86.016-192-192V192a192 192 0 0 1 192-192h640a192 192 0 0 1 192 192v640c0 105.984-85.952 192-192 192z m64-832a64 64 0 0 0-64-64H192a64 64 0 0 0-64 64v640c0 35.392 28.608 64 64 64h640c35.392 0 64-28.608 64-64V192z m-192 384h-128v128c0 35.392-28.608 64-64 64s-64-28.608-64-64v-128h-128a64 64 0 1 1 0-128h128v-128a64 64 0 1 1 128 0v128h128a64 64 0 1 1 0 128z" />
		</svg>
	);
}
