var D=0,
G=0.8,
TS=200,
TSD=200,
F=0.05,
Q=null,
iG=setInterval("AP()",20),
iT=setInterval("f.t()",TS),
M={r:new V2(window.innerWidth/2,window.innerHeight/2),v:new V2(0,0)},
V={s:function(V,W){return new V2(V.x+W.x,V.y+W.y)},d:function(V,W){return new V2(V.x-W.x,V.y-W.y)}};
function V2(x,y){
this.x=x;this.y=y;
this.a=function(X,Y){this.x+=X;this.y+=Y;}
this.s=function(X,Y){this.x-=X;this.y-=Y;}
this.m=function(X,Y){this.x*=X;this.y*=Y;}
this.s=function(X,Y){this.x=X;this.y=Y;}
this.va=function(V){this.a(V.x,V.y)};
this.vs=function(V){this.s(V.x,V.y)};
this.vm=function(V){this.m(V.x,V.y)};
this.vs=function(V){this.s(V.x,V.y)};
this.S=function(){return '('+this.x+','+this.y+')'};
this.P=function(){return this.x+'px '+this.y+'px'};
}
function cd(s){
this.e=$(s);
this.L=function(){return this.e.CN('left')};
this.T=function(){return this.e.CN('top')};
this.W=function(){return this.e.CN('width')};
this.H=function(){return this.e.CN('height')};
this.R=function(){return this.L()+this.W()};
this.B=function(){return this.T()+this.H()};
this.sL=function(l){this.e.css('left',L+'px')};
this.sT=function(T){this.e.css('top',T+'px')};
}
function UT(n){TS=n;clearInterval(iT);iT=setInterval("f.t()",TS);}
function QQ(n,t,o){
clearTimeout(Q);
Q=setTimeout(n,t*TS+o);
}
function RI(M){return Math.floor(Math.random()*M);}
function CH(n,d){return RI(d)<n;}
function TR(v,r){return v>r?1:v<-r?-1:0;}
function BT(v,m,M){return v>m&&v<M;}
function DF(i,a){return i<=a?i:a;}
function DT(n,t){if(D)$('#debug'+n).text(t);}
jQuery.fn.CN=function(p){var v=parseInt(this.css(p),10);return isNaN(v)?0:v;}
function GF(o){
	if(o.D==1)o.E.e.removeClass("flip");
	else if(o.D==-1)o.E.e.addClass("flip");
	var st=o.S[o.FN];
	while(st==undefined){o.FN--;st=o.S[o.FN];}
	var x=st[0]*-o.dim.x;
	var y=st[1]*-o.dim.y;
	if(++o.FN>=o.S.length)o.FN-=o.sta?1:o.FN;
	if(x!=0)x=x+'px';
	if(y!=0)y=y+'px';
	return x+' '+y;
}
function AP() {
	var massed = $('.mass');
	if (!f.drg) {
		f.v.y += G;
		var newTop = dT(massed);
		var newLeft = dL(massed);
		massed.css("top",newTop - $(document).scrollTop() + 'px');
		massed.css("left",newLeft+'px');
	}
	if (!f.air) {
		var xv = f.v.x*1.0;
		var C = 1-F;
		f.v.x = xv > 0 ? Math.floor(C*xv) : Math.ceil(C*xv);
	}
	var U = f.avx+f.v.x;
	if (inb(f,M.r.x,M.r.y))
		f.alo -= DF(f.alo, f.fdl);
	DT(7,f.stn(f.S) + ' : ' + f.FN);
	DT(9,'position: '+f.r.S() + '\n' + f.E.L() + ' ' + f.E.T());
	DT(10,'vel: '+U+', '+f.v.y);
	DT(11,(f.atv?'ACTIVE':'INACTIVE')+'  '+(f.ani?'ANIMATE':'STILL')+' ticks: '+TS);
	DT(12,f.H+' >> '+f.rct);
	DT(13,$(document).scrollTop());
	DT(15,f.air?'ON AIR':'ON GROUND');
}
function dT(e) {
	var H = ($(document).scrollTop()) + window.innerHeight;
	var h = H-e.CN("height");
	var t = f.r.y;
	var newTop = t+f.v.y;
	if(newTop >= h)
		return f.grn(h);
	else {
		f.ds(f.avx+f.v.x);
		if (f.v.y>0 && f.S!=f.ff.fal && f.S!=f.ff.bgf)
			f.bgf();
		f.air = 1;
		f.r.y = newTop;
		return Math.floor(f.r.y);
	}
}
function dL(e) {
	f.avx = f.xvb * f.MDF();
	f.r.x += f.v.x + f.avx;
	if (f.r.x < 0) {
		if (f.v.x < 33)
			f.H -= f.v.x/33;
		f.v.x *= f.v.x >= 0 ? 0.9 : -0.9;
	}
	if (f.r.x + e.CN("width") > window.innerWidth) {
		if (f.v.x > 33)
			f.H += f.v.x/33;
		f.v.x *= f.v.x >= 0 ? -0.9 : 0.9;
	}
	return Math.floor(f.r.x);
}
function inb(o, x, y) {
	var d = " < ";
	DT(2,o.gLB()+ d +x+ d +o.gRB());
	DT(3,o.gTB()+ d +y+ d +o.gBB());
	return BT(x,o.gLB(),o.gRB()) && BT(y,o.gTB(),o.gBB());
}
var f={
	E:new cd("#figure"),
	ini:function(){
		this.E=new cd("#figure");
		this.E.sT(0);
		this.r=new V2(this.E.L(),this.E.T()+$(document).scrollTop());
		this.S=this.ff.idl;
	},
	r:new V2(0,0),
	avx:0,
	xvb:0,
	v:new V2(0,0),
	dwn:0,
	alo:0,
	sta:0,
	drg:0,
	air:1,
	atv:1,
	rct:1,
	ani:1,
	fdl:10,
	mxv:20,
	D:0,
	H:0,
	mof:new V2(0,0),
	fov:Math.PI/12,
	FN:0,
	dim:new V2(150,150),
	mrx:25,
	mrt:0,
	ff:{
		idl:[[0,0],[1,0],[2,0],[3,0]],
		sek:[[3,1],[3,1],[4,1],[4,1],[4,1],[4,1],[3,1],[3,1],[3,1]],
		trn:[[3,0],[3,0],[3,0],[3,0],[4,0],[4,0],[4,0],[4,0],[4,0]],
		toc:[[5,0],[4,0],[3,0]],
		tos:[[3,0],[4,0],[5,0]],
		wlk:[[5,0],[0,1],[1,1],[2,1]],
		drg:[4,1],
		fal:[[5,1],[0,2]],
		flr:[[1,2],[2,2],[3,2],[3,2]],
		bgf:[[3,3],[4,3],[5,3],[3,2],[3,2],[1,2],[1,2]],
		slp:[[3,2]],
		rse:[[4,2],[4,2],[5,2],[5,2],[5,2],[5,2]],
		pju:[[0,3]],
		jpu:[[1,3]],
		pjs:[[2,3]],
		jps:[[3,3]]
	},
	S:0,
	is:function(st){return f.S===st},
	t: function() {
		if (!this.drg) {
			if (this.ani)
				this.E.e.css('background-position', GF(this));
			if (!this.air && this.atv) {
				if ((this.is(this.ff.idl) && CH(this.alo, 80)) || this.is(this.ff.wlk))
					this.skm();
				else
					this.alo++;
			}
		}
		DT(6,'time: '+this.alo);
		DT(8,'direction: '+this.D);
	},

	gLB:function(){return this.E.L()+this.mrx},
	gRB:function(){return this.E.R()-this.mrx},
	gTB:function(){return this.E.T()+this.mrt+$(document).scrollTop()},
	gBB:function(){return this.E.B()+ $(document).scrollTop()},

	skm: function() {
		var L = this.gLB();
		var R = this.gRB();
		var T = this.gTB();
		if (!BT(M.r.x, L, R)) {
			var gd = M.r.x > R ? 1 : -1;
			var xd = M.r.x > R ? M.r.x-R : L-M.r.x;
			var an = Math.atan2(T-M.r.y, xd);
			if (an < this.fov) {
				if (this.is(this.ff.idl))
					this.sek(gd,0,xd,gd);
				else
					this.swk(gd,0);
			}
			else if (an > (Math.PI/2) - this.fov)
				this.sek(0,1,xd,gd);
			else
				this.sek(gd,1,xd,gd);
		}
		else if (M.r.y < T)
			this.sek(0,1,0,0);
		else {
			this.chd(0);
			this.alo = 0;
			this.H -= DF(this.H, 0.2);
		}
	},

	MDF: function() {return 1+(2*(M.r.x>this.gLB()?M.r.x-this.gLB():this.gLB()-M.r.x)/window.innerWidth);},

	sek: function(X, L, xd, R) {
		if (X != 0) {
			if (L)
				this.pjp(X,xd,R);
			else
				this.ssh(X);
		}
		else if (L) {
			if (CH(this.alo, 100))
				this.pjp(0,xd,R);
			else
				this.ssu();
		}
	},

	sid: function() {
		this.stp();
		this.S = this.ff.idl;
		this.atv = 1;
		this.xvb=0;
		if (TS!=TSD)UT(TSD);
	},

	ssu: function() {
		this.stp();
		this.S = this.ff.sek;
		this.xvb = 0;
		this.alo -= DF(this.alo, 5);
		QQ("f.sid()", this.ff.sek.length+1, 0);
	},

	ssh: function(D) {
		this.rsa();
		this.S = this.ff.trn;
		this.D = D;
		QQ("f.swk("+D+",1)", this.ff.trn.length, 0);
	},
	
	chd: function(D) {
		this.avx = 0;
		this.xvb = 0;
		if (this.D > D) { 
			UT(TSD/2);
			this.FN = 0;
			this.D--;
			if (this.D == 0) {
				DT(5, "R > M");
				this.S = this.ff.toc;
				QQ("f.chd("+D+")", this.S.length, 0);
			}
			else if (this.D == -1) {
				DT(5, "M > L");
				this.S = this.ff.tos;
				QQ("f.swk("+D+",1)", this.S.length, 0);
			}
		}
		else if (this.D < D){
			UT(TSD/2);
			this.FN = 0;
			this.D++;
			if (this.D == 0) {
				DT(5, "L > M");
				this.S = this.ff.toc;
				QQ("f.chd("+D+")", this.S.length, 0);
			}
			else if (this.D == 1) {
				DT(5, "M > R");
				this.S = this.ff.tos;
				QQ("f.swk("+D+",1)", this.S.length, 0);
			}		
		}
		else {
			UT(TSD);
			DT(5,D != 0 ?"DONE TURNING":"RETURNED");
			if (D != 0)
				this.swk(D,1);
			else
				this.sid();
		}
	},
	swk: function(D, init) {
		if (this.D != D)
			return this.chd(D);
		UT(TSD);
		if (init)
			this.FN = 0;
		this.S = this.ff.wlk;
		this.xvb = D * 1.0*(this.alo/40);
	},

	slp: function() {
		this.S = this.ff.slp;
		this.atv = 0;
		this.ani = 0;
		if (this.rct != Infinity)
			QQ("f.rse()", 1+this.rct, 0);
	},

	pjp: function(D, d, m) {
		this.D = m;
		this.avx = 0;
		this.xvb = 0;

		var jvy = this.gTB() - (M.r.y - ((this.E.H() - this.mrt)/2));

		jvy *= 2*G;
		
		jvy = -Math.sqrt(jvy);

		jvy *= (1 - (Math.random() * 0.3));

		if (jvy > this.mxv)
			jvy *= 0.8 - (Math.random() * 0.4);
		if (Math.abs(d) < 0.5) {
			if (jvy < this.mxv || CH(this.alo-50, 500)) {
				this.atv = 0;
				DT(13,"vert jmp vy: "+jvy);
				this.S = D == 0 ? this.ff.pju : this.ff.pjs;
				QQ("f.jmp(0,"+jvy+")", 1-Math.ceil(jvy/10),0);
			}
			else
				this.ssu();
		}
		else {
			this.D = D;
			var jvx = m*(d*1.0)/(-jvy / G);
			if (jvx > this.mxv)
				jvx *= 0.8 - (Math.random() * 0.4);
			var vbs = Math.sqrt(jvy*jvy + jvx*jvx);
			if ((jvy < this.mxv && Math.abs(jvx) < this.mxv) || CH(this.alo-50, 500)) {
				this.S = D == 0 ? this.ff.pju : this.ff.pjs;
				this.atv = 0;
				DT(13,"side jmp vx: "+jvx+", vy: "+jvy);
				QQ("f.jmp("+jvx+","+jvy+")", 1+Math.ceil(vbs/10),0);
			}
			else {
				if (this.S != this.ff.wlk)
					this.ssh(D);
				else
					this.swk(D, 0);
			}
		}
	},

	jmp: function(X, Y) {
		this.v.s(X, Y);
		this.S = X == 0 ? this.ff.jpu : this.ff.jps;
	},

	bgf: function() {
		var st = this.S;
		var ws = (this.is(this.ff.slp) || this.dwn) && (st != this.ff.jps || st != this.ff.jpu);
		this.S = this.ff.bgf;	
		this.FN = ws ? 3 : 0;
		this.v.x += this.xvb;
		this.xvb = 0;
		this.ani = 1;
		UT(2*TSD/3);
		QQ("f.fal()", this.S.length-this.FN, 0);
	},

	fal: function() {
		this.S = this.ff.fal;
		this.FN = RI(this.ff.fal.length);
		this.ssp(this.ff.fal[this.FN]);
		this.ani = 0;
		this.atv = 0;
		UT(TSD);
	},

	hfl: function() {
		var bgf = this.is(this.ff.bgf);
		this.atv = 0;
		UT(TSD);
		if (bgf && this.FN < 3) {
			UT(TSD/2);
			this.S = this.ff.rse;
			switch (this.FN) {
				case 2:	this.FN = 0;	break;
				case 1:	this.FN = 3;	break;
				case 0:	this.FN = 5;	break;
			}
			QQ("f.sid()", this.S.length-this.FN, 0);
		}
		else {
			this.S = this.ff.flr;
			if (bgf) this.FN = 6 - this.FN;
			else
				this.FN = 0;
			if (this.rct == Infinity)
				this.ssp(this.ff.slp);
			else {
				this.rct=(RI(2)+this.v.y/2+this.H)/2;
				if(this.v.y > 33)
					this.H += (this.v.y/15);
				if (this.H > 50)
					this.die();
			}
			QQ("f.slp()",this.S.length-this.FN,-2*TS/3);
		}
	},

	rse: function() {
		this.ani = 1;
		this.FN = 0;
		this.S = this.ff.rse;
		QQ("f.sid()", this.S.length, 0);
	},

	stp: function() {
		this.rsa();
		this.D = 0;
	},

	rsa: function() {
		this.FN = 0;
		this.avx = 0;
	},

	md: function(X, Y) {
		this.drg = 1;
		var st = this.S;
		if (this.iss()) {
			this.ssp(this.ff.drg);
			this.dwn = 0;
		}
		else if (st == this.ff.rse)
			this.ssp(this.ff.rse[2]);
		else if (st != this.ff.fal && (st == this.ff.slp || this.dwn || st == this.ff.flr)){
			this.ssp(this.ff.slp[0]);
			this.dwn = 1;
		}
		else if (st == this.ff.fal)
			this.ssp(this.ff.fal[this.FN]);
		else if (st == this.ff.bgf) {
			if (this.FN > 4)
				this.ssp(this.ff.bgf[5]);
			else if (this.FN > 2)
				this.ssp(this.ff.slp[0]);
			else
				this.ssp(this.ff.rse[2]);
		}
		else
			this.ssp(this.ff.rse[2]);
		if (st != this.ff.fal)
			this.S = this.rct != Infinity ?this.ff.drg:this.ff.slp;
		else
			this.S = this.ff.fal;
		this.mof.x = X - this.E.e.CN('left');
		this.mof.y = Y - this.E.e.CN('top');
		this.E.e.removeClass('mass');
		this.v.y = 0;
		DT(11, this.mof.x+'  ||  '+this.mof.y);
		return false;
	},

	mu: function() {
		if (this.drg)
			this.v.s(M.v.x*0.8, M.v.y*0.8);
		this.drg = 0;
		this.E.e.addClass('mass');
	},

	ssp: function(e) {
		var s = new V2(e[0], e[1]);
		s.vm(this.dim);
		s.m(-1,-1);
		this.E.e.css("background-position",s.P());
	},

	iss: function() {
		var st = this.S;
		var F = this.ff;
		var is = st == F.idl || st == F.sek || st == F.trn || st == F.toc;
		is |= st == F.tos || st == F.wlk || st == F.drg;
		is |= st == F.pjs || st == F.pju || st == F.jps;
		is |= st == F.jpu;
		return is;
	},

	stn: function(S) {
		var q=this.ff;
		if (this.rct === Infinity) return "DEAD";
		switch (S) {
		case q.idl:return "IDLE";
		case q.sek:return "SEEK UPWARDS";
		case q.trn:return "SEEK SIDEWAYS";
		case q.wlk:return "WALK";
		case q.fal:return "FALLING";
		case q.flr:return "HITTING THE FLOOR";
		case q.slp:return "SLEEP";
		case q.tos:return "TURNING TO SIDE";
		case q.toc:return "TURNING TO CENTER";
		case q.rse:return "RISING";
		case q.drg:return "DRAGGED";
		case q.bgf:return "BEGIN FALL";
		case q.pjs:return "PREPARE SIDE JUMP";
		case q.jps:return "SIDE JUMP";
		case q.pju:return "PREPARE VERTICAL JUMP";
		case q.jpu:return "VERTICAL JUMP";
		}
	},

	ds: function(val) {this.D=Math.sign(val);},

	ffl: function(val) {
		if (val == 1)
			$("#figure").removeClass("flip");
		else if (val == -1)
			$("#figure").addClass("flip");
	},

	die: function() {
		this.ssp(this.ff.slp);
		if (this.rct != Infinity)
			alert('you are a monster.');
		$("#figure").text("DEAD.");
		this.ani = 0;
		this.H=Infinity;
		this.rct=Infinity;
	},
	grn: function(h) {
		var st = this.S;
		var F = this.ff;
		if (st == F.fal || st == F.bgf || st == F.jps || st == F.jpu)
			this.hfl();
		else if (st == F.drg)
			this.sid();
		this.ani = 1;
		this.air = 0;
		this.v.y = 0;
		this.r.y = h;
		return h;
	},
	hid: false,
	hdt: function() {
		this.hid = !this.hid;
		this.E.e.css('visibility',this.hid?'hidden':'visible');
	}
}

$(document).ready(function() {
	f.ini();
	f.bgf();
	if ($('#testbed').length)D=1;
	$(this).keydown(function(e) {
		var ch = e.which;
		if ($('.debug *').length) {
			if (ch == 68) {
				e.preventDefault();
				if(e.which==68){
					if(D){D=0;$('.debug *').text('');}
					else D=1;
				}
			}
		}
	});
});

document.onmousemove = function(e){
	M.v.s(e.pageX-M.r.x, e.pageY-M.r.y);
	M.r.s(e.pageX, e.pageY);

	if (f.drg) {

		var N = V.d(M.r, f.mof);

		f.ffl(TR(M.v.x, 5));

		$('#figure').css({
			'top': N.y+'px',
			'left': N.x+'px'
		});

		N.y += $(document).scrollTop();
		f.r.vs(N);
		DT(4, 'DRAG @@ '+N.S()+' X> '+f.mof.S());
	}
	DT(1, M.r.S()+' ** '+M.v.S());
}

document.onmousedown = function(e){
	if (inb(f,e.pageX,e.pageY)) {
		DT(4, "ON");
		clearTimeout(Q);
		f.md(e.pageX, e.pageY);
	}
	else
		DT(4, "OFF");
}

document.onmouseup=function(e){DT(4,"OFF");f.mu();}