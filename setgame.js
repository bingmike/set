/*****************************************************************************\
setgame.js
By Mike Jordan <bingmike@gmail.com>

Javascript implementation of the card game SET.

February-November 2018
******************************************************************************
TODO 

FEATURE discreet options: jrdeck, hintdelay, infinite play, etc?
	I'm thinking a gear half the size of card, always at 10,10 or so (padding, padding)
	
FEATURE better splash screen, icons, cards
FEATURE highlighter looks like crap on mobile

*****************************************************************************/

var SetGame = function( targetId ){
	const VERSION = "0.91";
	const TITLE = "Solitaire SET, v" + VERSION;
	const IMAGEPATH = "imgs/";
	const HILITEIMG = IMAGEPATH + "hilite2.gif";
	const REDXIMG =  IMAGEPATH + "x.svg";
	const BADDEAL = false;
	const REDXFADE = 800;

	// This should be user-configurable
	const JUNIORDECK = false;
	const INFINITEDECK = true;
	const DISPLAYDETAILS = true;

	var deck = null;
	var cardsInPlay = null;

	var cardWidth = null;
	var cardHeight = null;
	var selectedCards = [];
	var ignoreInputFlag = true;
	var carddivs = [];

	var hintTimer = null;
	var HINTINTERVAL = 60000;

	var startTime = null;
	var endTime = null;

	var displayFade = null;

	var numSetsFound = 0;

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
	document.body.style["-webkit-text-size-adjust"] = "none";

	// Disable right click! For the kids that don't know how to mouse thanks to Steve Jobs.
	// SERIOUSLY! When children play this game they right click ALL THE TIME. THIS IS BETTER.
	document.addEventListener('contextmenu', event => event.preventDefault());
	document.addEventListener('dragstart', event => event.preventDefault());
	document.addEventListener('touchmove', event => event.preventDefault());

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
		var im = document.getElementById("optbutton");
		if( im ) {
			im.width = cardHeight / 2;
			im.height = cardHeight / 2;
			im.style["top"] = cardHeight / 10;
			im.style.left = cardHeight / 10;
		}
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
			d.style.visibility = "hidden";
		});
	};

	var setWasFound = function() {
		if( INFINITEDECK ) {
			deck.shuffle(); // if you shuffle, then add, the set you just found won't appear in your next 3 cards
			//deck.addCard( cardsInPlay.cards[ selectedCards[0] ] );
			//deck.addCard( cardsInPlay.cards[ selectedCards[1] ] );
			//deck.addCard( cardsInPlay.cards[ selectedCards[2] ] );
			forEach( selectedCards, function( item, i ) {
				deck.addCard( cardsInPlay.cards[ item ]);
			});
		}

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
		ignoreInputFlag = false;
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

	var incrementCounter = function() {
		clearTimeout( displayFade );
		numSetsFound++;
		if( DISPLAYDETAILS ) {
			endTime = new Date();
			var timeDiff = endTime - startTime;
			timeDiff /= 1000;
			var seconds;
			if( timeDiff < 5 ) {
				seconds = Math.round(  100 * timeDiff) / 100;
			}
			else {
				seconds = Math.round(  10 * timeDiff) / 10;
			}
			var display = document.getElementById("numSetsDisplay");
			display.innerHTML = "<span class=\"animated fadeOut\">Set #" + numSetsFound + "<br>" + seconds + " seconds" + "</span>";
			startTime = new Date();
			display.style.opacity = 1;
			displayFade = setTimeout( function(){
				var display = document.getElementById("numSetsDisplay");
				display.innerHTML = "";
			},4000 );
		}
	};

	var testSelected = function() {
		// STOP ACCEPTING CLICKS HERE
		ignoreInputFlag = true;
		if(isSet(cardsInPlay.cards[selectedCards[0]], cardsInPlay.cards[selectedCards[1]], cardsInPlay.cards[selectedCards[2]])){
			incrementCounter();
			clearSelection();
			removeSet( setWasFound );
		}
		else {
			showError();
		}
		// START ACCEPTING CLICKS HERE
		// ignoreInputFlag = false;
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
		resetHintTimer();
	};

	var gameOverDialog = function() {
		var im = document.createElement( "img" );
		im.setAttribute("src",IMAGEPATH + "gameover.svg");
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
		im.ondblclick = im.onclick;
		document.body.appendChild( im );
		numSetsFound = 0;
	};
	
	var checkForGameOver = function() {
		if( ! cardsInPlay.hasSet() && deck.cardCount() == 0 ) {
			ignoreInputFlag = true;
			setTimeout( gameOverDialog, 900 );
		}
	};

	var getHint = function() {
		Array.prototype.diff = function(a) {
		    return this.filter(function(i) {return a.indexOf(i) < 0;});
		}; // now [1,2,3].diff( [2] ) = [1,3], but we have strings in selectedcards

		// get a set of indices that would make a set
		var c = cardsInPlay.getSet();

		// subtract the indices in selectedcards
		forEach( selectedCards, function( item, i ) {
			c = c.diff( [ parseInt( item ) ] );	
		});
		// return the first one, not a random one.
		return c[0];
	};

	var hintOff = function( el ) {
		el.classList.remove( "pulse" );
	};

	var hintOn = function( el ) {
		el.classList.add( "pulse" );
	};

	var resetHintTimer = function() {
		clearInterval( hintTimer );
		hintTimer = setInterval( function() {
			var hint = getHint();
			// console.log( "HINT! Position " + hint );
			var el = document.getElementById( "img" + hint );
			// apply the pulse animation class and setTimeout to remove the class
			hintOn(el);
			setTimeout( function(){
				hintOff(el);
			}, 903 ); // 3 pulses
		}, HINTINTERVAL );
	};

	var cardClick = function(idee) {
		resetHintTimer();
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
			var im = document.getElementById( "hilite" + id );
			if( im ) {
				im.style.visibility = "visible";
			}
			else {
				im = document.createElement( "img" );
				im.setAttribute( "src", HILITEIMG );
				im.setAttribute( "draggable", "false" );
				im.setAttribute( "id", "hilite"+id );
				im.setAttribute( "width", cardWidth );
				im.setAttribute( "height", cardHeight );
				im.style.position = "absolute";
				im.style.left = 0;
				im.style["top"] = 0;
				d.appendChild( im );
			}
			if( selectedCards.length == 3 ) testSelected();
		} else {
			// is selected. deselect it
			selectedCards.splice( i, 1 );
			var d = document.getElementById( "hilite" + id );
			// d.parentNode.removeChild( d );
			d.style.visibility = "hidden";
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
		setTimeout( function() {
			im.classList.remove( "bounceIn" );
		}, 800 );

		// animate the carddiv
	}

	var options = function() {
		alert( "Display options here." );
	};

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

	// options button
	// var im = document.createElement("img");
	// im.setAttribute("src", IMAGEPATH + "gear.svg");
	// im.setAttribute("id","optbutton");
	// im.style.position = "absolute";
	// im.onclick = function(){
	// 	options();
	// };
	// felt.appendChild( im );

	// numSetsFound Display
	var d1 = document.createElement("div");
	d1.setAttribute("id", "numSetsDisplay" );
	d1.style.position = "absolute";
	d1.style.left = 10;
	d1.style["top"] = 10;
	d1.style.color = "white";
	d1.style.zIndex = "99";
	d1.style.textShadow = "2px 2px 2px #000000";
	d1.style.fontFamily = "Arial,Helvetica,sans-serif";
	d1.style.fontSize = "20px";
	felt.appendChild( d1 );

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

			var im = document.createElement( "img" );
			im.setAttribute( "src", HILITEIMG );
			im.setAttribute( "draggable", "false" );
			im.setAttribute( "id", "hilite"+(3*i+j) );
			im.style.position = "absolute";
			im.style.visibility = "hidden";
			im.style.left = 0;
			im.style["top"] = 0;
			d.appendChild( im );
		}
	}
	newGame();
	onResize();
	startTime = new Date();
};

