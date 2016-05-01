var DEBUG = 1;
var tickSpeed = 200;
var tickSpeed_default = 200;
var friction = 0.05;
var queueEvent = null;

var gravi = setInterval("activePhysics()", 20);
var fticks = setInterval("f_tick()", tickSpeed);

function updateTicks(newTicks) {
	tickSpeed = newTicks;
	clearInterval(fticks);
	fticks = setInterval("f_tick()", tickSpeed);
}

function randInt(max) {
	return Math.floor(Math.random() * max);
}

function chance(num,den) {
	return (randInt(den) < num);
}

function queue(eventName, ticks, msOffset) {
	clearTimeout(queueEvent);
	queueEvent = setTimeout(eventName, ticks*tickSpeed+msOffset);
}

function dbTxt(num, txt) {
	if (DEBUG) $('#debug'+num).text(txt);
}

jQuery.fn.cssNumber = function(prop){
	var v = parseInt(this.css(prop), 10);
	return isNaN(v) ? 0 : v;
}

var mouse = {
	x: window.innerWidth/2,
	y: window.innerHeight/2,
	vx: 0.0,
	vy: 0.0
}

//////////////
//////////////
//////////////
// DOCUMENT //
//////////////
//////////////
//////////////

$(document).ready(function() {
	$("#figure").css('top','0px');
	f_state.x = $("#figure").cssNumber('left');
	f_state.y = $("#figure").cssNumber('top');
	f_fall();
});

document.onmousemove = function(e){
	mouse.vx = e.pageX - mouse.x;
	mouse.vy = e.pageY - mouse.y;
	mouse.x = e.pageX;
	mouse.y = e.pageY;

	// Drag if dragging
	if (f_state.dragged) {
		var nTop = mouse.y-f_state.mOffY;
		var nLeft = mouse.x-f_state.mOffX;

		$('#figure').css({
			'top': nTop+'px',
			'left': nLeft+'px'
		});
		f_state.y = nTop;
		f_state.x = nLeft;
		dbTxt(4, 'DRAG @@ '+nLeft+'  '+nTop);
	}
	dbTxt(1, mouse.x+', '+mouse.y+' ** '+mouse.vx+', '+mouse.vy);
}

document.onmousedown = function(e){
	var f = $("#figure");

	if (inBounds(f,e.pageX,e.pageY)) {
		dbTxt(4, "ON");
		f_mouseDown(e.pageX, e.pageY);
	}
	else
		dbTxt(4, "OFF");

}

document.onmouseup = function(e){
	dbTxt(4, "OFF");
	f_mouseUp();
}

/////////////
/////////////
/////////////
// GENERAL //
/////////////
/////////////
/////////////

// Affect physics
function activePhysics() {
	var figu = $('.mass');

	// GRAVITY
	if (!f_state.dragged) {
		f_state.passiveYV += 0.8;
		var newTop = detTop(figu);
		var newLeft = detLeft(figu);

		figu.css("top",newTop+'px');
		figu.css("left",newLeft+'px');
	}

	// GRUNDFRIKTION
	if (!f_state.airborne) {
		var xv = f_state.passiveXV*1.0;
		var coeff = 1-friction;
		f_state.passiveXV = xv > 0 ? Math.floor(coeff*xv) : Math.ceil(coeff*xv);
	}

	var totXV = (f_state.xVel+f_state.passiveXV);

	dbTxt(7,state_name(f_state.state) + ' : ' + f_state.framenum);
	dbTxt(9,f_state.x+', '+f_state.y);
	dbTxt(10,'vel: '+totXV+', '+f_state.passiveYV);
	dbTxt(11,(f_state.active?'ACTIVE':'INACTIVE')+'  '+(f_state.animate?'ANIMATE':'STILL')
		+' ticks: '+tickSpeed);
	dbTxt(12,f_state.compoundDamage+' >> '+f_state.recoveryTime);
}

// Should extend to include platforms
function detTop(figu) {
	var H = window.innerHeight;
	var h = figu.cssNumber("height");
	var t = f_state.y;
	var newTop = t+f_state.passiveYV;

	// ON OR UNDER GROUND
	if(newTop >= (H-h)) {
		// Hit the ground...
		if (f_state.state == ff_fall || f_state.state == ff_beginfall)
			f_hitFloor();
		// Was dragged there?
		else if (f_state.state == ff_dragged)
			f_setIdle();
		f_state.animate = 1;
		f_state.airborne = 0;
		f_state.passiveYV = 0;
		f_state.y = H-h;
		return H-h;
	}
	// IN AIR???
	else {
		// GOING DOWN AND NOT FALLING OR BEGINNING TO FALL
		// Begin the whole falling thing
		if (f_state.passiveYV>0 && f_state.state != ff_fall && f_state.state != ff_beginfall) {
			f_state.animate = 1;
			f_state.framenum = 0;
			f_state.state = ff_beginfall;
			updateTicks(100);
			queue("f_fall()", f_state.state.length, 0);
		}
		// Stay floaty!
		f_state.airborne = 1;
		f_state.y = newTop;
		return Math.floor(f_state.y);
	}
}

function f_fall() {
	f_state.animate = 0;
	f_state.state = ff_fall;
	f_setSprite(ff_fall[randInt(ff_fall.length)]);
	f_state.active = 0;
	updateTicks(tickSpeed_default);
}

function detLeft(figu) {
	f_state.x += f_state.passiveXV + f_state.xVel;

	if (f_state.x < 0) {
		f_state.passiveXV *= f_state.passiveXV >= 0 ? 0.9 : -0.9;
		if (f_state.passiveXV > 33)
			f_state.compoundDamage += f_state.passiveXV/15;
	}

	if ((f_state.x + figu.cssNumber("width")) > window.innerWidth) {
		if (f_state.passiveXV > 33)
			f_state.compoundDamage += f_state.passiveXV/15;
		f_state.passiveXV *= f_state.passiveXV >= 0 ? -0.9 : 0.9;
	}

	return Math.floor(f_state.x);
}

function inBounds(o, x, y) {
	var up = o.cssNumber('top') + f_state.fr_yMargin;
	var down = up + o.cssNumber('height') - (2*f_state.fr_yMargin);
	var left = o.cssNumber('left') + f_state.fr_xMargin;
	var right = left + o.cssNumber('width') - (2*f_state.fr_xMargin);

	dbTxt(2, left+' < '+x+' < '+right);
	dbTxt(3, up+' < '+y+' < '+down);

	return (x > left && x < right) && (y > up && y < down);
}

////////////////////////////
//						  //
//						  //
//						  //
//						  //
//						  //
////////////////////////////
////////////////////////////
////////////////////////////
// Figure = state machine //
////////////////////////////
////////////////////////////
////////////////////////////
//						  //
//						  //
//						  //
//						  //
//						  //
////////////////////////////

// Idle
var ff_idle = [[0,0],[1,0],[2,0],[3,0]];

// Seek upwards
var ff_seek = [[3,1],[3,1],[4,1],[4,1],[4,1],[4,1],[3,1],[3,1],[3,1]];

// Turn left or right for seek
var ff_turn = [[3,0],[3,0],[3,0],[3,0],[4,0],[4,0],[4,0],[4,0],[4,0]];

// Tocenter
var ff_tocen = [[5,0],[4,0],[3,0]];

// Toside
var ff_tosid = [[3,0],[4,0],[5,0]];

// Walk left or right
var ff_walk = [[5,0],[0,1],[1,1],[2,1]];

// Closed eye / dragged
var ff_dragged = [4,1];

// Falling sprites - NOT ANIMATION. CHOOSE BETWEEN THESE
var ff_fall = [[5,1],[0,2]];

// Fell on the floor
var ff_floor = [[1,2],[2,2],[2,2],[3,2]];

// Begin to fall
var ff_beginfall = [[3,3],[4,3],[5,3],[3,2],[2,2],[1,2]];

// Sleep
var ff_sleep = [[3,2]];

// Getting back up
var ff_rise = [[4,2],[4,2],[5,2],[5,2],[5,2],[5,2]];

var f_state = {
	x: 0,
	y: 0,

	yVel: 0,
	xVel: 0,

	// Ticks since last looked for mouse
	alone: 0,
	dir: 0,
	stopAnim: 0,
	dragged: 0,
	airborne: 1,
	active: 1,
	recoveryTime: 1,
	compoundDamage: 0,
	animate: 1,

	// Due to "natural causes"
	passiveXV: 0,
	passiveYV: 0,

	// Mouse offset
	mOffX: 0,
	mOffY: 0,

	// Angle down from vertical border
	// Or up from horizontal border
	fov_angle: Math.PI / 12,
	// Animation variables
	state: ff_idle,
	framenum: 0,

	// Totals
	fr_width: 150,
	fr_height: 150,

	// White space
	fr_xMargin: 25,
	fr_yMargin: 0
}

function f_tick() {
	var f = $("#figure");
	
	if (!f_state.dragged) {

		// Update image
		if (f_state.animate)
			f.css('background-position', f_getFrame(f_state));
		
		if (!f_state.airborne && f_state.active) {
			if ((f_state.state == ff_idle && chance(f_state.alone, 100)) 
					|| f_state.state == ff_walk)
				f_seekMouse();
			else
				f_state.alone++;
		}
	}

	dbTxt(6,'time: '+f_state.alone);
	dbTxt(8,'direction: '+f_state.dir);
}

function f_getFrame(o) {
	if (o.dir == 1)
		$("#figure").removeClass("flip");
	else if (o.dir == -1)
		$("#figure").addClass("flip");

	var st = o.state[o.framenum];
	while (st == undefined) {
		o.framenum--;
		st = o.state[o.framenum];
	}

	var x = st[0] * -o.fr_width;
	var y = st[1] * -o.fr_height;

	// Increment
	if (++o.framenum >= o.state.length)
		o.framenum -= o.stopAnim ? 1 : o.framenum;

	if (x != 0)
		x = x+'px';
	if (y != 0)
		y = y+'px';

	return x+' '+y;
}

function f_seekMouse() {
	var f = $("#figure");
	var idle = f_state.state == ff_idle;

	// Important sides
	var L = f.cssNumber('left')+f_state.fr_xMargin;
	var R = L+f.cssNumber('width')-f_state.fr_xMargin;
	var T = f.cssNumber('top')-f_state.fr_yMargin;

	// Where is the mouse?
	if (mouse.x > R || mouse.x < L) {
		var isRight = mouse.x > R;
		var goDir = isRight ? 1 : -1;
		var xdiff = isRight ? mouse.x-R : L-mouse.x;
		var angle = Math.atan2(T-mouse.y, xdiff);
		var hiangle = (Math.PI/2) - f_state.fov_angle;

		// in sideview FOV
		if (angle < f_state.fov_angle) {
			if (idle)
				f_seek(goDir,0);
			else
				f_setWalk(goDir,0);
		}
		// Seek up only - in upper FOV
		else if (angle > hiangle)
			f_seek(0,1);
		// Seek up and left
		else {
			if (idle)
				f_seek(goDir,1);
			else
				f_setWalk(goDir,0);
		}
	}
	else if (mouse.y < T) {
		f_seek(0,1);
		f_state.alone = 0;
	}
	else {
		f_changeDir(0);
		f_state.alone = 0;
	}
}

function f_seek(xDir, lookUp) {
	if (xDir != 0)
		f_setSeekHoriz(xDir);
	else if (lookUp)
		f_setSeekUp();
}

function f_setIdle() {
	f_stop();
	f_state.state = ff_idle;
	f_state.active = 1;
}

function f_setSeekUp() {
	f_stop();
	f_state.state = ff_seek;
	queue("f_setIdle()", ff_seek.length+1, 0);
}

function f_setSeekHoriz(dir) {
	f_resetAnim();
	f_state.state = ff_turn;
	f_state.dir = dir;
	queue("f_setWalk("+dir+",1)", ff_turn.length, 0);
}

function f_changeDir(dir) {
	f_state.xVel = 0;
	
	if (f_state.dir > dir) { // Turn left
		f_state.framenum = 0;
		f_state.dir--;

		if (f_state.dir == 0) {
			dbTxt(5, "R > M");
			f_state.state = ff_tocen;
			queue("f_changeDir("+dir+")", f_state.state.length, 0);
		}
		else if (f_state.dir == -1) {
			dbTxt(5, "M > L");
			f_state.state = ff_tosid;
			queue("f_setWalk("+dir+",1)", f_state.state.length, 0);
		}
	}
	else if (f_state.dir < dir) { // Turn right
		f_state.framenum = 0;
		f_state.dir++;

		if (f_state.dir == 0) {
			dbTxt(5, "L > M");
			f_state.state = ff_tocen;
			queue("f_changeDir("+dir+")", f_state.state.length, 0);
		}
		else if (f_state.dir == 1) {
			dbTxt(5, "M > R");
			f_state.state = ff_tosid;
			queue("f_setWalk("+dir+",1)", f_state.state.length, 0);
		}		
	}

	// No turning necessary
	else {
		dbTxt(5,dir != 0 ?"DONE TURNING":"RETURNED");
		if (dir != 0)
			f_setWalk(dir,1);
		else
			f_setIdle();
	}
	
}

function f_setWalk(dir, init) {
	if (f_state.dir != dir)
		return f_changeDir(dir);
	if (init)
		f_state.framenum = 0;
	f_state.state = ff_walk;
	f_state.xVel = dir * ((1.0*f_state.alone)/40);
}

function f_sleep() {
	f_state.state = ff_sleep;
	f_state.active = 0;
	f_state.animate = 0;
	if (f_state.recoveryTime != Infinity) {
		queue("f_rise()", 1+f_state.recoveryTime, 0);
	}
}

function f_hitFloor() {
	f_state.framenum = 0;
	f_state.state = ff_floor;
	f_state.active = 0;
	updateTicks(tickSpeed_default);

	if (f_state.recoveryTime == Infinity)
		f_setSprite(ff_sleep);
	else {
		f_state.recoveryTime=(f_state.passiveYV/4)+(randInt(2)/2)+(f_state.compoundDamage/2);

		if (f_state.passiveYV < 19)
			f_state.recoveryTime = 0.5;

		if(f_state.passiveYV > 33)
			f_state.compoundDamage += (f_state.passiveYV/15);
		if (f_state.compoundDamage > 50)
			f_die();
	}

	queue("f_sleep()",f_state.state.length,-2*tickSpeed/3);
}

function f_rise() {
	f_state.animate = 1;
	f_state.framenum = 0;
	f_state.state = ff_rise;
	queue("f_setIdle()", f_state.state.length, 0);
}




function f_stop() {
	f_resetAnim();
	f_state.dir = 0;
}

function f_resetAnim() {
	f_state.framenum = 0;
	f_state.xVel = 0;
}




function f_mouseDown(mx, my) {
	f_state.dragged = 1;

	f_state.state = f_state.recoveryTime != Infinity ?ff_dragged:ff_sleep;

	var f = $("#figure");

	// Set to closed-eye face
	f_setSprite(f_state.recoveryTime != Infinity ?ff_dragged:ff_sleep, 0);

	// Set offsets
	f_state.mOffX = mx - f.cssNumber('left');
	f_state.mOffY = my - f.cssNumber('top');
	f.removeClass('mass');
	f_state.passiveYV = 0;

	dbTxt(11, f_state.mOffX+'  ||  '+f_state.mOffY);

	return false;
}

function f_mouseUp() {
	if (f_state.dragged) {
		f_state.passiveXV = mouse.vx*0.99;
		f_state.passiveYV = mouse.vy*1.0;
	}
	f_state.dragged = 0;
	$("#figure").addClass('mass');
}

function f_setSprite(sprite) {
	var x = sprite[0] * -f_state.fr_width+'px';
	var y = sprite[1] * -f_state.fr_height+'px';
	$("#figure").css("background-position",x+' '+y);
}

function state_name(state) {
	switch (state) {
		case ff_idle:
			return "IDLE";
		case ff_seek:
			return "SEEK UPWARDS";
		case ff_turn:
			return "SEEK SIDEWAYS";
		case ff_walk:
			return "WALK";
		case ff_fall:
			return "FALLING";
		case ff_floor:
			return "HITTING THE FLOOR";
		case ff_sleep:
			return "SLEEP";
		case ff_tosid:
			return "TURNING TO SIDE";
		case ff_tocen:
			return "TURNING TO CENTER";
		case ff_rise:
			return "RISING";
		case ff_dragged:
			return "DRAGGED";
		case ff_beginfall:
			return "BEGIN FALL";
	}
}









function f_die() {
	f_setSprite(ff_sleep);
	if (f_state.recoveryTime != Infinity)
		alert('you are a monster.');
	f_state.animate = 0;
	f_state.compoundDamage=Infinity;
	f_state.recoveryTime=Infinity;
}