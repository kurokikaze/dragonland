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
3 Cave Hyren
2 Magma Armor
2 Fire Flow`;

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
3 Syphon Stone
3 Carillion
3 Rudwot
3 Stagadan
3 Robe of Vines
2 Sea Barl`;

const deckHeight = 18;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { 
		title: 'Dragonlands',
		deckOne: caldDeck,
		deckTwo: naroomDeck,
		deckHeight,
	});
});

router.get('/start', function(req, res) {
	res.json({result: 'OK'});
}); 

module.exports = router;
