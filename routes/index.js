var express = require('express');
var router = express.Router();

const caldDeck = `Grega
Magam
Sinder
3 Fire Chogo
3 Fire Grag
3 Arbolit
3 Magma Hyren
3 Kelthet
3 Lava Aq
3 Lava Arboll
3 Diobor
3 Drakan
3 Thermal Blast
3 Flame Geyser
3 Lava Balamant
2 Magma Armor
2 Fire Flow`;

/* eslint-disable-next-line no-unused-vars */
const naroomDeck = `Pruitt
Poad
Yaki
3 Leaf Hyren
3 Weebo
3 Arboll
3 Giant Carillion
3 Timber Hyren
3 Balamant
3 Grow
2 Giant Parathin
3 Furok
3 Carillion
3 Rudwot
3 Stagadan
3 Robe of Vines
2 Sea Barl`;

const arderialDeck = `Lasada
Jaela
Ora
3 Pharan
3 Alaban
3 Ayebaw
3 Cyclone Vashp
3 Shockwave
3 Shooting Star
3 Storm Cloud
3 Thunder Hyren
3 Xyx
3 Xyx Elder
3 Updraft
3 Typhoon
1 Syphon Stone`;

const deckHeight = 18;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { 
		title: 'Dragonlands',
		deckOne: caldDeck,
		deckTwo: arderialDeck,
		deckHeight,
	});
});

router.get('/start', function(req, res) {
	res.json({result: 'OK'});
}); 

module.exports = router;
