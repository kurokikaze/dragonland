/* global window */
import React, {useEffect, useRef} from 'react';
import cn from 'classnames';
import {connect} from 'react-redux';

import {mapEntryToText} from './utils.js';
import './style.css';


const LogEntry = ({entry}) => <div className={cn('logEntry', {'ours': entry.player === window.playerId, 'theirs': entry.player !== window.playerId})}>{mapEntryToText(entry)}</div>;

const Log = ({entries = []}) => {
	const listRef = useRef(null);

	useEffect(() => {
		const listElement = listRef.current;
		if (listElement && listElement.children.length) {
			listElement.children[listElement.children.length - 1].scrollIntoView(false);
		}
		setTimeout(() => {
			[].forEach.call(listElement.children, child => {
				if (!child.classList.contains('show')) { 
					child.classList.add('show');
				}
			});
		}, 10);
	}, [entries]);

	return <div className='actionLog' ref={listRef}>{entries.map((entry, i) => <LogEntry key={i} entry={entry} />)}</div>;
};

const mapStateToProps = (state) => ({
	entries: state.log,
});

const enhance = connect(mapStateToProps);

export {Log as Base};

export default enhance(Log);
