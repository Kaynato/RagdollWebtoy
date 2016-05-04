var DEBUG = 0;
var gravity = 0.8;
var tickSpeed = 200;
var tickSpeed_default = 200;
var friction = 0.05;
var queueEvent = null;

var gravi = setInterval("activePhysics()", 20);
var fticks = setInterval("figur.tick()", tickSpeed);

var mouse = {
	r: new vec2(window.innerWidth/2, window.innerHeight/2),
	v: new vec2(0,0)
}

var Vector = {
	sum:  (V,W) => new vec2(V.x + W.x, V.y + W.y),
	diff: (V,W) => new vec2(V.x - W.x, V.y - W.y)
}

function vec2(initx, inity) {
	this.x = initx;
	this.y = inity;

	this.add = (X,Y) => {this.x += X; this.y += Y;}
	this.sub = (X,Y) => {this.x -= X; this.y -= Y;}
	this.mul = (X,Y) => {this.x *= X; this.y *= Y;}
	this.set = (X,Y) => {this.x  = X; this.y  = Y;}

	this.addV = (V) => this.add(V.x,V.y);
	this.subV = (V) => this.sub(V.x,V.y);
	this.mulV = (V) => this.mul(V.x,V.y);
	this.setV = (V) => this.set(V.x,V.y);

	this.toString = () => '('+this.x+', '+this.y+')';
	this.toPx = () => this.x+'px '+this.y+'px';
}

// CSS Div
function cssdiv(selector) {
	this.e = $(selector);
	this.getLeft = () => this.e.cssNumber('left');
	this.getTop = () => this.e.cssNumber('top');

	this.getWidth = () => this.e.cssNumber('width');
	this.getHeight = () => this.e.cssNumber('height');

	this.getRight = () => this.getLeft() + this.getWidth();
	this.getBottom = () => this.getTop() + this.getHeight();
	
	this.setLeft = (l) => this.e.css('left', L+'px');
	this.setTop = (T) => this.e.css('top', T+'px');
}

// Update tick speed.
function updateTicks(newTicks) {
	tickSpeed = newTicks;
	clearInterval(fticks);
	fticks = setInterval("figur.tick()", tickSpeed);
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
	return randInt(den) < num;
}

// 1 if above range, -1 if below -range, 0 otherwise.
function trigger(value, range) {
	if (value > range)		 return 1;
	else if (value < -range) return -1;
	else					 return 0;
}

function between(val, min, max) {
	return (val > min && val < max);
}

function decf(it, amt) {
	return it <= amt ? it : amt;
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

function getFrame(o) {
	if (o.dir == 1)
		o.elem.e.removeClass("flip");
	else if (o.dir == -1)
		o.elem.e.addClass("flip");

	var st = o.state[o.framenum];
	while (st == undefined) {
		o.framenum--;
		st = o.state[o.framenum];
	}

	var x = st[0] * -o.dim.x;
	var y = st[1] * -o.dim.y;

	// Increment
	if (++o.framenum >= o.state.length)
		o.framenum -= o.stopAnim ? 1 : o.framenum;

	if (x != 0)
		x = x+'px';
	if (y != 0)
		y = y+'px';

	return x+' '+y;
}

//////////////
//////////////
//////////////
// DOCUMENT //
//////////////
//////////////
//////////////

$(document).ready(function() {
	figur.initialize();
	figur.beginfall();

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
	mouse.v.set(e.pageX-mouse.r.x, e.pageY-mouse.r.y);
	mouse.r.set(e.pageX, e.pageY);

	// Drag if dragging
	if (figur.dragged) {
		var newpos = Vector.diff(mouse.r, figur.mOff);		

		figur.forceflip(trigger(mouse.v.x, 5));

		$('#figure').css({
			'top': newpos.y+'px',
			'left': newpos.x+'px'
		});
		figur.r.setV(newpos);
		dbTxt(4, 'DRAG @@ '+newpos.toString());
	}
	dbTxt(1, mouse.r.toString()+' ** '+mouse.v.toString());
}

document.onmousedown = function(e){
	if (inBounds(figur,e.pageX,e.pageY)) {
		dbTxt(4, "ON");
		clearTimeout(queueEvent);
		figur.mouseDown(e.pageX, e.pageY);
	}
	else
		dbTxt(4, "OFF");
}

document.onmouseup = function(e){
	dbTxt(4, "OFF");
	figur.mouseUp();
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
	var massed = $('.mass');

	// GRAVITY
	if (!figur.dragged) {
		figur.v.y += gravity;
		var newTop = detTop(massed);
		var newLeft = detLeft(massed);

		massed.css("top",newTop+'px');
		massed.css("left",newLeft+'px');
	}

	// GRUNDFRIKTION
	if (!figur.airborne) {
		var xv = figur.v.x*1.0;
		var coeff = 1-friction;
		figur.v.x = xv > 0 ? Math.floor(coeff*xv) : Math.ceil(coeff*xv);
	}

	var totXV = figur.activevx+figur.v.x;

	// Also check mouse collision
	if (inBounds(figur,mouse.r.x,mouse.r.y))
		figur.alone -= decf(figur.alone, figur.friendliness);
	
	dbTxt(7,figur.state_name(figur.state) + ' : ' + figur.framenum);
	dbTxt(9,'position: '+figur.r.toString());
	dbTxt(10,'vel: '+totXV+', '+figur.v.y);
	dbTxt(11,(figur.active?'ACTIVE':'INACTIVE')+'  '+(figur.animate?'ANIMATE':'STILL')+' ticks: '+tickSpeed);
	dbTxt(12,figur.hurt+' >> '+figur.recoveryTime);
	dbTxt(15,figur.airborne?'ON AIR':'ON GROUND');
}

// Should extend to include platforms
function detTop(figu) {
	var H = window.innerHeight;
	var h = H-figu.cssNumber("height");
	var t = figur.r.y;

	var newTop = t+figur.v.y;

	// ON OR UNDER GROUND
	if(newTop >= h) {
		// Hit the ground...
		if (figur.state == figur.ff.fall || figur.state == figur.ff.beginfall)
			figur.hitFloor();
		// Was dragged there?
		else if (figur.state == figur.ff.dragged)
			figur.setIdle();
		figur.animate = 1;
		figur.airborne = 0;
		figur.v.y = 0;
		figur.r.y = h;
		return h;
	}
	// IN AIR???
	else {
		var st = figur.state;
		figur.dirsign(figur.activevx+figur.v.x);
		// GOING DOWN AND NOT FALLING OR BEGINNING TO FALL
		// Begin the whole falling thing
		if (figur.v.y>0 && st!=figur.ff.fall && st!=figur.ff.beginfall)
			figur.beginfall();
		// Stay floaty!
		figur.airborne = 1;
		figur.r.y = newTop;
		return Math.floor(figur.r.y);
	}
}

function detLeft(figu) {
	// Determine activeXVel
	figur.activevx = figur.xVelbase * figur.mouseDistFactor();

	// Determine new x
	figur.r.x += figur.v.x + figur.activevx;

	// Bounce against L
	if (figur.r.x < 0) {
		if (figur.v.x < 33)
			figur.hurt -= figur.v.x/33;
		figur.v.x *= figur.v.x >= 0 ? 0.9 : -0.9;
	}
	// Bounce against R
	if (figur.r.x + figu.cssNumber("width") > window.innerWidth) {
		if (figur.v.x > 33)
			figur.hurt += figur.v.x/33;
		figur.v.x *= figur.v.x >= 0 ? -0.9 : 0.9;
	}

	return Math.floor(figur.r.x);
}

function inBounds(o, x, y) {
	var d = " < ";
	dbTxt(2,o.getLB()+d+x+d+o.getRB());
	dbTxt(3,o.getTB()+d+y+d+o.getBB());
	return between(x,o.getLB(),o.getRB()) && between(y,o.getTB(),o.getBB());
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

var figur = {
	elem: new cssdiv("#figure"),

	initialize: function() {
		this.elem = new cssdiv("#figure");
		this.elem.setTop(0);
		this.r = new vec2(this.elem.getLeft(), this.elem.getTop());
		this.state = this.ff.idle;
	},

	// Position
	r: new vec2(0,0),

	// My movement
	activevx: 0,
	xVelbase: 0,

	// Forces do not come from within the system
	v: new vec2(0,0),

	// Ticks since last looked for mouse
	alone: 0,
	dir: 0,
	stopAnim: 0,
	dragged: 0,
	airborne: 1,
	active: 1,
	recoveryTime: 1,
	hurt: 0,
	animate: 1,
	friendliness: 10,
	down: 0,

	maxAllowV: 20,

	// Mouse offset
	mOff: new vec2(0,0),

	// Angle down from vertical border
	// Or up from horizontal border
	fov_angle: Math.PI / 12,

	// Animation variables
	framenum: 0,

	// Totals
	dim: new vec2(150, 150),

	// White space
	fr_xMargin: 25,
	fr_topMargin: 0,

	ff: {
		idle: [[0,0],[1,0],[2,0],[3,0]],
		seek: [[3,1],[3,1],[4,1],[4,1],[4,1],[4,1],[3,1],[3,1],[3,1]],
		turn: [[3,0],[3,0],[3,0],[3,0],[4,0],[4,0],[4,0],[4,0],[4,0]],
		tocen: [[5,0],[4,0],[3,0]],
		tosid: [[3,0],[4,0],[5,0]],
		walk: [[5,0],[0,1],[1,1],[2,1]],
		dragged: [4,1],
		fall: [[5,1],[0,2]],
		floor: [[1,2],[2,2],[2,2],[3,2]],
		beginfall: [[3,3],[4,3],[5,3],[3,2],[2,2],[1,2],[1,2]],
		sleep: [[3,2]],
		rise: [[4,2],[4,2],[5,2],[5,2],[5,2],[5,2]],
		prepjumpup: [[0,3]],
		jumpup: [[1,3]],
		prepjumpside: [[2,3]],
		jumpside: [[3,3]]
	},

	state: 0,

	is: (st) => figur.state === st,

	tick: function() {
		if (!this.dragged) {

			// Update image
			if (this.animate)
				this.elem.e.css('background-position', getFrame(this));
			
			if (!this.airborne && this.active) {
				if ((this.is(this.ff.idle) && chance(this.alone, 80)) || this.is(this.ff.walk))
					this.seekMouse();
				else
					this.alone++;
			}
		}
		dbTxt(6,'time: '+this.alone);
		dbTxt(8,'direction: '+this.dir);
	},

	getLB: function() {return this.elem.getLeft()  +this.fr_xMargin},
	getRB: function() {return this.elem.getRight() -this.fr_xMargin},
	getTB: function() {return this.elem.getTop()   +this.fr_topMargin},
	getBB: function() {return this.elem.getBottom()},

	seekMouse: function() {
		// Important sides
		var L = this.getLB();
		var R = this.getRB();
		var T = this.getTB();

		// Where is the mouse?
		if (!between(mouse.r.x, L, R)) {
			var goDir = mouse.r.x > R ? 1 : -1;
			var xdiff = mouse.r.x > R ? mouse.r.x-R : L-mouse.r.x;
			var angle = Math.atan2(T-mouse.r.y, xdiff);
			var hiangle = (Math.PI/2) - this.fov_angle;

			// in sideview FOV
			if (angle < this.fov_angle) {
				if (this.is(this.ff.idle))
					this.seek(goDir,0,xdiff,goDir);
				else
					this.setWalk(goDir,0);
			}
			// Seek up only - in upper FOV BUT IT IS NOT QUITE NOT
			else if (angle > hiangle)
				this.seek(0,1,xdiff,goDir);
			// Seek up and left
			else
				this.seek(goDir,1,xdiff,goDir);
		}
		// Mouse is DIRECTLY above
		else if (mouse.r.y < T)
			this.seek(0,1,0,0);
		// Mouse is touching
		else {
			this.changeDir(0);
			this.alone = 0;
			this.hurt -= decf(this.hurt, 0.2);
		}
	},

	mouseDistFactor: function() {
		return 1+(2*(mouse.r.x>this.getLB()?
			mouse.r.x-this.getLB():this.getLB()-mouse.r.x)/window.innerWidth);
	},


	// Seek the mouse. Transition from idle into an active state.
	seek: function(xDir, lookUp, xdiff, isRight) {
		// If we are going to some side
		if (xDir != 0) {
			// If upwards, prep a jump
			if (lookUp)
				this.prepJump(xDir,xdiff,isRight);
			// Prep walk
			else
				this.setSeekHoriz(xDir);
		}
		// Prep up
		else if (lookUp) {
			// Chance of prep jump
			if (chance(this.alone, 100))
				this.prepJump(0,xdiff,isRight);
			// Otherwise just look up
			else
				this.setSeekUp();
		}
	},

	setIdle: function() {
		this.stop();
		this.state = this.ff.idle;
		this.active = 1;
		this.xVelbase = 0;
		if (tickSpeed != tickSpeed_default)
			updateTicks(tickSpeed_default);
	},

	setSeekUp: function() {
		this.stop();
		this.state = this.ff.seek;
		this.xVelbase = 0;
		this.alone -= decf(this.alone, 5);
		queue("figur.setIdle()", this.ff.seek.length+1, 0);
	},

	setSeekHoriz: function(dir) {
		this.resetAnim();
		this.state = this.ff.turn;
		this.dir = dir;
		queue("figur.setWalk("+dir+",1)", this.ff.turn.length, 0);
	},
	
	changeDir: function(dir) {
		this.activevx = 0;
		this.xVelbase = 0;
		// Turn left
		if (this.dir > dir) { 
			updateTicks(tickSpeed_default/2);
			this.framenum = 0;
			this.dir--;

			if (this.dir == 0) {
				dbTxt(5, "R > M");
				this.state = this.ff.tocen;
				queue("figur.changeDir("+dir+")", this.state.length, 0);
			}
			else if (this.dir == -1) {
				dbTxt(5, "M > L");
				this.state = this.ff.tosid;
				queue("figur.setWalk("+dir+",1)", this.state.length, 0);
			}
		}
		else if (this.dir < dir) { // Turn right
			updateTicks(tickSpeed_default/2);
			this.framenum = 0;
			this.dir++;

			if (this.dir == 0) {
				dbTxt(5, "L > M");
				this.state = this.ff.tocen;
				queue("figur.changeDir("+dir+")", this.state.length, 0);
			}
			else if (this.dir == 1) {
				dbTxt(5, "M > R");
				this.state = this.ff.tosid;
				queue("figur.setWalk("+dir+",1)", this.state.length, 0);
			}		
		}
		// No turning necessary
		else {
			updateTicks(tickSpeed_default);
			dbTxt(5,dir != 0 ?"DONE TURNING":"RETURNED");
			if (dir != 0)
				this.setWalk(dir,1);
			else
				this.setIdle();
		}
	},

	setWalk: function(dir, init) {
		if (this.dir != dir)
			return this.changeDir(dir);
		updateTicks(tickSpeed_default);
		if (init)
			this.framenum = 0;
		this.state = this.ff.walk;
		this.xVelbase = dir * 1.0*(this.alone/40);
	},

	sleep: function() {
		this.state = this.ff.sleep;
		this.active = 0;
		this.animate = 0;
		if (this.recoveryTime != Infinity)
			queue("figur.rise()", 1+this.recoveryTime, 0);
	},

	// Prepare a jump
	prepJump: function(dir, xdiff, mousedir) {
		this.dir = mousedir;
		this.activevx = 0;
		this.xVelbase = 0;

		var T = this.getTB();
		var h = this.elem.getHeight() - this.fr_topMargin;
		// Jump! How high? Yes, that's how to follow this
		var vert = T - (mouse.r.y - (h/2));
		
		// Do the needful and jumpings speed now
		var jump_vy = -Math.sqrt(2*gravity*vert);

		// Mistargeting
		jump_vy *= 1 - (Math.random() * 0.3);

		// Fatigue
		if (jump_vy > this.maxAllowV)
			jump_vy *= 0.8 - (Math.random() * 0.4);

		// Straight up
		if (Math.abs(xdiff) < 0.5) {
			// Safe or desperate
			if (jump_vy < this.maxAllowV || chance(this.alone-50, 500)) {
				this.active = 0;
				dbTxt(13,"vert jump vy: "+jump_vy);
				this.state = dir == 0 ? this.ff.prepjumpup : this.ff.prepjumpside;
				queue("figur.jump(0,"+jump_vy+")", 1-Math.ceil(jump_vy/10),0);
			}
			// Noooope
			else
				this.setSeekUp();
		}
		// Jump side
		else {
			// Set direction
			this.dir = dir;
			
			var jump_vx = mousedir*(xdiff*1.0)/(-jump_vy / gravity);

			if (jump_vx > this.maxAllowV)
				jump_vx *= 0.8 - (Math.random() * 0.4);

			var v_abs = Math.sqrt(jump_vy*jump_vy + jump_vx*jump_vx);

			// Safe or desperate
			if ((jump_vy < this.maxAllowV && Math.abs(jump_vx) < this.maxAllowV) || chance(this.alone-50, 500)) {
				this.state = dir == 0 ? this.ff.prepjumpup : this.ff.prepjumpside;
				this.active = 0;
				dbTxt(13,"side jump vx: "+jump_vx+", vy: "+jump_vy);
				queue("figur.jump("+jump_vx+","+jump_vy+")", 1+Math.ceil(v_abs/10),0);
			}
			// I... REFUSE!
			else {
				if (this.state != this.ff.walk)
					this.setSeekHoriz(dir);
				else
					this.setWalk(dir, 0);
			}
		}
	},

	jump: function(vx, vy) {
		this.v.set(vx, vy);
		this.state = vx == 0 ? this.ff.jumpup : this.ff.jumpside;
	},

	beginfall: function() {
		var st = this.state;
		var ws = (this.is(this.ff.sleep) || this.down) && (st != this.ff.jumpside || st != this.ff.jumpup);
		this.state = this.ff.beginfall;	
		this.framenum = ws ? 3 : 0;
		this.animate = 1;
		updateTicks(100);
		queue("figur.fall()", this.state.length-this.framenum, 0);
	},

	fall: function() {
		this.state = this.ff.fall;
		this.framenum = randInt(this.ff.fall.length);
		this.setSprite(this.ff.fall[this.framenum]);
		this.animate = 0;
		this.active = 0;
		updateTicks(tickSpeed_default);
	},

	// Only called when state is fall or beginfall
	hitFloor: function() {
		var beginfall = this.is(this.ff.beginfall);
		this.active = 0;
		updateTicks(tickSpeed_default);

		// Didn't start falling enough
		if (beginfall && this.framenum < 3) {
			updateTicks(tickSpeed_default/2);
			this.state = this.ff.rise;
			switch (this.framenum) {
				case 2:	this.framenum = 0;	break;
				case 1:	this.framenum = 3;	break;
				case 0:	this.framenum = 5;	break;
			}
			queue("figur.setIdle()", this.state.length-this.framenum, 0);
		}
		// Completely falling or at least going to collapse
		else {
			this.state = this.ff.floor;

			if (beginfall)
				this.framenum = 6 - this.framenum;
			else
				this.framenum = 0;
			
			// DEADDDDDDDDDd
			if (this.recoveryTime == Infinity)
				this.setSprite(this.ff.sleep);
			// Not dead - calculate recovery time
			else {
				this.recoveryTime=(randInt(2)+this.v.y/2+this.hurt)/2;
		
				if(this.v.y > 33)
					this.hurt += (this.v.y/15);
				if (this.hurt > 50)
					this.die();
			}
			queue("figur.sleep()",this.state.length-this.framenum,-2*tickSpeed/3);
		}
	},

	rise: function() {
		this.animate = 1;
		this.framenum = 0;
		this.state = this.ff.rise;
		queue("figur.setIdle()", this.state.length, 0);
	},

	stop: function() {
		this.resetAnim();
		this.dir = 0;
	},

	resetAnim: function() {
		this.framenum = 0;
		this.activevx = 0;
	},

	mouseDown: function(mx, my) {
		this.dragged = 1;
		var st = this.state;

		// If we are standing, set to closed-eye face
		if (this.isStanding()) {
			this.setSprite(this.ff.dragged);
			this.down = 0;
		}
		// If we are not standing, we could be
		// RISE
		else if (st == this.ff.rise)
			this.setSprite(this.ff.rise[0]);
		// SLEEP
		else if (st != this.ff.fall && (st == this.ff.sleep || this.down || st == this.ff.floor)){
			this.setSprite(this.ff.sleep[0]);
			this.down = 1;
		}
		// FALL
		else if (st == this.ff.fall) {
			this.setSprite(this.ff.fall[this.framenum]);
		}
		// BEGINFALL
		else if (st == this.ff.beginfall) {
			if (this.framenum > 4)
				this.setSprite(this.ff.beginfall[5]);
			else if (this.framenum > 2)
				this.setSprite(this.ff.sleep[0]);
			else
				this.setSprite(this.ff.rise[0]);
		}
		// ???
		else
			this.setSprite(this.ff.rise[0]);

		// Set appropriate state if not already falling
		if (st != this.ff.fall)
			this.state = this.recoveryTime != Infinity ?this.ff.dragged:this.ff.sleep;
		else
			this.state = this.ff.fall;

		// Set offsets
		this.mOff.x = mx - this.elem.e.cssNumber('left');
		this.mOff.y = my - this.elem.e.cssNumber('top');
		this.elem.e.removeClass('mass');
		this.v.y = 0;
		dbTxt(11, this.mOff.x+'  ||  '+this.mOff.y);
		return false;
	},

	mouseUp: function() {
		if (this.dragged)
			this.v.set(mouse.v.x*0.8, mouse.v.y*0.8);
		this.dragged = 0;
		this.elem.e.addClass('mass');
	},

	setSprite: function(sprite) {
		var s = new vec2(sprite[0], sprite[1]);
		s.mulV(this.dim);
		s.mul(-1,-1);
		this.elem.e.css("background-position",s.toPx());
	},

	isStanding: function() {
		var st = this.state;
		var is = st == this.ff.idle || st == this.ff.seek || st == this.ff.turn || st == this.ff.tocen;
		is |= st == this.ff.tosid || st == this.ff.walk || st == this.ff.dragged;
		is |= st == this.ff.prepjumpside || st == this.ff.prepjumpup || st == this.ff.jumpside;
		is |= st == this.ff.jumpup;
		return is;
	},

	state_name: function(state) {
		if (this.recoveryTime === Infinity)
			return "DEAD";
		switch (state) {
			case this.ff.idle:			return "IDLE";
			case this.ff.seek:			return "SEEK UPWARDS";
			case this.ff.turn:			return "SEEK SIDEWAYS";
			case this.ff.walk:			return "WALK";
			case this.ff.fall:			return "FALLING";
			case this.ff.floor:			return "HITTING THE FLOOR";
			case this.ff.sleep:			return "SLEEP";
			case this.ff.tosid:			return "TURNING TO SIDE";
			case this.ff.tocen:			return "TURNING TO CENTER";
			case this.ff.rise:			return "RISING";
			case this.ff.dragged:		return "DRAGGED";
			case this.ff.beginfall:		return "BEGIN FALL";
			case this.ff.prepjumpside:	return "PREPARE SIDE JUMP";
			case this.ff.jumpside:		return "SIDE JUMP";
			case this.ff.prepjumpup:	return "PREPARE VERTICAL JUMP";
			case this.ff.jumpup:		return "VERTICAL JUMP";
		}
	},

	dirsign: function(val) {
		this.dir = Math.sign(val);
	},

	forceflip: function(val) {
		if (val == 1)
			$("#figure").removeClass("flip");
		else if (val == -1)
			$("#figure").addClass("flip");
	},

	die: function() {
		this.setSprite(this.ff.sleep);
		// if (this.recoveryTime != Infinity)
			// alert('you are a monster.');
		$("#figure").text("DEAD.");
		this.animate = 0;
		this.hurt=Infinity;
		this.recoveryTime=Infinity;
	}

}
