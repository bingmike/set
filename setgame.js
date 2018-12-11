/*****************************************************************************\
setgame.js
By Mike Jordan <bingmike@gmail.com>

Javascript implementation of the card game SET.

February 2018 - December 2018
******************************************************************************
TODO 

FEATURE better splash screen, icons

FEATURE stats should include lifetime versions, junior versions, Hints received, Best 3-Set time (the dream)

BUG Sarah says no more cards ("gameover.svg") should say no more SETS

TRY how would the selector look if we changed it's bg to a gradient. Perhaps radial, but maybe not.

TRY to see if this works on an iPhone. I have my doubts about transitions

*****************************************************************************/

var SetGame = function( targetId ){
	const VERSION = "20181210.1925";
	const TITLE = "Solitaire v" + VERSION;
	const IMAGEPATH = "imgs/";
	const REDXIMG =  IMAGEPATH + "x.svg";
	const BADDEAL = false;
	const REDXFADE = 400; // was 800 for the longest time
	const SELECTEDBG = "#FFFF70";

	var JUNIORDECK = null;
	var cookie = getCookie("optJunior");
	JUNIORDECK = (cookie == "true");

	var INFINITEDECK = null;
	cookie = getCookie("optInfinite");
	INFINITEDECK = (cookie == "true");
	if( cookie == "" ) INFINITEDECK = true;

	var DISPLAYDETAILS = null;
	cookie = getCookie( "optVerbose" );
	DISPLAYDETAILS = ( cookie == "true" );

	var HINTS = null;
	cookie = getCookie( "optHints" );
	HINTS = (cookie == "true");
	if( cookie == "" ) HINTS = true;

	var deck = null;
	var cardsInPlay = null;

	var cardWidth = null;
	var cardHeight = null;
	var selectedCards = [];
	var ignoreInputFlag = true;
	var carddivs = [];

	var hintTimer = null;
	var HINTINTERVAL = 30000;

	var startTime = null;
	var endTime = null;
	var startPause = null;
	var endPause = null;
	var totalTime = null;

	var displayFade = null;

	var numSetsFound = 0;
	var bestTime = Number.POSITIVE_INFINITY;
	
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

	// Disable right click!
	// SERIOUSLY! When children play this game they right click ALL THE TIME. THIS IS BETTER.
	document.addEventListener('contextmenu', event => event.preventDefault());
	// document.addEventListener('dragstart', event => event.preventDefault());
	
	document.addEventListener('touchmove', event => event.preventDefault());

	// Set the favicon
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
			var r = document.getElementById("redx"+item);
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
			im.ondblclick = null;
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
			var ibg = document.getElementById("img"+item+"bg");
			ibg.style.fill = "#fff";
		});
	};

	var setWasFound = function() {
		if( INFINITEDECK ) {
			deck.shuffle();
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
			updateDisplay();
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

		console.log( cardsInPlay.getSetCount() + " set" + ( ( cardsInPlay.getSetCount() > 1 ) ? "s" : "" ) + " available" );
		ignoreInputFlag = false;
	};

	var removeSet = function( callback ) {
		forEach( selectedCards, function( item, i ) {
			var im = document.getElementById( "img" + item );
			// im.classList.remove("duck");
			//im.classList.add("go");
			im.classList.add("go");
		});
		setTimeout( function() {
			forEach( selectedCards, function( item, i ) {
				var im = document.getElementById( "img" + item );
				// im.classList.remove("go");
				im.classList.remove("go");
			});
			callback();
		}, 195 ); // this must jibe with the timing of the css exit-animation class style in set.css
	};

	var incrementCounter = function() {
		clearTimeout( displayFade );
		numSetsFound++;
		var s = document.getElementById( "statsSetsFound" );
		s.innerHTML = numSetsFound;
			endTime = Date.now();
			var timeDiff = ( endTime - startTime );
			timeDiff /= 1000;
			var seconds;
			if( timeDiff < 5 ) {
				seconds = Math.round(  100 * timeDiff) / 100;
			}
			else {
				seconds = Math.round(  10 * timeDiff) / 10;
			}
			if( seconds < bestTime ) {
				bestTime = seconds;
				var s = document.getElementById( "statsBestTime" );
				s.innerHTML = bestTime + " seconds"
			}
			var avgTime = ( endTime - totalTime ) / ( 1000 * numSetsFound );
			avgTime = Math.round( 10 * avgTime ) / 10;
			document.getElementById( "statsAverageTime" ).innerHTML = avgTime + " seconds";

			var info = "<span class=\"animated fadeOut\">Set #" + numSetsFound + "<br>" + seconds + " seconds";
			info += "<br><br><span style=\"font-size:16px;\">Best time: " + bestTime + " seconds<br>";
			info += "Average time: " + avgTime + " seconds<br>";
			info += "<span id=\"setsAvailable\"></span><br>";
			info += "</span></span>";
			var display = document.getElementById("numSetsDisplay");
			startTime = Date.now();
			if( DISPLAYDETAILS ) {
				display.innerHTML = info;
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
		// START ACCEPTING CLICKS HERE: Better to do it when removeSet is done and when showError is done
	};

	var newGame = function() {
		if( INFINITEDECK ) {
			numSetsFound = 0;
			bestTime = Number.POSITIVE_INFINITY;
			startTime = Date.now();
			totalTime = startTime;
		}
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

		// preloadNextThree();
		ignoreInputFlag = false;
		resetHintTimer();
		console.log( cardsInPlay.getSetCount() + " set" + ( ( cardsInPlay.getSetCount() > 1 ) ? "s" : "" ) + " available" );
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
		im.style.zIndex = 2;
		im.style["-moz-transform"] = "translateX(-50%) translateY(-50%)";
		im.style["-webkit-transform"] = "translateX(-50%) translateY(-50%)";
		im.style["transform"] = "translateX(-50%) translateY(-50%)";
		im.onclick = function( e ) {
			var d = document.getElementById("gameover");
			d.parentNode.removeChild( d );	
			ignoreInputFlag = false;
			newGame();
			onResize();
				var evt = e ? e:window.event;
				evt.stopPropagation();
		};
		im.ondblclick = im.onclick;
		document.getElementById("stage").appendChild( im );
	};
	
	var checkForGameOver = function() {
		if( ! cardsInPlay.hasSet() && deck.cardCount() == 0 ) {
			ignoreInputFlag = true;
			setTimeout( gameOverDialog, 700 );
		}
	};

	var getHint = function() {
		Array.prototype.diff = function(a) {
		    return this.filter(function(i) {return a.indexOf(i) < 0;});
		}; // now [1,2,3].diff( [2] ) = [1,3], but we have strings in selectedcards

		// get a set of indices that would make a set
		var c = cardsInPlay.getSet();

		// subtract the indices in selectedcards (Don't hint a card that is already selected)
		forEach( selectedCards, function( item, i ) {
			c = c.diff( [ parseInt( item ) ] );	
		});
		// return the first one, not a random one.
		return c[0];
	};

	var hintOff = function( el ) {
		el.classList.remove( "shake" );
		el.style.zIndex = 1;
	};

	var hintOn = function( el ) {
		el.classList.add( "shake" );
		el.style.zIndex = 3;
	};

	var resetHintTimer = function() {
		clearInterval( hintTimer );
		hintTimer = setInterval( function() {
			if( HINTS && selectedCards.length == 0 ) {
				var hint = getHint();
				var el = document.getElementById( "img" + hint );
				el = el.parentNode;
				// apply the pulse animation class and setTimeout to remove the class
				hintOn(el);
				// setTimeout( function(){ hintOff(el); }, 750 );
			}
		}, HINTINTERVAL );
	};

	var cardClick = function(idee) {
		resetHintTimer();
		if( ignoreInputFlag ) {
			return;
		}
		for( var i = 0; i < 21; i++ ) {
			var el = document.getElementById( "img" + i );
			if( el )hintOff( el.parentNode );
		}
		var id = idee.substring(4,idee.length);
		var ix = document.getElementById( "img" + id );
		ix = ix.parentNode; // whoops. fixed it.
		ix.classList.add( "duck" );
		setTimeout( function(){
			ix.classList.remove( "duck" );
		}, 100 );

		if( ! ( id < cardsInPlay.cardCount() ) ) return;
		var i = selectedCards.indexOf( id ); 
		if( -1 == i ) {
			// not selected. select it
			selectedCards.push( id );
			var i = document.getElementById( "img" + id );
			hintOff( i );
			var ibg = document.getElementById( "img" + id + "bg" );
			ibg.style.fill = SELECTEDBG;
			if( selectedCards.length == 3 ) testSelected();
		} else {
			// is selected. deselect it
			selectedCards.splice( i, 1 );
			var ibg = document.getElementById( "img" + id + "bg" );
			ibg.style.fill = "#fff";
		}
	};

	function getWindowHeight() { 
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
		var d = carddivs[i];
		d.innerHTML = "";

		// give it the card
		draw_stuff( d, (cardsInPlay.cards[i]).code, "img" + i );
		var im = document.getElementById( "img" + i );
		im.setAttribute( "draggable", "false" );
		im.classList.add( "entranceAnim" );
	}

	var options = function() {
		var now = Date.now();
		var sec = Math.floor((now - totalTime)/1000);
		var hrs = Math.floor(sec / 3600);
		var min = Math.floor((sec - (hrs * 3600)) / 60);
		var seconds = sec - (hrs * 3600) - (min * 60);
           
		var result = (hrs < 10 ? "0" + hrs : hrs);
		result += ":" + (min < 10 ? "0" + min : min);
		result += ":" + (seconds < 10 ? "0" + seconds : seconds);	
		document.getElementById( "statsTotalTime" ).innerHTML = result;

		document.getElementById( "optJunior" ).checked = JUNIORDECK;
		document.getElementById( "optInfinite" ).checked = INFINITEDECK;
		document.getElementById( "optVerbose" ).checked = DISPLAYDETAILS;
		document.getElementById( "optHints" ).checked = HINTS;

		document.getElementById('myModal').style.display = "block";
		startPause = now;
	};

	function updateDisplay() {
		for( var i = 0; i < 21; i++ ) {
			var d = document.getElementById( "card" + i );
			d.innerHTML = "";
			if( i < cardsInPlay.cardCount() ) {
				draw_stuff( d, (cardsInPlay.cards[i]).code, "img" + i );
				var im = document.getElementById( "img" + i );
				im.setAttribute( "draggable", "false" );
			}
		}
	}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

	
	// Get the modal (Our options/stats/about screen)
	var modal = document.getElementById('myModal');

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		var oldJ = JUNIORDECK;
		var oldI = INFINITEDECK;
		// write checkbox option settings to variables
		var c1 = document.getElementById( "optJunior" );
		JUNIORDECK = c1.checked;
		var c2 = document.getElementById( "optInfinite" );
		INFINITEDECK = c2.checked;
		var c3 = document.getElementById( "optVerbose" );
		DISPLAYDETAILS = c3.checked;
		var c4 = document.getElementById("optHints");
		HINTS = c4.checked;
		// clear any existing hints
		for( var i = 0; i < 21; i++ ) {
			var el = document.getElementById( "img" + i );
			if( el )hintOff( el.parentNode );
		}
		setCookie( "optJunior", JUNIORDECK, 365 );
		setCookie( "optInfinite", INFINITEDECK, 365 );
		setCookie( "optVerbose", DISPLAYDETAILS, 365 );
		setCookie( "optHints", HINTS, 365 );
		
		endPause = Date.now();
		resetHintTimer();
		startTime = startTime + ( endPause - startPause );
		totalTime = totalTime + ( endPause - startPause );
		modal.style.display = "none";
		if( ( JUNIORDECK != oldJ ) || ( oldI != INFINITEDECK ) ) {
			var d = document.getElementById("gameover");
			if( d ) d.parentNode.removeChild( d );	
			ignoreInputFlag = false;
			newGame();
			onResize();
		}
	}

	window.onclick = function(event) {
		if (event.target == modal) {
			document.getElementsByClassName("close")[0].onclick();
		}
	}

	var stage = document.getElementById(targetId);
	stage.style.position = "fixed";
	stage.style.width = "100%";
	stage.style.height = "100%";
	stage.style.zIndex = 0;
	// stage.onclick = function(e) {
	stage.onmousedown = function(e) {
		// Sarah was ALWAYS clicking in between the cards, and getting frustrated at the
		// options dialog popping up and ruining her flow
		var padding = 5;
		var left = parseInt( document.getElementById("card0").style.left ) - padding;
		var right = parseInt( document.getElementById("card2").style.left ) + cardWidth + padding;
		var bottom = parseInt( document.getElementById("card0").style["top"] ) + cardHeight + padding;
		var topx = parseInt( document.getElementById("card" + ( cardsInPlay.cardCount() - 1 ) ).style["top"] ) - padding;
		
		if(( e.x >= left) && (e.x <= right ) && (e.y >= topx) && ( e.y <= bottom ) ) return;
		options();
	};

	var d = document.createElement("div");
	d.id = "numSetsDisplay";
	d.style.position = "absolute";
	d.style.left = 10;
	d.style.top = 10;
	d.style.color = "white";
	d.style.zIndex = 6;
	d.style.textShadow = "2px 2px 2px #000000";
	d.style.fontFamily = "Arial,Helvetica,sans-serif";
	d.style.fontSize = "20px";
	stage.appendChild( d );

	// force this image to always be cached by keeping it in the DOM, hidden
	// Even better would be to generate it here with svg.js assistance
	// Better still to do it with native js code.
	var i = document.createElement( "img" );
	// i.setAttribute("src", REDXIMG);
	i.src =REDXIMG;
	i.style.display = "none";
	stage.appendChild( i );

	for( var i = 0; i < 7; i++ ) {
		for( var j = 0; j < 3; j++ ) {
			var d = document.createElement( "div" );
			d.id = "card" + (3*i+j);
			// d.onclick = function(e) {
			d.onmousedown = function(e) {
				cardClick(this.id);
				var evt = e ? e:window.event;
				evt.stopPropagation();
			};
			d.ondragstart = d.onclick;
			d.style.position = "absolute"; 
			d.style.zIndex = "2";
			stage.appendChild( d );
			carddivs.push( d );
		}
	}
	numSetsFound = 0;
	bestTime = Number.POSITIVE_INFINITY;
	startTime = Date.now();
	totalTime = startTime;
	newGame();
	onResize();
	stage.style.zIndex = 0;
};

