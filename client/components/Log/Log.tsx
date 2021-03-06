/* global window */
import React, {useEffect, useRef} from 'react';
import cn from 'classnames';
import {connect} from 'react-redux';
import {
	LOG_ENTRY_PLAY,
	LOG_ENTRY_DRAW,
	LOG_ENTRY_CHOOSES_STARTING_CARDS,
	LOG_ENTRY_POWER_ACTIVATION,
	LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY,
	LOG_ENTRY_RELIC_DISCARDED_FROM_PLAY,
	LOG_ENTRY_TARGETING,
	LOG_ENTRY_NUMBER_CHOICE,
	LOG_ENTRY_ATTACK,
	LOG_ENTRY_CREATURE_ENERGY_LOSS,
	LOG_ENTRY_MAGI_ENERGY_LOSS,
	LOG_ENTRY_CREATURE_ENERGY_GAIN,
	LOG_ENTRY_MAGI_ENERGY_GAIN,
	LOG_ENTRY_MAGI_DEFEATED,	
} from 'moonlands/src/const';
import { LogEntryType } from 'moonlands/src/types';

import './style.css';

const mapEntryToText = (entry: LogEntryType) => {
	switch (entry.type) {
		case LOG_ENTRY_PLAY:
			return `Player ${entry.player} plays ${entry.card}`;
		case LOG_ENTRY_DRAW:
			return `Player ${entry.player} draws a card`;
		case LOG_ENTRY_CHOOSES_STARTING_CARDS:
			return `Player ${entry.player} chooses starting cards`;
		case LOG_ENTRY_POWER_ACTIVATION:
			return `Power "${entry.name}" of ${entry.card} is activated by player ${entry.player}`;
		case LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY:
			return `${entry.card} is discarded from play`;
		case LOG_ENTRY_RELIC_DISCARDED_FROM_PLAY:
			return `Relic ${entry.card} is discarded from play`;
		case LOG_ENTRY_TARGETING:
			return `${entry.card} is chosen as a target`;
		case LOG_ENTRY_CREATURE_ENERGY_LOSS:
			return `${entry.card} loses ${entry.amount} energy`;
		case LOG_ENTRY_MAGI_ENERGY_LOSS:
			return `Magi ${entry.card} loses ${entry.amount} energy`;
		case LOG_ENTRY_CREATURE_ENERGY_GAIN:
			return `${entry.card} gains ${entry.amount} energy`;
		case LOG_ENTRY_MAGI_ENERGY_GAIN:
			return `Magi ${entry.card} gains ${entry.amount} energy`;
		case LOG_ENTRY_ATTACK:
			return `${entry.source} attacks ${entry.target}`;
		case LOG_ENTRY_MAGI_DEFEATED:
			return `Magi ${entry.card} is defeated`;
		case LOG_ENTRY_NUMBER_CHOICE:
			return `Player ${entry.player} chooses number ${entry.number}`;
	}
};

type LogEntryProps = {
	entry: LogEntryType;
}
// @ts-ignore
const LogEntry = ({entry}: LogEntryProps) => <div className={cn('logEntry', {'ours': ('player' in entry && entry.player === window.playerId), 'theirs': ('player' in entry && entry.player !== window.playerId)})}>{mapEntryToText(entry)}</div>;

const Log = ({entries = []}) => {
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const listElement = listRef.current;
		if (listElement && listElement.children.length) {
			listElement.children[listElement.children.length - 1].scrollIntoView(false);
		}
		setTimeout(() => {
			if (listElement) {
				[].forEach.call(listElement.children, (child: HTMLElement) => {
					if (!child.classList.contains('show')) { 
						child.classList.add('show');
					}
				});
			}
		}, 10);
	}, [entries]);

	return <div className='actionLog' ref={listRef}>{entries.map((entry, i) => <LogEntry key={i} entry={entry} />)}</div>;
};

type AppState = {
	log: LogEntryType[];
}

const mapStateToProps = (state: AppState) => ({
	entries: state.log,
});

const enhance = connect(mapStateToProps);

export {Log as Base};

export default enhance(Log);
