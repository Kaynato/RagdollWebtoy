var DEBUG = 0;
var gravity = 0.8;
var tickSpeed = 200;
var tickSpeed_default = 200;
var friction = 0.05;
var queueEvent = null;

var gravi = setInterval("activePhysics()", 20);
var fticks = setInterval("f_tick()", tickSpeed);

var mouse = {
	x: window.innerWidth/2,
	y: window.innerHeight/2,
	vx: 0.0,
	vy: 0.0
}

// Update tick speed.
function updateTicks(newTicks) {
	tickSpeed = newTicks;
	clearInterval(fticks);
	fticks = setInterval("f_tick()", tickSpeed);
}

// Queue event after some time.
function queue(eventName, ticks, msOffset) {
	clearTimeout(queueEvent);
	queueEvent = setTimeout(eventName, ticks*tickSpeed+msOffset);
}

// Rand int from 0 ... max
function randInt(max) {
	return Math.floor(Math.random() * max);
}

// num/dem chance to be 1
function chance(num,den) {
	return (randInt(den) < num);
}

// 1 if above range, -1 if below -range, 0 otherwise.
function trigger(value, range) {
	if (value > range)
		return 1;
	else if (value < -range)
		return -1;
	else
		return 0;
}

// Debug text
function dbTxt(num, txt) {
	if (DEBUG) $('#debug'+num).text(txt);
}

// css property as number
jQuery.fn.cssNumber = function(prop){
	var v = parseInt(this.css(prop), 10);
	return isNaN(v) ? 0 : v;
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

	$(this).keydown(function(event) {
		var ch = event.which;
		if (ch!=116 && ch!=18 && ch!=8 && ch!=17) {
			event.preventDefault();

			// If press D
			if (event.which == 68) {
				if (DEBUG) {
					DEBUG = 0;
					$('.debug *').text('');
				}
				else
					DEBUG = 1;
			}
		}
	});
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

		f_forceflip(trigger(mouse.vx, 5));

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
		clearTimeout(queueEvent);
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
		f_state.yVel += gravity;
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

	// Also check mouse collision
	if (inBounds($('#figure'),mouse.x,mouse.y)) {
		f_state.alone -= f_state.friendliness;
		if (f_state.alone < 0)
			f_state.alone = 0;
	}
	
	dbTxt(7,state_name(f_state.state) + ' : ' + f_state.framenum);
	dbTxt(9,'position: '+f_state.x+', '+f_state.y);
	dbTxt(10,'vel: '+totXV+', '+f_state.yVel);
	dbTxt(11,(f_state.active?'ACTIVE':'INACTIVE')+'  '+(f_state.animate?'ANIMATE':'STILL')+' ticks: '+tickSpeed);
	dbTxt(12,f_state.compoundDamage+' >> '+f_state.recoveryTime);
	dbTxt(15,f_state.airborne?'ON AIR':'ON GROUND');
}

// Should extend to include platforms
function detTop(figu) {
	var H = window.innerHeight;
	var h = figu.cssNumber("height");
	var t = f_state.y;

	var newTop = t+f_state.yVel+f_state.yVel;

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
		f_state.yVel = 0;
		f_state.y = H-h;
		return H-h;
	}
	// IN AIR???
	else {
		var st = f_state.state;
		f_dirsign(f_state.xVel+f_state.passiveXV);
		// GOING DOWN AND NOT FALLING OR BEGINNING TO FALL
		// Begin the whole falling thing
		if (f_state.yVel>0 && st!=ff_fall && st!=ff_beginfall)
			f_beginfall();
		// Stay floaty!
		f_state.airborne = 1;
		f_state.y = newTop;
		return Math.floor(f_state.y);
	}
}

function detLeft(figu) {
	// Determine activeXVel
	f_state.xVel = f_state.xVelbase * f_mouseDistFactor();

	// Determine new x
	f_state.x += f_state.passiveXV + f_state.xVel;

	// Bounce against L
	if (f_state.x < 0) {
		if (f_state.passiveXV < 33)
			f_state.compoundDamage += f_state.passiveXV/33;
		f_state.passiveXV *= f_state.passiveXV >= 0 ? 0.9 : -0.9;
	}

	// Bounce against R
	if ((f_state.x + figu.cssNumber("width")) > window.innerWidth) {
		if (f_state.passiveXV > 33)
			f_state.compoundDamage += f_state.passiveXV/33;
		f_state.passiveXV *= f_state.passiveXV >= 0 ? -0.9 : 0.9;
	}

	return Math.floor(f_state.x);
}

function inBounds(o, x, y) {
	var up = o.cssNumber('top') + f_state.fr_topMargin;
	var down = up + o.cssNumber('height') - (f_state.fr_topMargin);
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
var ff_beginfall = [[3,3],[4,3],[5,3],[3,2],[2,2],[1,2],[1,2]];

// Sleep
var ff_sleep = [[3,2]];

// Getting back up
var ff_rise = [[4,2],[4,2],[5,2],[5,2],[5,2],[5,2]];

// Jump straight up... so what if it's kinda hacky? it prevents checks by sepping vars
var ff_prepjumpup = [[0,3]];
var ff_jumpup = [[1,3]];

// Jump sideways
var ff_prepjumpside = [[2,3]];
var ff_jumpside = [[3,3]];

var f_state = {
	x: 0,
	y: 0,

	// Not my movement
	passiveXV: 0,
	// My movement
	xVel: 0,

	// All Y has to be grouped because gravity is merciless
	yVel: 0,

	xVelbase: 0,

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
	friendliness: 10,
	down: 0,

	maxAllowV: 20,

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
	fr_topMargin: 0
}

function f_tick() {
	var f = $("#figure");
	
	if (!f_state.dragged) {

		// Update image
		if (f_state.animate)
			f.css('background-position', f_getFrame(f_state));
		
		if (!f_state.airborne && f_state.active) {
			if ((f_state.state == ff_idle && chance(f_state.alone, 80)) || f_state.state == ff_walk)
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
	var R = L+f.cssNumber('width')-f_state.fr_xMargin-f_state.fr_xMargin;
	var T = f.cssNumber('top')-f_state.fr_topMargin;

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
				f_seek(goDir,0,xdiff,goDir);
			else
				f_setWalk(goDir,0);
		}
		// Seek up only - in upper FOV BUT IT IS NOT QUITE NOT
		else if (angle > hiangle)
			f_seek(0,1,xdiff,goDir);
		// Seek up and left
		else
			f_seek(goDir,1,xdiff,goDir);
	}
	// Mouse is DIRECTLY above
	else if (mouse.y < T)
		f_seek(0,1,0,0);
	// Mouse is touching
	else {
		f_changeDir(0);
		f_state.alone = 0;
		f_state.compoundDamage -= 0.2;
		if (f_state.compoundDamage < 0)
			f_state.compoundDamage = 0;
	}
}

function f_mouseDistFactor() {
	var f = $("#figure");
	var L = f.cssNumber('left')+f_state.fr_xMargin;
	var R = L+f.cssNumber('width')-(2*f_state.fr_xMargin);
	var mouseDist = mouse.x > R ? mouse.x-R : L-mouse.x;
	return 1+(2*mouseDist/window.innerWidth);
}

// Seek the mouse. Transition from idle into an active state.
function f_seek(xDir, lookUp, xdiff, isRight) {
	// If we are going to some side
	if (xDir != 0) {
		// If upwards, prep a jump
		if (lookUp)
			f_prepJump(xDir,xdiff,isRight);
		// Prep walk
		else
			f_setSeekHoriz(xDir);
	}
	// Prep up
	else if (lookUp) {
		// Chance of prep jump
		if (chance(f_state.alone, 100))
			f_prepJump(0,xdiff,isRight);
		// Otherwise just look up
		else
			f_setSeekUp();
	}
}

function f_setIdle() {
	f_stop();
	f_state.state = ff_idle;
	f_state.active = 1;
	f_state.xVelbase = 0;
	if (tickSpeed != tickSpeed_default)
		updateTicks(tickSpeed_default);
}

function f_setSeekUp() {
	f_stop();
	f_state.state = ff_seek;
	f_state.xVelbase = 0;
	if (f_state.alone > 5)
		f_state.alone -= 5;
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
	f_state.xVelbase = 0;
	if (f_state.dir > dir) { // Turn left
		updateTicks(tickSpeed_default/2);
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
		updateTicks(tickSpeed_default/2);
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
		updateTicks(tickSpeed_default);
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
	updateTicks(tickSpeed_default);
	if (init)
		f_state.framenum = 0;
	f_state.state = ff_walk;
	f_state.xVelbase = dir * ((1.0*f_state.alone)/40);
}

function f_sleep() {
	f_state.state = ff_sleep;
	f_state.active = 0;
	f_state.animate = 0;
	if (f_state.recoveryTime != Infinity)
		queue("f_rise()", 1+f_state.recoveryTime, 0);
}

// Prepare a jump
function f_prepJump(dir, xdiff, mousedir) {
	f_state.dir = mousedir;
	f_state.xVel = 0;
	f_state.xVelbase = 0;

	var f = $('#figure');
	var T = f.cssNumber('top') + f_state.fr_topMargin;
	var h = f.cssNumber('height') - f_state.fr_topMargin;
	// Jump! How high? Yes, that's how to follow this
	var vert = T - (mouse.y - (h/2));
	
	// Do the needful and jumpings speed now
	var jump_vy = -Math.sqrt(2*gravity*vert);

	// Mistargeting
	jump_vy *= 0.8 - (Math.random() * 0.3);

	if (jump_vy > f_state.maxAllowV)
		jump_vy *= 0.8 - (Math.random() * 0.4);

	// Straight up
	if (Math.abs(xdiff) < 0.5) {
		// Safe or desperate
		if (jump_vy < f_state.maxAllowV || chance(f_state.alone-50, 500)) {
			f_state.active = 0;
			dbTxt(13,"vert jump vy: "+jump_vy);
			f_state.state = dir == 0 ? ff_prepjumpup : ff_prepjumpside;
			queue("f_jump(0,"+jump_vy+")", 1-Math.ceil(jump_vy/10),0);
		}
		// Noooope
		else
			f_setSeekUp();
	}
	// Jump side
	else {
		// Set direction
		f_state.dir = dir;
		
		// Time for calculations
		var timetofall = -jump_vy / gravity;
		dbTxt(14,"time to fall: "+timetofall);
		var jump_vx = mousedir*(xdiff*1.0)/(timetofall);

		if (jump_vx > f_state.maxAllowV)
			jump_vx *= 0.8 - (Math.random() * 0.4);

		var v_abs = Math.sqrt(jump_vy*jump_vy + jump_vx*jump_vx);


		// Safe or desperate
		if ((jump_vy < f_state.maxAllowV && Math.abs(jump_vx) < f_state.maxAllowV) || chance(f_state.alone-50, 500)) {
			f_state.state = dir == 0 ? ff_prepjumpup : ff_prepjumpside;
			f_state.active = 0;
			dbTxt(13,"side jump vx: "+jump_vx+", vy: "+jump_vy);
			queue("f_jump("+jump_vx+","+jump_vy+")", 1+Math.ceil(v_abs/10),0);
		}
		// I... REFUSE!
		else {
			if (f_state.state != ff_walk)
				f_setSeekHoriz(dir);
			else
				f_setWalk(dir, 0);
		}
	}
}

function f_jump(vx, vy) {
	f_state.passiveXV = vx;
	f_state.yVel = vy;
	f_state.state = vx == 0 ? ff_jumpup : ff_jumpside;
}

function f_beginfall() {
	var st = f_state.state;
	var ws = (st == ff_sleep || f_state.down) && (st != ff_jumpside || st != ff_jumpup);
	f_state.state = ff_beginfall;	
	f_state.framenum = ws ? 3 : 0;
	f_state.animate = 1;
	updateTicks(100);
	queue("f_fall()", f_state.state.length-f_state.framenum, 0);
}

function f_fall() {
	f_state.state = ff_fall;
	f_state.framenum = randInt(ff_fall.length);
	f_setSprite(ff_fall[f_state.framenum]);
	f_state.animate = 0;
	f_state.active = 0;
	updateTicks(tickSpeed_default);
}

// Only called when state is fall or beginfall
function f_hitFloor() {
	var beginfall = f_state.state == ff_beginfall;
	f_state.active = 0;
	updateTicks(tickSpeed_default);

	// Didn't start falling enough
	if (beginfall && f_state.framenum < 3) {

		// Do this a bit faster
		updateTicks(tickSpeed_default/2);

		// Recover
		f_state.state = ff_rise;

		// Determine position of recovery
		switch (f_state.framenum) {
			case 2:
				f_state.framenum = 0;
				break;
			case 1:
				f_state.framenum = 3;
				break;
			case 0:
				f_state.framenum = 5;
				break;
		}

		// Wait for animation to finish
		queue("f_setIdle()", f_state.state.length-f_state.framenum, 0);
	}
	// Completely falling or at least going to collapse
	else {
		f_state.state = ff_floor;

		if (beginfall)
			f_state.framenum = 6 - f_state.framenum;
		else
			f_state.framenum = 0;
		
		// DEADDDDDDDDDd
		if (f_state.recoveryTime == Infinity)
			f_setSprite(ff_sleep);
		// Not dead - calculate recovery time
		else {
			f_state.recoveryTime=(randInt(2)+f_state.yVel/2+f_state.compoundDamage)/2;
	
			if(f_state.yVel > 33)
				f_state.compoundDamage += (f_state.yVel/15);
			if (f_state.compoundDamage > 50)
				f_die();
		}
		queue("f_sleep()",f_state.state.length-f_state.framenum,-2*tickSpeed/3);
	}
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

	var f = $("#figure");
	var st = f_state.state;

	// If we are standing, set to closed-eye face
	if (f_isStanding()) {
		f_setSprite(ff_dragged);
		f_state.down = 0;
	}
	// If we are not standing, we could be
	// RISE
	else if (st == ff_rise)
		f_setSprite(ff_rise[0]);
	// SLEEP
	else if (st != ff_fall && (st == ff_sleep || f_state.down || st == ff_floor)){
		f_setSprite(ff_sleep[0]);
		f_state.down = 1;
	}
	// FALL
	else if (st == ff_fall) {
		f_setSprite(ff_fall[f_state.framenum]);
	}
	// BEGINFALL
	else if (st == ff_beginfall) {
		if (f_state.framenum > 4)
			f_setSprite(ff_beginfall[5]);
		else if (f_state.framenum > 2)
			f_setSprite(ff_sleep[0]);
		else
			f_setSprite(ff_rise[0]);
	}
	// ???
	else
		f_setSprite(ff_rise[0]);

	// Set appropriate state if not already falling
	if (st != ff_fall)
		f_state.state = f_state.recoveryTime != Infinity ?ff_dragged:ff_sleep;
	else
		f_state.state = ff_fall;

	// Set offsets
	f_state.mOffX = mx - f.cssNumber('left');
	f_state.mOffY = my - f.cssNumber('top');
	f.removeClass('mass');
	f_state.yVel = 0;

	dbTxt(11, f_state.mOffX+'  ||  '+f_state.mOffY);

	return false;
}

function f_mouseUp() {
	if (f_state.dragged) {
		f_state.passiveXV = mouse.vx*0.8;
		f_state.yVel = mouse.vy*0.8;
	}
	f_state.dragged = 0;
	$("#figure").addClass('mass');
}

function f_setSprite(sprite) {
	var x = sprite[0] * -f_state.fr_width+'px';
	var y = sprite[1] * -f_state.fr_height+'px';
	$("#figure").css("background-position",x+' '+y);
}

function f_isStanding() {
	var st = f_state.state;
	var is = st == ff_idle || st == ff_seek || st == ff_turn || st == ff_tocen;
	is |= st == ff_tosid || st == ff_walk || st == ff_dragged;
	is |= st == ff_prepjumpside || st == ff_prepjumpup || st == ff_jumpside;
	is |= st == ff_jumpup;
	return is;
}

function state_name(state) {
	if (f_state.recoveryTime === Infinity)
		return "DEAD";
	switch (state) {
		case ff_idle:			return "IDLE";
		case ff_seek:			return "SEEK UPWARDS";
		case ff_turn:			return "SEEK SIDEWAYS";
		case ff_walk:			return "WALK";
		case ff_fall:			return "FALLING";
		case ff_floor:			return "HITTING THE FLOOR";
		case ff_sleep:			return "SLEEP";
		case ff_tosid:			return "TURNING TO SIDE";
		case ff_tocen:			return "TURNING TO CENTER";
		case ff_rise:			return "RISING";
		case ff_dragged:		return "DRAGGED";
		case ff_beginfall:		return "BEGIN FALL";
		case ff_prepjumpside:	return "PREPARE SIDE JUMP";
		case ff_jumpside:		return "SIDE JUMP";
		case ff_prepjumpup:		return "PREPARE VERTICAL JUMP";
		case ff_jumpup:			return "VERTICAL JUMP";
	}
}

function f_dirsign(val) {
	f_state.dir = Math.sign(val);
}

function f_forceflip(val) {
	if (val == 1)
		$("#figure").removeClass("flip");
	else if (val == -1)
		$("#figure").addClass("flip");
}





function f_die() {
	f_setSprite(ff_sleep);
	// if (f_state.recoveryTime != Infinity)
		// alert('you are a monster.');
	$("#figure").text("DEAD.");
	f_state.animate = 0;
	f_state.compoundDamage=Infinity;
	f_state.recoveryTime=Infinity;
}