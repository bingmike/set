const RED = "#EE0000";
const GREEN = "#1CA000";
const PURPLE = "#8400A0";
const DIAMOND = "M150 26 L190 100 150 174 110 100 z";
const OVAL = "M 114,55 C 124.75,17.75 173,17.50 184,55 184,55 184,143 184,143 176.75,182 122,182 114,143 114,143 114,55 114,55 Z";
const SQUIGGLE = "M 114.67,44.33 C 114.52,34.53 127.63,32.65 133.06,31.70 138.50,30.75 161.62,33.62 172.07,42.80 179.23,49.53 182.28,58.26 181.26,69.38 180.25,80.50 173.54,93.15 171.00,105.44 168.03,116.79 168.47,129.46 174.84,139.63 178.18,145.91 184.75,151.75 185.64,158.04 186.53,164.34 176.35,168.72 170.02,170.31 156.71,173.50 142.76,167.52 133.85,157.58 122.74,145.63 118.76,128.02 122.77,112.31 125.41,99.88 131.34,87.75 129.98,74.77 127.89,63.26 114.82,54.13 114.67,44.33 Z";
const stripeWidth = 2.8;

const xlinkns = "http://www.w3.org/1999/xlink"
const svgns = "http://www.w3.org/2000/svg";

var uniqueId = 1000;

/* draws a card inside the element 'where'. the card is based on the string 'what'. it is given the id 'id' */

function draw_stuff( where, what, id ) {
	var strokeWidth = null; // each fill style gets its own
	var color = null;
	var shading = null;

	// TRANSLATE COLOR
	var c = what.substr(2,1);
	if( c == "r" ) {
		color = RED;
	}
	else if( c == "g" ) {
		color = GREEN;
	}
	else if( c == "p" ) {
		color = PURPLE;
	}

	var svg = document.createElementNS(svgns, "svg");
	svg.setAttribute('width', '100%');
	svg.setAttribute('height', '100%');
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", xlinkns);
	svg.setAttribute('viewBox','0 0 300 200');
	if (typeof id !== 'undefined') {
		svg.setAttribute("id",id);
	}
	var defs = document.createElementNS(svgns, "defs");
	svg.appendChild(defs);
	
	// DRAW CARD BACKGROUND
	var background = document.createElementNS(svgns, "rect");
	background.setAttribute('width', '300');
	background.setAttribute('height', '200');
	background.setAttribute('rx', '15');
	background.setAttribute('ry', '15');
	background.setAttribute('fill', '#fff');
	background.setAttribute('stroke', 'grey');
	background.setAttribute('stroke-width', '0.75%');
	background.setAttribute("id",id+"bg");
	svg.appendChild(background);

	// TRANSLATE SHADING
	var s = what.substr(1,1);
	if( s == "o" ) {
		shading = "none";
		strokeWidth = 4.7;
	}
	else if( s == "s" ) {
		shading = color;
		strokeWidth = 0;
	}
	else if( s == "t" ) {
		var pattern = document.createElementNS(svgns, "pattern");
		pattern.setAttribute("id","stripes" + uniqueId );
		pattern.setAttribute("width",stripeWidth);
		pattern.setAttribute("height",stripeWidth*2.0);
		pattern.setAttribute("patternUnits","userSpaceOnUse");
		var rect = document.createElementNS(svgns, "rect");
		rect.setAttribute("width",stripeWidth);
		rect.setAttribute("height",stripeWidth);
		rect.setAttribute("fill",color);
		pattern.appendChild(rect);
		defs.appendChild(pattern);
		shading = "url(#stripes" + uniqueId + ")";
		strokeWidth = 4.2;
	}

	// TRANSLATE SHAPE
	var s2 = what.substr(3,1);
	var path = null;
	var offset = null;
	var pathid = null;
	if( s2 == "d" ) { // Diamonds
		path = DIAMOND;
		offset = 88;
		pathid = "diamond";
	}
	else if( s2 == "o" ) { // Ovals
		path = OVAL;
		offset = 84;
		pathid = "oval";
	}
	else if( s2 == "s" ) { // Squiggle
		path = SQUIGGLE;
		offset = 76;
		pathid = "squiggle";
	}
	var poly = document.createElementNS(svgns, "path");
	poly.setAttribute("id", pathid + uniqueId );
	poly.setAttribute("stroke-linecap", "round" );
	poly.setAttribute("stroke-width", strokeWidth );
	poly.setAttribute("fill", shading );
	poly.setAttribute("stroke", color );
	poly.setAttribute("d", path );
	defs.appendChild(poly);

	// DRAW THE SHAPE(S)
	var num = what.substr(0,1);
	if( num == 1 || num == 3 ) {
		var use = document.createElementNS(svgns, "use");
		use.setAttributeNS(xlinkns, "xlink:href", "#" + pathid + uniqueId );
		svg.appendChild(use);
	}
	if(num == 2 || num == 3 ) {
		if( num == 2 ) offset /= 2.0;
		for( var i = -1; i <= 1; i += 2 ) {
			var use1 = document.createElementNS(svgns, "use");
			use1.setAttributeNS(xlinkns, "xlink:href", "#" + pathid + uniqueId );
			use1.setAttribute("x",i*offset);
			svg.appendChild(use1);
		}
	}
	if( typeof where === "string" )	document.getElementById(where).appendChild(svg); // if where is a string identifier
	else where.appendChild(svg); // if where is the actual element
	uniqueId++;
}

