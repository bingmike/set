/***************************************************************************************************
This is a crack at implementing Set in web app form.
Mike Jordan <bingmike@gmail.com>
***************************************************************************************************/

let deck = [];
let hand = [];
let selected = [];
let startTime = null;
let startPause = null;
let gameOverLoop = null;
let uniqueId = 1000;
let forceInit = false;
let hintTimer = null;
let hintCandidate = null;
let freezeInput = false;
let stats = JSON.parse(localStorage.getItem('stats')) || {
    setsFound: 0,
    setsFoundJr: 0,
    bestTime: Number.MAX_SAFE_INTEGER,
    bestTimeJr: Number.MAX_SAFE_INTEGER,
    timeElapsed: 0,
    best3: Number.MAX_SAFE_INTEGER,
    best5: Number.MAX_SAFE_INTEGER,
    best10: Number.MAX_SAFE_INTEGER,
    best27: Number.MAX_SAFE_INTEGER,
    best100: Number.MAX_SAFE_INTEGER,
    times: [],
    hints: 0,
};

let prefs = JSON.parse(localStorage.getItem('prefs')) || {
    juniordeck: false, /* Changing this must trigger a new game */
    infinity: true,  /* Changing this must trigger a new game */
    hints: false,
    displayNumSetsAvailable: false,
    hintdelay: 30
};

const RED = "#EE0000";
const GREEN = "#1CA000";
const PURPLE = "#8400A0";
const COLORS = [ RED, GREEN, PURPLE ];

const DIAMOND = "M150 26 L190 100 150 174 110 100 z";
const OVAL = `M114,55 C124.75,17.75 173,17.50
              184,55 184,55 184,143 184,143
              176.75,182 122,182 114,143 114,143
              114,55 114,55 Z`;
const SQUIGGLE = `M 115,38 C 121.71,26.23 138.45,26.94 151,31 163.55,35.06 175.16,45.82 180,62 184.84,78.18
                  168.52,102.82 170,120 171.48,137.18 191.71,150.23 185,162 178.29,173.77 161.55,173.06
                  149,169 136.45,164.94 124.84,154.18 120,138 115.16,121.82 131.48,97.18 130,80 128.52,62.82
                  108.29,49.77 115,38 115,38 115,38 115,38 Z`;

const stripeWidth = 2.8;

const svgns = "http://www.w3.org/2000/svg";
const xlinkns = "http://www.w3.org/1999/xlink"

const container = document.querySelector(".container");
const preferences = document.querySelector(".preferences");
const closeButton = preferences.querySelector(".close");
const delayval = document.getElementById("delayval");
const hintdelay = document.getElementById("hintdelay");
const nukeButton = document.getElementById("nukestats");
const hintsbox = document.getElementById("hints");
const options = preferences.querySelectorAll(".option");
const delaywrapper = preferences.querySelector("#delaywrapper");

hintsbox.addEventListener( "change", () => {
    delaywrapper.style.display = ((hintsbox.checked)?("block"):("none"));
});

window.addEventListener( "resize", sizeDivs );
window.addEventListener( "load", initialize );
window.addEventListener( "mousedown", winclick );
window.addEventListener( "touchstart", winclick );
window.addEventListener('contextmenu', e => e.preventDefault());

function onReaderLoad( e ) {
    stats = JSON.parse( e.target.result );
    localStorage.setItem('stats', JSON.stringify(stats));
    console.log( "IMPORTED!" );
}

function importStats( e ) {
    let reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText( event.target.files[0] );
}

document.getElementById( 'fileinput' ).addEventListener( 'change', importStats );

window.addEventListener( "keydown", e => {
    switch( e.keyCode ) {
        case 69: // e - Export stats to a json file
            let blob = new Blob([ JSON.stringify(stats) ], { type: "text/plain" } );
            let dlink = document.createElement("a");
            dlink.download = "set-stats-date.json";
            dlink.href = window.URL.createObjectURL( blob );
            dlink.onclick = function( e ) {
                let that = this;
                setTimeout( function() {
                    window.URL.revokeObjectURL( that.href );
                }, 1500 );
            }
            dlink.click();
            dlink.remove();
            break;
        case 70: // f - toggle Fullscreen
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            break;
        case 73: // i - Import stats from a json file
            document.getElementById("file").click();
            // and do nothing with it!
            break;
        case 111: // there are two slashes if there's a numpad
        case 191: // slash / brings up search
            e.preventDefault();
            break;
        default:
            console.log( e.keyCode );
    }
});


closeButton.addEventListener( "click", toggleOptions );
// nukeButton.addEventListener( "click", nukeButtonFunction );
hintdelay.addEventListener( "mousemove", updateDisplayedRange );
hintdelay.addEventListener( "touchmove", updateDisplayedRange );
hintdelay.addEventListener( "click", updateDisplayedRange );


function resetHintTimer() {
    clearTimeout( hintTimer );
    hintTimer = setTimeout( applyHint, prefs.hintdelay * 1000 );
}

function cancelHintTimer() {
    clearTimeout( hintTimer );
}

function applyHint() {
    if( ! prefs.hints ) return;
    if( selected.length ) return;
    stats.hints++;
    localStorage.setItem('stats', JSON.stringify(stats));
    hintCandidate.classList.add("hint");
}

function clearHintAnim(e) {
    e.target.classList.remove("hint");
}

function clearHint() {
    const hinted = container.querySelector(".hint");
    if(hinted)hinted.classList.remove("hint");
}

function addRow(){
    [ 0, 1, 2 ].forEach( () => {
        const d = document.createElement("div");
        d.classList.add("item");
        container.appendChild( d );
    });
    sizeDivs();
}

function sizeDivs(){
    const items = container.querySelectorAll(".item");
    let NUMROWS = parseInt( items.length / 3 );

    // Never grow big cards.
    if( NUMROWS < 4 ) NUMROWS = 4;

    let pad = 16;
    let gap = parseInt(getComputedStyle(document.body).getPropertyValue("--gap"));
    let cardHeight = ( window.innerHeight - ( ( NUMROWS + 1 ) * gap ) ) / NUMROWS;
    let cardWidth = cardHeight * 1.5;
    if( cardWidth * 3 + gap * 4 + pad >= window.innerWidth ) {
        cardWidth = ( window.innerWidth - pad  - ( 4 * gap ) ) / 3;
        cardHeight = cardWidth * 2 / 3;
    }
    document.documentElement.style.setProperty( "--gap", ( cardHeight / 9 ) + "px" );
    items.forEach( item => {
        item.style.width = cardWidth + "px";
        item.style.height = cardHeight + "px";
    });
}

function resetDeck(){
    deck = [];
    let symbols = [ 1, 2, 3 ];
    let shadesymbols = [ ...symbols ];
    if( prefs.juniordeck ) shadesymbols = [ 2 ];
    for( let number of symbols )
    for( let shading of shadesymbols )
    for( let color of symbols )
    for( let shape of symbols ) {
        const card = "" + number + shading + color + shape;
        deck.push( card );
    }
    deck = shuffle( deck );
}

function isSet( c1, c2, c3 ){
    for( let i = 0; i < 4; i++ ) {
        // if the digit sum of every column is 3, 6, or 9, it's a set
        // I'd feel more clever if I could do this in an array reduce function
        if( ( c1[i] + c2[i] + c3[i] ) % 3 ) return false;
    }
    return true;
}

function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}


function generateCard(icode) {
    let strokeWidth = null; // each fill style gets its own
    let shading = null;

    // TRANSLATE COLOR
    let color = COLORS[ icode[2] - 1 ];

    let svg = document.createElementNS(svgns, "svg");
    // svg.setAttribute('width', '100%');
    // svg.setAttribute('height', '100%');
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", xlinkns);
    svg.setAttribute('viewBox','0 0 300 200');
    svg.setAttribute("id","svg"+icode);
    svg.classList.add("enter");

    svg.addEventListener( "animationend", (e) => {
        svg.classList.remove("enter");
    });

    function cardClickHandler(e) {
        if( freezeInput ) return;
        resetHintTimer();
        clearHint();
        toggleSelect( icode );
        e.stopPropagation(); // THIS STOPS IT! But only if the Window level event is ALSO mousedown
    }

    function cardTouchHandler(e) {
        cardClickHandler( e );
        e.preventDefault();
    }

    function cardSlideHandler( e ) {
        if( freezeInput ) return;
        // get current location of finger/pointer
        let curX = e.touches[0].clientX;
        let curY = e.touches[0].clientY;
        // check each svg (card)
        let svgs = document.getElementsByTagName( "svg" );
        for( let i = 0 ; i < svgs.length; i++ ) {
            let y1 = svgs[i].getBoundingClientRect().top;
            let y2 = svgs[i].getBoundingClientRect().bottom;
            let x1 = svgs[i].getBoundingClientRect().left;
            let x2 = svgs[i].getBoundingClientRect().right;
            // if the pointer is within the card area, select the card
            if( curX >= x1 && curX <= x2 && curY >= y1 && curY <= y2 ) {
                let id = svgs[i].id.slice( -4 );
                if( ! selected.includes( id ) ) {
                    selected.push(id);
                    svgs[i].classList.add("selected");
                    if( selected.length == 3 ) testSelection();
                }
            }
        }
    }

    svg.addEventListener( "mousedown", cardClickHandler );
    svg.addEventListener( "touchstart", cardTouchHandler );
    svg.addEventListener( "touchmove", cardSlideHandler );

    let defs = document.createElementNS(svgns, "defs");
    svg.appendChild(defs);

    // DRAW CARD BACKGROUND
    let background = document.createElementNS(svgns, "rect");
    background.setAttribute("id","svg"+icode+"bg");
    background.classList.add("bg");

    // do these 7 lines fix svg on FF? YEP

    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('rx', '15');
    background.setAttribute('ry', '15');
    //background.setAttribute('fill', '#fff');
    background.setAttribute('stroke', 'grey');
    background.setAttribute('stroke-width', '0.75%');

    svg.appendChild(background);

    // TRANSLATE SHADING
    let s = icode[1];
    if( s == "1" ) {
        shading = "none";
        strokeWidth = 4.7;
    }
    else if( s == "2" ) {
        shading = color;
        strokeWidth = 0;
    }
    else {
        let pattern = document.createElementNS(svgns, "pattern");
        pattern.setAttribute("id","stripes" + uniqueId );
        pattern.setAttribute("width",stripeWidth);
        pattern.setAttribute("height",stripeWidth*2.0);
        pattern.setAttribute("patternUnits","userSpaceOnUse");
        let rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("width",stripeWidth);
        rect.setAttribute("height",stripeWidth);
        rect.setAttribute("fill",color);
        pattern.appendChild(rect);
        defs.appendChild(pattern);
        shading = "url(#stripes" + uniqueId + ")";
        strokeWidth = 4.2;
    }

    // TRANSLATE SHAPE
    let s2 = icode[3];
    let path = null;
    let offset = null;
    let pathid = null;
    if( s2 == "1" ) { // Diamonds
        path = DIAMOND;
        offset = 88;
        pathid = "diamond";
    }
    else if( s2 == "2" ) { // Ovals
        path = OVAL;
        offset = 84;
        pathid = "oval";
    }
    else { // Squiggle
        path = SQUIGGLE;
        offset = 74;
        pathid = "squiggle";
    }
    let poly = document.createElementNS(svgns, "path");
    poly.setAttribute("id", pathid + uniqueId );
    poly.setAttribute("stroke-linecap", "round" );
    poly.setAttribute("stroke-width", strokeWidth );
    poly.setAttribute("fill", shading );
    poly.setAttribute("stroke", color );
    poly.setAttribute("d", path );
    defs.appendChild(poly);

    // DRAW THE SHAPE(S)
    let num = parseInt( icode[0] );
    if( num == 1 || num == 3 ) {
        let use = document.createElementNS(svgns, "use");
        use.setAttributeNS(xlinkns, "xlink:href", "#" + pathid + uniqueId );
        svg.appendChild(use);
    }
    if(num > 1 ) {
        if( num == 2 ) offset /= 2.0;
        for( let i = -1; i <= 1; i += 2 ) {
            let use1 = document.createElementNS(svgns, "use");
            use1.setAttributeNS(xlinkns, "xlink:href", "#" + pathid + uniqueId );
            use1.setAttribute("x",i*offset);
            svg.appendChild(use1);
        }
    }
    const target = container.querySelector(".item:empty");
    target.appendChild( svg );
    uniqueId++;
}

function toggleSelect( c ){
    let el = document.getElementById("svg"+c);

    if( selected.includes( c ) ) {
        selected.splice(selected.indexOf(c), 1);
        el.classList.remove("selected");
        // freeze input for 10ms
        freezeInput = true;
        setTimeout( function(){ freezeInput = false; }, 100 );

    }
    else {
        selected.push(c);
        el.classList.add("selected");
        if( selected.length == 3 ) testSelection();
    }
}


function showError() {
    selected.forEach( i => {
        document.getElementById("svg"+i).classList.add("tremble");
    });
    let clearem = [...selected];
    setTimeout(function(){
        clearem.forEach( i => {
            const el = document.getElementById("svg"+i);
            if( el ) el.classList.remove("tremble");
        });
    },300);
    return;
}

function collapseHand(){
    const items = container.querySelectorAll(".item"); // if we filter for empty, we won't know if it was big
    let big = items.length > 12;
    items.forEach( item => ( item.innerHTML == "" ) && item.parentNode.removeChild(item));
    sizeDivs();
}

function removeSet() {
    process_time( Date.now() - startTime );
    startTime = Date.now();
    if( prefs.infinity ) {
        deck = shuffle( deck );
        deck.unshift( ...selected );
    }
    selected.forEach( (i,a) => {
        hand.splice( hand.indexOf(i), 1 );
        let x = document.getElementById("svg"+i)
        x.classList.add("exit");
        if( a == 2 ) /* when the last card is finished animating */
        x.addEventListener( "animationend", function(e){
            selected.forEach( i => {
                let x = document.getElementById("svg"+i)
                x.parentNode.removeChild(x);
            });
            selected = [];
            if( container.querySelectorAll(".item").length > 12 ) {
                collapseHand();
            }
            logic();
            freezeInput = false;
        });
    });
}

function testSelection(){
    freezeInput = true;
    if( isSet( ...selected ) ) {
        removeSet();
    }
    else {
        selected.forEach( i => document.getElementById("svg"+i).classList.remove("selected") );
        showError();
        selected = [];
        //freezeInput = false;
        setTimeout( function(){ freezeInput = false; }, 300 );
    }
}

function gameOver(){

    let dispNSA = document.getElementById("numSetsAvailable");
    if( dispNSA ) dispNSA.innerHTML = "0";

    if( hand.length == 0 ) {
        setTimeout( initialize, 800 );
        return;
    }

    gameOverLoop = setInterval(function(){
        let items = Array.from( container.querySelectorAll(".item") );
        let untrembling = items.filter( item => ! item.classList.contains("tremble"));
        if( untrembling.length > 0 ) {
            if( Math.floor( Math.random() * 3 ) == 0 ) {
                return;
            }
            let x = Math.floor( Math.random() * untrembling.length );
            untrembling[x].classList.add("tremble");
            return;
        }
        let unfallen = items.filter( item => ! item.classList.contains("fall"));
        if( unfallen.length > 0 ) {
            let x = Math.floor( Math.random() * unfallen.length );
            unfallen[x].classList.add("fall");
            return;
        }
        else {
            clearInterval( gameOverLoop );
            setTimeout( initialize, 800 );
        }
    }, 70);
}

function get3cards(){
    [ 0, 1, 2 ].forEach( () => {
        hand.push( deck.pop() );
        generateCard( hand[hand.length-1] );
    });
}

function displayNumSetsAvailable() {
    if( prefs.displayNumSetsAvailable ) {
        // delete any existing display and generate a new one
        let dispNSA = document.getElementById("numSetsAvailable");
        if( dispNSA ) dispNSA.parentNode.removeChild( dispNSA );

        dispNSA = document.createElement("div");
        dispNSA.setAttribute( "id", "numSetsAvailable" );
        dispNSA.innerHTML = setsAvailable();
        container.appendChild( dispNSA );
    }
    else {
        let dispNSA = document.getElementById("numSetsAvailable");
        if( dispNSA ) dispNSA.parentNode.removeChild( dispNSA );
    }
}

function logic(){
    if( deck.length > 0 ) {
        if( hand.length >= 12 ) {
            if( ! setsAvailable() ) {
                addRow();
                get3cards();
                logic();
            }
            // else display num sets available if appropriate
            else displayNumSetsAvailable();
        } else {
            get3cards();
            logic();
        }
    }
    else {
        if( ! setsAvailable() ) {
            gameOver();
        }
        else {
            collapseHand(); // only when we keep going
            // display num sets available if appropriate
            displayNumSetsAvailable();
        }
    }
}

function completeTheSet( c1, c2 ){
    let c3 = "";
    for( let i = 0; i < 4; i++ ) {
        if( c1[i] == c2[i] ) c3+= (c1[i]); // attribute is the same, so copy it
        else c3+= ( 6 - c1[i] - c2[i] ); // attribute differs, so find the complement
    }
    return c3;
}

function setsAvailable() {
    let settotal = 0;
    let lastFound = null;
    for( let i = 0; i < hand.length; i++ ) {
        for( let j = i+1; j < hand.length; j++ ) {
            let c = completeTheSet( hand[i], hand[j] );
            if( hand.includes( c ) ) {
                settotal++;
                lastFound = [ hand[i], hand[j], c ];
            }
        }
    }
    if( lastFound ) {
        hintCandidate = document.getElementById( "svg" + lastFound[0] );
    }
    return settotal / 3;
}

function identifySet( arr ) {
    let nicenames = [];
    arr.forEach( el => {
        let name = el[0];
        if( el[1] == "1" ) name += "o";
         else if( el[1] == "2" ) name += "s";
          else name += "t";
        if( el[2] == "1" ) name += "r";
         else if( el[2] == "2" ) name += "g";
          else name += "p";
        if( el[3] == "1" ) name += "d";
         else if( el[3] == "2" ) name += "o";
          else name += "s";
        nicenames.push(name);
    });
    return nicenames;
}

function process_time( newtime ) {
    if( newtime >= 180000 ) return;
    if( prefs.juniordeck ) {
        if( newtime < stats.bestTimeJr ) stats.bestTimeJr = newtime;
        stats.setsFoundJr++;
        localStorage.setItem('stats', JSON.stringify(stats));
        return;
    }
    // all times processed as milliseconds
    if( newtime < stats.bestTime ) stats.bestTime = newtime;
    stats["timeElapsed"] += newtime;
    stats["setsFound"]++;
    stats.times.push( newtime );
    if( stats.times.length > 100 ) stats.times.shift();
    for( let B of [ 3, 5, 10, 27, 100 ] ) {
        if( stats.times.length >= B ) {
            let sum = 0;
            for( let i = 1; i <= B; i++ ){
                sum += stats.times[ stats.times.length - i ];
            }
            console.assert( sum != null, "Sum equals null here. We were prepared but were hoping it wouldn't." );
            if( sum != null && sum < stats["best" + B] ) {
                stats["best" + B] = sum;
            }
        }
    }
    localStorage.setItem('stats', JSON.stringify(stats));
}

function initialize(){
    gameOverLoop = null;

    forceInit = false;
    hand = [];
    selected = [];
    // clear and show container, hide prefs
    container.innerHTML = "";
    container.style.display = "grid";
    preferences.style.display = "none";
    addRow(); addRow(); addRow(); addRow();
    sizeDivs();
    resetDeck();
    logic();
    startTime = Date.now();
    resetHintTimer();
}

function stats2html() {
    function n(i) {
        if( i == Number.MAX_SAFE_INTEGER ) return "&infin;";
        else return ( ( i / 1000).toFixed(3) + " seconds");
    }

    const statsspan = document.getElementById("statsspan");

    let html = "Sets found: <b>" + numberWithCommas( stats.setsFound ) + "</b><br>";

    html += "Junior Sets found: <b>" + numberWithCommas( stats.setsFoundJr ) + "</b><br>";

    html += "Hints received: <b>" + stats.hints + "</b><br>";

    html += "Best time: <b>" + n(stats.bestTime) + "</b><br>";

    if( stats.times.length )
    html += "Last time: <b>" + n(stats.times[stats.times.length-1]) + "</b><br>";

    if( stats.times.length > 2 )
    html += "Last 3 average: <b>" +  n( ( stats.times[stats.times.length-3] + stats.times[stats.times.length-2] + stats.times[stats.times.length-1] )  / 3) + "</b><br>";

    html += "Best time, Junior: <b>" + n(stats.bestTimeJr) + "</b><br>";

    if( stats.times.length > 2 )
    html += "Best time, 3 set avg: <b>" + n(stats.best3/3) + "</b><br>";

    if( stats.times.length > 4 )
    html += "Best time, 5 set avg: <b>" + n(stats.best5/5) + "</b><br>";

    if( stats.times.length > 9 )
    html += "Best time, 10 set avg: <b>" + n(stats.best10/10) + "</b><br>";

    if( stats.times.length > 26 )
    html += "Best time, 27 set avg: <b>" + n(stats.best27/27) + "</b><br>";

    if( stats.times.length > 99 )
    html += "Best time, 100 set avg: <b>" + n(stats.best100/100) + "</b><br>";

    if( stats.times )
    html += "Time logged: <b>" + beautifyMS(stats.timeElapsed ) + "</b><br>";

    statsspan.innerHTML = html;
}

function toggleOptions( e ) {
    if( gameOverLoop != null ) return;
    if( container.style.display == "none" ){ // Take user BACK TO GAME
        let oj = prefs.juniordeck;
        let oi = prefs.infinity;
        options.forEach( option => {
            prefs[option.dataset.key] = option.checked;
        });
        displayNumSetsAvailable();
        prefs.hintdelay = hintdelay.value;
        localStorage.setItem('prefs', JSON.stringify(prefs));
        resetHintTimer();
        container.style.display = "grid";
        preferences.style.display = "none";
        startTime += ( Date.now() - startPause );
        if( oj != prefs.juniordeck || oi != prefs.infinity ) initialize();
        freezeInput = false;
    }
    else { // Show PREFERENCES
        freezeInput = true;
        clearHint();
        cancelHintTimer();
        options.forEach( option => {
            option.checked = prefs[option.dataset.key];
        });
        delaywrapper.style.display = ((hintsbox.checked)?("block"):("none"));
        hintdelay.value = prefs.hintdelay;
        updateDisplayedRange();
        stats2html();
        preferences.style.display = "block";
        container.style.display = "none";
        startPause = Date.now();
/* I thought this would prevent the "immediate close prefs bug" but it does not.
        if( e ) {
             e.preventDefault();
            e.stopPropigation();
        }
*/
    }
}

function winclick( e ) {
    if( container.style.display == "none" ) {
        return;
    }
    const padding = 30;
    const items = Array.from( container.querySelectorAll(".item") );
    const left = items.reduce( (min,val) => {
        if( val.offsetLeft < min ) min = val.offsetLeft;
        return min;
    }, Number.POSITIVE_INFINITY ) - padding;
    const top = items.reduce( (min,val) => {
        if( val.offsetTop < min ) min = val.offsetTop;
        return min;
    }, Number.POSITIVE_INFINITY ) - padding;
    const bottom = window.innerHeight - top;
    const right = window.innerWidth - left;

    // If the user clicked within [padding] pixels of the hand (cards in play) area, ignore it.
    if( e.touches ) {
        if( ( e.touches[0].clientX >= left) && (e.touches[0].clientX <= right ) && (e.touches[0].clientY >= top) && ( e.touches[0].clientY <= bottom ) ) return;
    }
    else if( ( e.x >= left) && (e.x <= right ) && (e.y >= top) && ( e.y <= bottom ) ) return;

    toggleOptions();
}

function numberWithCommas( x ) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function nukeButtonFunction() {
    stats = {
        setsFound: 0,
        setsFoundJr: 0,
        bestTime: Number.MAX_SAFE_INTEGER,
        bestTimeJr: Number.MAX_SAFE_INTEGER,
        timeElapsed: 0,
        best3: Number.MAX_SAFE_INTEGER,
        best5: Number.MAX_SAFE_INTEGER,
        best10: Number.MAX_SAFE_INTEGER,
        best27: Number.MAX_SAFE_INTEGER,
        best100: Number.MAX_SAFE_INTEGER,
        times: [],
        hints: 0,
    };
    localStorage.setItem('stats', JSON.stringify(stats));
    stats2html();
}

function updateDisplayedRange(e) {
    delayval.innerHTML = hintdelay.value;
}

function beautifyMS( milliseconds ) {
    let ret = "";
    let day, hour, minute, seconds, milis;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    milis = milliseconds % 1000;
    // seconds = seconds + (milis/1000);
    if( day ) ret += day + " day" + ((day==1)?(""):("s")) + ", ";
    if( hour ) ret += hour + " hour" + ((hour==1)?(""):("s")) + ", ";
    if( minute ) ret += minute + " minute" + ((minute==1)?(""):("s")) + ", ";
    if( ret == "" ) ret += seconds + " second" + ((seconds==1)?(""):("s")) + ", ";
    else if( seconds )ret += seconds + " second" + ((seconds==1)?(""):("s")) + ", ";
    return ret.substr(0,ret.length-2); // strip ", "
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then(function() { console.log('Service Worker Registered'); });
}
