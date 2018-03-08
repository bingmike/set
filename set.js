/*****************************************************************************\
set.js
By Mike Jordan <bingmike@gmail.com>

Javascript objects for the card game SET.

February 2018
******************************************************************************/

function SetCard( number, shading, color, shape ) {
	this.number	= number;
	this.shading	= shading;
	this.color	= color;
	this.shape	= shape;
	this.toString	= setCardToString
	this.getSet	= setCardGetSet
	this.imgsrc	= this.number + this.shading + this.color + this.shape + ".png";
}

function SetStack() {
	this.cards		= new Array();
	this.makedeck		= setStackMakeDeck;
	this.makebaddeck	= setStackMakeBadDeck;
	this.makejrdeck		= setStackMakeJrDeck;
	this.shuffle		= setStackShuffle;
	this.deal		= setStackDeal;
	this.addCard		= setStackAddCard;
	this.cardCount		= setStackCardCount;
	this.hasSet		= setStackHasSet;
	this.getSetCount	= setStackGetSetCount;
	this.draw		= setStackDraw;
	this.hasCard		= setStackHasCard;
	this.toString		= setStackToString;
	this.replace		= setStackReplace;
	this.collapse		= setStackCollapse;
	this.getSet		= setStackGetSet;
}

function setStackMakeBadDeck() { // This deal requires 2 extra rows (18 cards total) to find the 1st set. For testing.
	this.addCard( new SetCard("3","s","g","s") ); this.addCard( new SetCard("3","s","p","s") ); this.addCard( new SetCard("2","o","p","d") );
	this.addCard( new SetCard("1","t","g","o") ); this.addCard( new SetCard("2","s","p","s") ); this.addCard( new SetCard("3","s","g","d") );
	this.addCard( new SetCard("1","s","g","d") ); this.addCard( new SetCard("1","t","g","d") ); this.addCard( new SetCard("1","o","p","o") );
	this.addCard( new SetCard("2","s","r","s") ); this.addCard( new SetCard("3","t","p","o") ); this.addCard( new SetCard("3","o","g","d") );
	this.addCard( new SetCard("3","t","r","s") ); this.addCard( new SetCard("1","s","p","d") ); this.addCard( new SetCard("1","o","r","o") );
	this.addCard( new SetCard("3","o","g","o") ); this.addCard( new SetCard("2","s","p","d") ); this.addCard( new SetCard("1","o","p","s") );
	this.addCard( new SetCard("2","s","r","o") ); this.addCard( new SetCard("1","t","r","o") ); this.addCard( new SetCard("3","o","p","s") );
	this.addCard( new SetCard("1","s","p","o") ); this.addCard( new SetCard("2","s","g","s") ); this.addCard( new SetCard("3","o","r","s") );
	this.addCard( new SetCard("2","o","g","d") ); this.addCard( new SetCard("1","s","p","s") ); this.addCard( new SetCard("1","s","g","s") );
	this.addCard( new SetCard("1","s","r","o") ); this.addCard( new SetCard("1","t","g","s") ); this.addCard( new SetCard("3","t","g","s") );
	this.addCard( new SetCard("1","s","g","o") ); this.addCard( new SetCard("2","t","p","o") ); this.addCard( new SetCard("2","s","p","o") );
	this.addCard( new SetCard("3","s","r","s") ); this.addCard( new SetCard("3","s","g","o") ); this.addCard( new SetCard("2","t","p","s") );
	this.addCard( new SetCard("1","s","r","d") ); this.addCard( new SetCard("1","t","p","o") ); this.addCard( new SetCard("1","o","g","o") );
	this.addCard( new SetCard("3","o","r","o") ); this.addCard( new SetCard("1","t","p","s") ); this.addCard( new SetCard("3","o","g","s") );
	this.addCard( new SetCard("1","s","r","s") ); this.addCard( new SetCard("2","t","r","d") ); this.addCard( new SetCard("3","s","p","o") );
	this.addCard( new SetCard("3","t","g","d") ); this.addCard( new SetCard("2","t","g","o") ); this.addCard( new SetCard("3","s","r","o") );
	this.addCard( new SetCard("2","o","r","o") ); this.addCard( new SetCard("2","s","g","d") ); this.addCard( new SetCard("3","o","r","d") );
	this.addCard( new SetCard("3","s","r","d") ); this.addCard( new SetCard("3","t","r","o") ); this.addCard( new SetCard("2","o","p","o") );
	this.addCard( new SetCard("1","o","g","s") ); this.addCard( new SetCard("2","s","g","o") ); this.addCard( new SetCard("2","s","r","d") );
	this.addCard( new SetCard("3","s","p","d") ); this.addCard( new SetCard("2","t","r","o") ); this.addCard( new SetCard("2","o","g","o") );
	this.addCard( new SetCard("3","o","p","d") ); this.addCard( new SetCard("1","o","r","d") ); this.addCard( new SetCard("3","t","p","d") );
	this.addCard( new SetCard("2","o","g","s") ); this.addCard( new SetCard("1","o","p","d") ); this.addCard( new SetCard("2","t","p","d") );
	this.addCard( new SetCard("1","o","r","s") ); this.addCard( new SetCard("1","t","p","d") ); this.addCard( new SetCard("1","t","r","s") );
	this.addCard( new SetCard("1","o","g","d") ); this.addCard( new SetCard("2","t","g","d") ); this.addCard( new SetCard("3","t","r","d") );
	this.addCard( new SetCard("2","o","r","d") ); this.addCard( new SetCard("2","t","r","s") ); this.addCard( new SetCard("1","t","r","d") );
	this.addCard( new SetCard("3","o","p","o") ); this.addCard( new SetCard("3","t","g","o") ); this.addCard( new SetCard("2","o","r","s") );
	this.addCard( new SetCard("2","o","p","s") ); this.addCard( new SetCard("3","t","p","s") ); this.addCard( new SetCard("2","t","g","s") );
}

function setStackCollapse() { // if the deck is empty, we can't replace the set we just removed, so do this function
	for( var i = 0; i < this.cards.length; i++ ) {
		if (this.cards[i] == null ) {         
			this.cards.splice(i, 1);
			i--;
		}
	}
}

function setStackReplace( index, newcard ) { // we do need to be able to insert a card into a particular position
	if( this.cards.length > index ) this.cards[ index ] = newcard;
}

function forEach(array, fn) {
  for (var i = 0; i < array.length; i++)
    fn(array[i], i);
}

function setStackToString() {
	forEach( this.cards, function( index, value ) {
		if( value ) str += index + " " + value.toString() + "\n";
		else str += "(empty)\n";
	});
}

function setCardGetSet( c ) {
	var number1 = 0;
	var shading1 = 0;
	var color1 = 0;
	var shape1 = 0;
	if( this.number == c.number ) number1 = this.number;
	else {
		if(( this.number == "1" && c.number == "2" ) || ( this.number == "2" && c.number == "1" )) number1 = "3";
		if(( this.number == "1" && c.number == "3" ) || ( this.number == "3" && c.number == "1" )) number1 = "2";
		if(( this.number == "2" && c.number == "3" ) || ( this.number == "3" && c.number == "2" )) number1 = "1";
	}
	if( this.shading == c.shading ) shading1 = this.shading;
	else {
		if(( this.shading == "t" && c.shading == "o" ) || ( this.shading == "o" && c.shading == "t" )) shading1 = "s";
		if(( this.shading == "s" && c.shading == "o" ) || ( this.shading == "o" && c.shading == "s" )) shading1 = "t";
		if(( this.shading == "s" && c.shading == "t" ) || ( this.shading == "t" && c.shading == "s" )) shading1 = "o";
	}
	if( this.color == c.color ) color1 = this.color;
	else {
		if(( this.color == "p" && c.color == "r" ) || (this.color == "r" && c.color == "p" )) color1 = "g";
		if(( this.color == "g" && c.color == "r" ) || (this.color == "r" && c.color == "g" )) color1 = "p";
		if(( this.color == "g" && c.color == "p" ) || (this.color == "p" && c.color == "g" )) color1 = "r";
	}
	if( this.shape == c.shape ) shape1 = this.shape;
	else {
		if(( this.shape == "o" && c.shape == "s" ) || ( this.shape == "s" && c.shape == "o" )) shape1 = "d";
		if(( this.shape == "d" && c.shape == "s" ) || ( this.shape == "s" && c.shape == "d" )) shape1 = "o";
		if(( this.shape == "d" && c.shape == "o" ) || ( this.shape == "o" && c.shape == "d" )) shape1 = "s";
	}
	var card = new SetCard( number1, shading1, color1, shape1 );
	return card;
}

function setCardToString() {
	var number, shading, color, shape;	
	switch( this.number ) {
		case "1" :
			number = "One";
			break;
		case "2" :
			number = "Two";
			break;
		case "3" :
			number = "Three";
			break;
		default :
			number = null;
	}
	switch( this.shading ) {
		case "s" :
			shading = "Solid";
			break;
		case "t" :
			shading = "Striped";
			break;
		case "o" :
			shading = "Open";
			break;
		default :
			shading = null;
	}
	switch( this.color ) {
		case "g" :
			color = "Green";
			break;
		case "p" :
			color = "Purple";
			break;
		case "r" :
			color = "Red";
			break;
		default :
			color = null;
	}
	switch( this.shape ) {
		case "d" :
			shape = "Diamond";
			break;
		case "o" :
			shape = "Oval";
			break;
		case "s" :
			shape = "Squiggle";
			break;
		default :
			shape = null;
	}
	if( number == null || shading == null || color == null || shape == null ) return "";
	return number + " " + shading + " " + color + " " + shape + ((this.number!="1")?"s":"");
}

function setStackDraw( n ) {
	var card;
	if( n >= 0 && n < this.cards.length ) {
		card = this.cards[n];
		this.cards.splice( n, 1 );
	}
	else
		card = null;

	return card;
}

function setStackMakeJrDeck() {
	var numbers = new Array( "1", "2", "3" );
	var colors = new Array( "g", "p", "r" );
	var shapes = new Array( "d", "o", "s" );
	
	var x, y, z;
	
	for( x = 0; x < 3; x++ )
		for( y = 0; y < 3; y++ )
			for( z = 0; z < 3; z++ )
				this.cards[ 9 * x + 3 * y + z ] = new SetCard( numbers[x], "s", colors[y], shapes[z] );
}

function setStackMakeDeck() {
	var numbers = new Array( "1", "2", "3" );
	var shadings = new Array( "s", "t", "o" );
	var colors = new Array( "g", "p", "r" );
	var shapes = new Array( "d", "o", "s" );
	
	var w, x, y, z;
	
	for( w = 0; w < 3; w++ )
		for( x = 0; x < 3; x++ )
			for( y = 0; y < 3; y++ )
				for( z = 0; z < 3; z++ )
					this.cards[ 27 * w + 9 * x + 3 * y + z ] = new SetCard( numbers[w], shadings[x], colors[y], shapes[z] );
}

function setStackShuffle(){ // Fisher-Yates shuffle
	var m = this.cards.length, t, i;
	while( m ) {
		i = Math.floor( Math.random() * m-- );
		t = this.cards[m];
		this.cards[m] = this.cards[i];
		this.cards[i] = t;
	}
}

function setStackDeal(){
	if( this.cards.length > 0 )
		return this.cards.shift();
	else
		return null;
}

function setStackAddCard( card, index ){
	if( index != null ) {
		this.cards[ index ] = card;
	}
	else this.cards.push( card );
}

function setStackCardCount(){
	return this.cards.length;
}

function setStackHasSet(){
	if( this.cards.length > 20 ) return true;

	for( var i = 0; i < this.cards.length; i++ ) {
		for( j = i + 1; j < this.cards.length; j++ ) {
			for( var z = 0; z < this.cards.length; z++ ) {
				if( z != i && z != j )
				if( isSet(this.cards[i], this.cards[j], this.cards[z]) ) {
					console.log( i,j,z); // always have a cheat in the Javascript console
					return true;
				}
			}
		}
	}
	return false;
}

function setStackGetSet() {
	for( var i = 0; i < this.cards.length; i++ ) {
		for( j = i + 1; j < this.cards.length; j++ ) {
			for( var z = 0; z < this.cards.length; z++ ) {
				if( z != i && z != j )
				if( isSet(this.cards[i], this.cards[j], this.cards[z]) ) {
					return new Array( i,j,z);
				}
			}
		}
	}
}

function setStackGetSetCount(){
	var settotal = 0;
	for( var i = 0; i < this.cards.length; i++ ) {
		for( var j = i+1; j < this.cards.length; j++ ) {
			var c = this.cards[i].getSet( this.cards[j] );
			if( this.hasCard( c ) ) {
				settotal++;
			}
		}
	}	
	return settotal / 3;
}

function isSet( a,b,c ) {
	if( ( a.number == b.number && b.number == c.number && a.number == c.number  ) || ( a.number != b.number && a.number != c.number && b.number != c.number ) ) {
		if( ( a.shading == b.shading && b.shading == c.shading && a.shading == c.shading ) || ( a.shading != b.shading && a.shading != c.shading && c.shading != b.shading ) ) {
			if( ( a.color == b.color && b.color == c.color && a.color == c.color ) || ( a.color != b.color && a.color != c.color && c.color != b.color ) ) {
				if( ( a.shape == b.shape && b.shape == c.shape && a.shape == c.shape ) || ( a.shape != b.shape && a.shape != c.shape && b.shape != c.shape ) ) {
					return true;
				}
				else return false;
			}
			else return false;
		}
		else return false;
	}
	else return false;
}

function setStackHasCard( card ) {
	for( var i = 0; i < this.cards.length; i++ ) {
		if( this.cards[i].number == card.number &&
		    this.cards[i].shading == card.shading &&
		    this.cards[i].color == card.color &&
		    this.cards[i].shape == card.shape )
			return true;
	}
	return false;
}

