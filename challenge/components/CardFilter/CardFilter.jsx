import React, { useCallback, useState, useEffect } from 'react';
import {Checkbox} from 'antd';
import {
	REGION_ARDERIAL,
	REGION_NAROOM,
	REGION_CALD,
	REGION_OROTHE,
	REGION_UNDERNEATH,
	REGION_UNIVERSAL,
	TYPE_RELIC,
	TYPE_SPELL,
	TYPE_CREATURE
} from 'moonlands/dist/const';

export const defaultFilter = {
	regions: [
		REGION_ARDERIAL,
		REGION_NAROOM,
		REGION_CALD,
		REGION_OROTHE,
		REGION_UNDERNEATH,
		REGION_UNIVERSAL,
	],
	types: [
		TYPE_RELIC,
		TYPE_SPELL,
		TYPE_CREATURE,
	],
};

export default function CardFilter({onFilterChange, magiMode = false}) {
	const [filter, setFilter] = useState(defaultFilter);

	const toggleRegion = useCallback(region => {
		const hasRegion = filter.regions.includes(region);
		const regions = hasRegion ? filter.regions.filter(r => r !== region) : [...filter.regions, region];
		setFilter({
			...filter,
			regions,
		});
	}, [filter]);
    
	const toggleType = useCallback(type => {
		const hasType = filter.types.includes(type);
		const types = hasType ? filter.types.filter(t => t !== type) : [...filter.types, type];
		setFilter({
			...filter,
			types,
		});
	}, [filter]);
    
	useEffect(() => {
		onFilterChange(filter);
	}, [filter]);

	return (<div>
		<section>
			<h4>Region</h4>
			<Checkbox checked={filter.regions.includes(REGION_ARDERIAL)} onChange={() => toggleRegion(REGION_ARDERIAL)}>Arderial</Checkbox>
			<Checkbox checked={filter.regions.includes(REGION_CALD)} onChange={() => toggleRegion(REGION_CALD)}>Cald</Checkbox>
			<Checkbox checked={filter.regions.includes(REGION_NAROOM)} onChange={() => toggleRegion(REGION_NAROOM)}>Naroom</Checkbox>
			<Checkbox checked={filter.regions.includes(REGION_OROTHE)} onChange={() => toggleRegion(REGION_OROTHE)}>Orothe</Checkbox>
			<Checkbox checked={filter.regions.includes(REGION_UNDERNEATH)} onChange={() => toggleRegion(REGION_UNDERNEATH)}>Underneath</Checkbox>
			<Checkbox checked={filter.regions.includes(REGION_UNIVERSAL)} onChange={() => toggleRegion(REGION_UNIVERSAL)}>Universal</Checkbox>
		</section>
		{!magiMode && <section>
			<h4>Type</h4>
			<Checkbox checked={filter.types.includes(TYPE_CREATURE)} onChange={() => toggleType(TYPE_CREATURE)}>Creature</Checkbox>
			<Checkbox checked={filter.types.includes(TYPE_RELIC)} onChange={() => toggleType(TYPE_RELIC)}>Relic</Checkbox>
			<Checkbox checked={filter.types.includes(TYPE_SPELL)} onChange={() => toggleType(TYPE_SPELL)}>Spell</Checkbox>
		</section>}
	</div>);
}