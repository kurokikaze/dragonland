/* global fetch */
import { useEffect, useState, useCallback } from 'react';
import {useDispatch} from 'react-redux';

import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import WarningOutlined from '@ant-design/icons/es/icons/WarningOutlined';
import { cards } from 'moonlands/dist/cards';
import cn from 'classnames';
import { TYPE_MAGI } from 'moonlands/dist/const';
import { saveDeck, saveNewDeck } from '../../actions';
import Add from '../icons/Add.jsx';
import CardFilter, { defaultFilter } from '../CardFilter/CardFilter.jsx';
import DeckView from '../DeckView/DeckView.tsx';
import { camelCase } from '../../../common/utils.js';

import './style.css';

const DeckEditor = ({deckId}) => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [savingNew, setSavingNew] = useState(false);
	const [deck, setDeck] = useState(null);
	const [filter, setFilter] = useState(defaultFilter);
	const [search, setSearch] = useState('');

	const [magiEditor, setMagiEditor] = useState(null);

	const dispatch = useDispatch();

	useEffect(() => {
		fetch(`/api/deck/${deckId}`)
			.then(data => data.json())
			.then(deck=> {
				setDeck(deck);
				setLoading(false);
			});
	}, [deckId]);

	const handleSave = useCallback(() => {
		setSaving(true);
		fetch(`/api/deck/${deckId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(deck),
		}).then(() => {
			dispatch(saveDeck(deck));
			setSaving(false);
		}).catch(() => {
			setSaving(false);
		});
	}, [deck]);

	const handleSaveAsNew = useCallback(() => {
		setSavingNew(true);
		fetch('/api/deck/new', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(deck),
		}).then(data => data.json())
			.then(newDeck => {
				dispatch(saveNewDeck(newDeck));
				setSavingNew(false);
			}).catch(() => {
				setSavingNew(false);
			});
	}, [deck]);

	const removeFromDeck = useCallback(name => {
		const id = deck.cards.lastIndexOf(name);
		if (id > -1) {
			setDeck(oldDeck => ({
				...oldDeck,
				cards: oldDeck.cards.filter((card, i) => i !== id),
			}));
		}
	}, [deck]);

	const addToDeck = useCallback(card => {
		setDeck(oldDeck => ({
			...oldDeck,
			cards: [...oldDeck.cards, card],
		}));
	}, []);

	const setMagi = useCallback(card => {
		const cards = [...deck.cards];
		cards[magiEditor] = card;
		setDeck({
			...deck,
			cards,
		});
		setMagiEditor(null);
	}, [deck, magiEditor]);

	const setName = name => setDeck(oldDeck => ({
		...oldDeck,
		name,
	}));

	const filterFunction = useCallback(
		card => (search === '' || card.name.toLowerCase().includes(search.toLowerCase())) && filter.regions.includes(card.region) && filter.types.includes(card.type),
		[filter, search]
	);
	
	const magiFilterFunction = useCallback(
		card => (search === '' || card.name.toLowerCase().includes(search.toLowerCase())) && filter.regions.includes(card.region) && card.type === TYPE_MAGI,
		[filter, search]
	);

	const canAdd = useCallback(card => {
		return deck.cards.filter(c => c === card).length < 3 && deck.cards.length < 43;
	}, [deck]);

	const canSelectMagi = useCallback(card => {
		return (deck.cards[0] !== card && deck.cards[1] !== card && deck.cards[2] !== card) || deck.cards[magiEditor] === card;
	}, [deck, magiEditor]);

	const isDeckReadyForSaving = deck && (deck.name !== '' && deck.cards.length === 43);

	return (<div>
		{loading ? <Spin size='large' /> :
			<>
				<Row>
					<Col span={24}>
						<label>
							Deck name
							<Input className='deckName' onChange={e => setName(e.target.value)} value={deck.name} style={{ maxWidth: 500 }} />
						</label></Col>
				</Row>
				<Row>
					<Col span={16}>
						<div>
							<section>
								<CardFilter onFilterChange={setFilter} magiMode={!(magiEditor === null)} />
								<div className='cardSearch'><Input placeholder='Card Search' onChange={e => setSearch(e.target.value)} /></div>
							</section>
							{magiEditor === null && <div className='allCardsContainer'>
								<div className='allCards'>
									{cards.filter(filterFunction).map((card) => <div key={card.name} className='cardSlot'>
										<div className={cn('cardImage', {'canAdd': canAdd(card.name)})}>
											<img src={`/images/cards/${camelCase(card.name)}.jpg`} alt={card.name} />
										</div>
										{canAdd(card.name) && <div onClick={() => addToDeck(card.name)} className='addIcon'><Add size={50} color={'green'} /></div>}
									</div>)}
								</div>
							</div>}
							{!(magiEditor === null) && <div className='allCardsContainer'>
								<div className='allCards'>
									{cards.filter(magiFilterFunction).map((card) => <div key={card.name} className='cardSlot'>
										<div className={cn('cardImage', {'canAdd': canSelectMagi(card.name)})}>
											<img src={`/images/cards/${camelCase(card.name)}.jpg`} alt={card.name} />
										</div>
										{canSelectMagi(card.name) && <div onClick={() => setMagi(card.name)} className='addIcon'><Add size={50} color={'green'} /></div>}
									</div>)}
								</div>
							</div>}
						</div>
					</Col>
					<Col span={8}>
						<div className='deckHolder'>
							<DeckView ourCards={deck.cards} addToDeck={addToDeck} removeFromDeck={removeFromDeck} onMagiEditor={setMagiEditor} magiEditor={magiEditor} />
						</div>
						{!isDeckReadyForSaving && <div>
							{!deck || !deck.name && <div><WarningOutlined style={{ color: 'red', paddingRight: 10 }} />Deck should have a name</div>}
							{!deck || deck.cards.length !== 43 && <div><WarningOutlined style={{ color: 'red', paddingRight: 10 }} />Deck should have 43 cards (40 cards + 3 Magi). This deck has {deck.cards.length}.</div>}
						</div>}
						<div>
							<Space>
								<Button disabled={!isDeckReadyForSaving} loading={saving} type="primary" onClick={() => handleSave()}>Save deck</Button>
								<Button disabled={!isDeckReadyForSaving} loading={savingNew} type="default" onClick={() => handleSaveAsNew()}>Save as new deck</Button>
							</Space>
						</div>
					</Col>
				</Row>
			</>
		}
	</div>);
};

export default DeckEditor;
