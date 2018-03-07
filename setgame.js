/*****************************************************************************\
setgame.js
By Mike Jordan <bingmike@gmail.com>

Javascript implementation of the card game SET.

February-March 2018
******************************************************************************
TODO 

CRITICAL dealer gives up control too slowly after replacing cards. Is this updateDisplay() ?
FEATURE All cards need to be replaced. SVG would be ideal.
ANNOYING the first deal isn't cached, very noticeable on new game
	maybe the first deal could utilize an onLoad trigger
FEATURE animate card movements: deals and set burns
FEATURE discreet options?

Lower Priority

FEATURE it might be faster to show red x if it was already under the card with a low zIndex that you could toggle
FEATURE after a minute of inactivity, provide a hint. 
FEATURE splash screen? Can define one in the manifest i think, just learned about PWA
DREAM A function that generates SVG images on the fly . Maybe a php app that returns svg files? 
DREAM 3d cards with images on both sides, shadows

*****************************************************************************/

var SetGame = function( targetId ){
	const VERSION = "0.8";
	const TITLE = "SET: The Family Game of Visual Perception, v" + VERSION;
	const IMAGEPATH = "imgs/";
	// const IMAGEPATH = "svg/"; // SVGs are begun. They look awesome.
	const HILITEIMG = IMAGEPATH + "hilite2.gif";
	const REDXIMG =  IMAGEPATH + "x.svg";
	const JUNIORDECK = false;
	const BADDEAL = false;
	const DEALSPEED = 240; // "slow"; //100;
	const REDXFADE = 800;
	const DIALOGTITLE = '<span style="font-family:Arial">SET</span>'; // DIALOGTITLE = '';

	var deck = null;
	var cardsInPlay = null;

	var cardWidth = null;
	var cardHeight = null;
	var selectedCards = [];
	var ignoreInputFlag = true;
	var carddivs = [];

	top.document.title = TITLE;
	window.addEventListener("resize", onResize);

	// This prevents the selection of elements in most browsers
	document.body.style["-webkit-touch-callout"] = "none";
	document.body.style["-webkit-user-select"] = "none";
	document.body.style["-khtml-user-select"] = "none";
	document.body.style["-moz-user-select"] = "none";
	document.body.style["-moz-user-select"] = "-moz-none";
	document.body.style["-ms-user-select"] = "none";
	document.body.style["user-select"] = "none";;

	// This sets the favicon
	var link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = IMAGEPATH + 'squiggle-icon.png';
	document.getElementsByTagName('head')[0].appendChild(link);

	function onResize() {
		var leftadj = 0;
		var topGap = 0;
		var numrows = cardsInPlay.cardCount() / 3;
		cardWidth = getWindowWidth() * 15/49;
		cardHeight = cardWidth * 2 / 3;
		topGap = getWindowHeight() - ( cardHeight * ( numrows + ((numrows+1)/10) ) );
		leftadj = ( getWindowWidth() -  ( ( 3 * cardWidth ) + ( 4 * (cardWidth/15) ) ) )/2;
		if( cardHeight * (numrows+(numrows+1)*.1 ) > getWindowHeight() ) {
			cardHeight = getWindowHeight() / ( numrows + ((numrows+1)/10) );
			cardWidth = 1.5 * cardHeight;
			leftadj = ( getWindowWidth() - ( (49/15)  * cardWidth  ) ) / 2;
			topGap = getWindowHeight() - ( cardHeight * ( numrows + ((numrows+1)/10) ) );
		}
		
		for( var i = 0; i < 7; i++ ) {
			for( var j = 0; j < 3; j++ ) {
				var x = j * ( cardWidth * (16/15) ) + (cardWidth/15) + leftadj;
				var y = getWindowHeight() - ( ( i + 1 ) * ( cardHeight * 1.1 ) ) - ( topGap / 2 );
				var d = carddivs[3*i+j];
				d.style.width = cardWidth;
				d.style.height = cardHeight;
				d.style["top"] = y;
				d.style.left = x;
			}
		}
		for( var i = 0; i < cardsInPlay.cardCount(); i++ ) {
			var im = document.getElementById( "img"+i );
			if( im ) {
				im.setAttribute( "width", cardWidth );
				im.setAttribute( "height", cardHeight );
			}
		}
		forEach( selectedCards, function( item, i ) {
			var h = document.getElementById("hilite"+item);
			var r = document.getElementById("redx"+item);
			if( h ) { // they might be redxs or flying away or something
				h.setAttribute( "width", cardWidth );
				h.setAttribute( "height", cardHeight );
			}
			if( r ) {
				r.setAttribute( "width", cardWidth );
				r.setAttribute( "height", cardHeight );
			}
		});
	}

	var showError = function() {
		forEach( selectedCards, function( item, i ) {
			var im = document.createElement( "img" );
			var d = carddivs[item];
			im.setAttribute( "src", REDXIMG );
			im.setAttribute( "draggable", "false" );
			im.setAttribute( "id", "redx"+item );
			im.setAttribute( "width", cardWidth );
			im.setAttribute( "height", cardHeight );
			im.style.position = "absolute";
			im.style.left = 0;
			im.style["top"] = 0;
			d.appendChild( im );
		});
		clearSelection();
		ignoreInputFlag = true;
		setTimeout( function() {
			forEach( selectedCards, function( item, i ) {
				var fadeOutInterval;
				var elem = document.getElementById( "redx" + item );
				clearInterval(fadeOutInterval);
				elem.fadeOut = function(timing) {
					var newValue = 1;
					elem.style.opacity = 1;
					fadeOutInterval = setInterval(function() {
						if (newValue > 0) {
							newValue -= 0.03;
							elem.style.opacity = newValue;
						} else if (newValue < 0.1) {
							elem.style.opacity = 0;
							elem.style.display = "none";
							clearInterval(fadeOutInterval);
							elem.parentNode.removeChild( elem );
							selectedCards = [];
							ignoreInputFlag = false;
						}
					}, timing);
				};
				elem.fadeOut(5);
			});
		}, REDXFADE );
	};

	var clearSelection = function() {
		forEach( selectedCards, function( item, i ) {
			var d = document.getElementById( "hilite" + item );
			d.parentNode.removeChild( d );
		});
	};

	var setWasFound = function() {
		if( deck.cardCount() > 0 && cardsInPlay.cards.length < 15 ) {
			// replace those 3 cards in place
			forEach( selectedCards, function(item,i) {
				cardsInPlay.addCard( deck.deal(), item );
				updateCard( item );
			});
		}
		else {
			// just collapse the cards down
			forEach( selectedCards, function( item, i ) {
				cardsInPlay.cards[item] = null;
			});			
			cardsInPlay.collapse();
			updateDisplay(); // only place we are calling this function
			onResize();
		}
		selectedCards = [];
		while( deck.cardCount() > 0 && ! cardsInPlay.hasSet() ) {
			for( var i = 0; i < 3; i++ ) {
				cardsInPlay.addCard( deck.deal() );
				updateCard( cardsInPlay.cardCount() - 1);
			}
			onResize();
		}
		checkForGameOver();
		if( deck.cardCount() > 0 ) {
			preloadNextThree();
		}
	};

	var removeSet = function( callback ) {
		forEach( selectedCards, function( item, i ) {
			var im = document.getElementById( "img" + item );
			im.classList.add("go");
		});
		setTimeout( function() {
			forEach( selectedCards, function( item, i ) {
				var im = document.getElementById( "img" + item );
				im.classList.remove("go");
			});
			callback();
		}, 330 ); // this must jibe with the timing of the "go" css class style in index.htm
	};

	var testSelected = function() {
		
		if(isSet(cardsInPlay.cards[selectedCards[0]], cardsInPlay.cards[selectedCards[1]], cardsInPlay.cards[selectedCards[2]])){
			clearSelection();
			removeSet( setWasFound );
		}
		else {
			showError();
		}
	};

	var preloadNextThree = function() {
		// delete the previous cached images
		var cache = document.getElementById("cache");
		cache.innerHTML = "";
		for( var i = 0; i < 3; i++ ) {
			var im = document.createElement( "img" );   
			im.setAttribute( "src", IMAGEPATH + (deck.cards[i]).imgsrc );
			im.style.display = "none";
			document.getElementById("cache").appendChild( im );
		}
	};

	var newGame = function() {
		deck = new SetStack();
		if( BADDEAL ) {
			deck.makebaddeck();
		}
		else {
			if( JUNIORDECK ) {
				deck.makejrdeck();
			}
			else {
				deck.makedeck();
			}
			deck.shuffle();
		}
		cardsInPlay = new SetStack();
		onResize();
		for( var i = 0; i < 12;i++ ) {
			var c = deck.deal();
			cardsInPlay.addCard( c );
			updateCard(i);
		}
		while( deck.cardCount() > 0 && ! cardsInPlay.hasSet() ) {
			for( var i = 0; i < 3; i++ ) {
				cardsInPlay.addCard( deck.deal() );
				updateCard( cardsInPlay.cardCount() - 1);
			}
			onResize();
		}
		preloadNextThree();
		ignoreInputFlag = false;
	};

	var gameOverDialog = function() {
		var im = document.createElement( "img" );
		im.setAttribute("src",IMAGEPATH + "/gameover.svg");
		im.setAttribute("id","gameover");
		im.setAttribute("width", 1.5 * cardWidth );
		im.setAttribute("height", 1.5 * cardHeight );
		im.style.position = "absolute";
		im.style["top"] = "50%";
		im.style.left = "50%";
		im.style.zIndex = "5";
		im.style["-moz-transform"] = "translateX(-50%) translateY(-50%)";
		im.style["-webkit-transform"] = "translateX(-50%) translateY(-50%)";
		im.style["transform"] = "translateX(-50%) translateY(-50%)";
		im.onclick = function() {
			var d = document.getElementById("gameover");
			d.parentNode.removeChild( d );	
			ignoreInputFlag = false;
			newGame();
			onResize();
		};
		document.body.appendChild( im );
	};
	
	var checkForGameOver = function() {
		if( ! cardsInPlay.hasSet() && deck.cardCount() == 0 ) {
			ignoreInputFlag = true;
			setTimeout( gameOverDialog, 900 );
		}
	};

	var cardClick = function(idee) {
		if( ignoreInputFlag ) {
			return;
		}
		var id = idee.substring(4,idee.length);
		if( ! ( id < cardsInPlay.cardCount() ) ) return;
		var i = selectedCards.indexOf( id ); 
		if( -1 == i ) {
			// not selected. select it
			selectedCards.push( id );
			var d = carddivs[id];
			var im = document.createElement( "img" );
			im.setAttribute( "src", HILITEIMG );
			im.setAttribute( "draggable", "false" );
			im.setAttribute( "id", "hilite"+id );
			im.setAttribute( "width", cardWidth );
			im.setAttribute( "height", cardHeight );
			im.style.position = "absolute";
			im.style.left = 0;
			im.style["top"] = 0;
			d.appendChild( im );
			if( selectedCards.length == 3 ) testSelected();
		} else {
			// is selected. deselect it
			selectedCards.splice( i, 1 );
			var d = document.getElementById( "hilite" + id );
			d.parentNode.removeChild( d );
		}
	};

	function getWindowHeight() { // we really want the height of the parent container "targetId"
		var w = window,
		    d = document,
		    e = d.documentElement,
		    g = d.getElementsByTagName('body')[0];
		    return (  w.innerHeight|| e.clientHeight|| g.clientHeight );
	}

	function getWindowWidth() {
		var w = window,
		    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0];
	    return ( w.innerWidth || e.clientWidth || g.clientWidth);
	}
	
	function updateCard( i ) {
		// animation: first we need to save carddiv current location
		var d = carddivs[i];
		d.innerHTML = "";
		var saveTop = d.style["top"];
		var saveLeft = d.style.left;

		// give it the card
		var im = document.createElement( "img" );
		im.setAttribute( "src", IMAGEPATH + (cardsInPlay.cards[i]).imgsrc );
		im.setAttribute( "id", "img" + i);
		im.setAttribute( "draggable", "false" );
		im.style.position = "absolute";
		im.setAttribute( "width", cardWidth );
		im.setAttribute( "height", cardHeight );
		im.setAttribute( "class", "bounceIn" );
		d.appendChild( im );

		// animate the carddiv
	}

	function updateDisplay() {
		for( var i = 0; i < 21; i++ ) {
			var d = document.getElementById( "card" + i );
			if( i < cardsInPlay.cardCount() ) {
				var im = document.createElement( "img" );
				im.setAttribute( "src", IMAGEPATH + (cardsInPlay.cards[i]).imgsrc );
				im.setAttribute( "id", "img" + i);
				im.setAttribute( "draggable", "false" );
				im.setAttribute( "width", cardWidth );
				im.setAttribute( "height", cardHeight );
				d.innerHTML = "";
				d.appendChild( im );
			}
			else {
				d.innerHTML = "";
			}
		}
	}
	
	var stage = document.getElementById(targetId);
	var felt = document.createElement("div");
	felt.id = "felt";
	stage.appendChild(felt);

	// reserve an area for caching images
	var d = document.createElement( "div" );
	d.setAttribute("id","cache");
	d.style.display = "none";
	felt.appendChild( d );
	
	// force these 2 images to always be cached by keeping them in the DOM, hidden
	var i = document.createElement( "img" );
	i.setAttribute("src", HILITEIMG);
	i.style.display = "none";
	felt.appendChild( i );
	i = document.createElement( "img" );
	i.setAttribute("src", REDXIMG);
	i.style.display = "none";
	felt.appendChild( i );

	for( var i = 0; i < 7; i++ ) {
		for( var j = 0; j < 3; j++ ) {
			var d = document.createElement( "div" );
			d.id = "card" + (3*i+j);
			d.onmousedown = function() {
				cardClick(this.id);
			};
			d.style.position = "absolute"; 
			d.style.zIndex = "2";
			felt.appendChild( d );
			carddivs.push( d );
		}
	}
	newGame();
	onResize();
};

