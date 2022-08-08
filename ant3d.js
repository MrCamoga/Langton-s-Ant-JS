var width = 300, height = 300, depth = 300;
var mul = [1,width,width*height];
var PERIODBUFFERSIZE = 1000000;

var Screen = (function() {
	var canvas, ctx, img, data;
	var renderTime, frames;
	
	return {
		init: function() {
			canvas = document.getElementById('antcanvas');
			ctx = canvas.getContext('2d');
			ctx.canvas.width = width;
			ctx.canvas.height = height;
			img = ctx.createImageData(width,height);
			data = img.data;
			renderTime = 0;
			frames = 0;
		},
		render: function () {
			frames++;
			var startTime = performance.now();
			var fog = Settings.drawFog();
			var sliceDepth = Settings.sliceDepth();
			var sliceSize = Settings.sliceSize();
			var min = sliceDepth, max = Math.min(sliceDepth+sliceSize,depth);
			for(var i = 0,j=0,len=mul[2]*4; i < len;j++) {
				var k=min, state=0, transparent=true;
				for(var cell=j+k*mul[2]; k < max; k++, cell += mul[2]) {
					if(Ant.getMap(cell) === "0") continue;
					state = Ant.getMap(cell);
					transparent = false;
					break;
				}
				data[i++] = Ant.getColors(state)[0];
				data[i++] = Ant.getColors(state)[1];
				data[i++] = Ant.getColors(state)[2];
				data[i++] = transparent ? 0:(fog ? (1-(k-min)/(max-min))*255 : 255);
			}
			ctx.putImageData(img,0,0);
			var endTime = performance.now();
			renderTime += (endTime-startTime)/1000;
			document.getElementById('rendertime').innerHTML=(endTime-startTime).toFixed(3)+" ms";	
			document.getElementById('iterations').innerHTML=Ant.getIterations().toLocaleString()+" iterations";
			document.getElementById('itps').innerHTML=Ant.getItps().toLocaleString()+" iterations/s";
		},
		getRenderTime: function() { return renderTime; },
		getFrameTime: function() { return renderTime/frames; }
	}
})();

var Settings = (function() {
	return {
		getItpf: function() {
			var value = document.getElementById("itpf").value;
			var itpf = Math.exp(value/100*Math.log(10000000));
			return Math.floor(itpf);
		},
		drawFog: function() { return document.getElementById("fog").checked; },
		sliceDepth: function() { return parseInt(document.getElementById("slice").value); },
		sliceSize: function() { return parseInt(document.getElementById("slicesize").value); }
	}
})();

var Ant = (function() {
	var x, y, z, dir, index, state;
	const	directionx = [1,0,0,0,0,-1,0,-1,0,1,0,0,0,0,-1,0,1,0,1,0,0,0,0,-1], 
		directiony = [0,0,-1,1,0,0,0,0,0,0,1,-1,1,-1,0,0,0,0,0,0,-1,1,0,0], 
		directionz = [0,1,0,0,-1,0,-1,0,1,0,0,0,0,0,0,-1,0,1,0,1,0,0,-1,0];
	const	directioni = [1,mul[2],-mul[1],mul[1],-mul[2],-1,-mul[2],-1,mul[2],1,mul[1],-mul[1],mul[1],-mul[1],-1,-mul[2],1,mul[2],1,mul[2],-mul[1],mul[1],-mul[2],-1];
	const 	transform = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,0,0,0,0,0,0,0,
			1,0,4,5,2,3,7,6,10,11,8,9,18,19,20,21,22,23,12,13,14,15,16,17,0,0,0,0,0,0,0,0,
			2,3,0,1,5,4,12,13,14,15,16,17,6,7,8,9,10,11,19,18,22,23,20,21,0,0,0,0,0,0,0,0,
			3,2,5,4,0,1,13,12,16,17,14,15,19,18,22,23,20,21,6,7,8,9,10,11,0,0,0,0,0,0,0,0,
			4,5,1,0,3,2,18,19,20,21,22,23,7,6,10,11,8,9,13,12,16,17,14,15,0,0,0,0,0,0,0,0,
			5,4,3,2,1,0,19,18,22,23,20,21,13,12,16,17,14,15,7,6,10,11,8,9,0,0,0,0,0,0,0,0,
			6,7,8,9,10,11,0,1,2,3,4,5,14,15,12,13,17,16,20,21,18,19,23,22,0,0,0,0,0,0,0,0,
			7,6,10,11,8,9,1,0,4,5,2,3,20,21,18,19,23,22,14,15,12,13,17,16,0,0,0,0,0,0,0,0,
			8,9,6,7,11,10,14,15,12,13,17,16,0,1,2,3,4,5,21,20,23,22,18,19,0,0,0,0,0,0,0,0,
			9,8,11,10,6,7,15,14,17,16,12,13,21,20,23,22,18,19,0,1,2,3,4,5,0,0,0,0,0,0,0,0,
			10,11,7,6,9,8,20,21,18,19,23,22,1,0,4,5,2,3,15,14,17,16,12,13,0,0,0,0,0,0,0,0,
			11,10,9,8,7,6,21,20,23,22,18,19,15,14,17,16,12,13,1,0,4,5,2,3,0,0,0,0,0,0,0,0,
			12,13,14,15,16,17,2,3,0,1,5,4,8,9,6,7,11,10,22,23,19,18,21,20,0,0,0,0,0,0,0,0,
			13,12,16,17,14,15,3,2,5,4,0,1,22,23,19,18,21,20,8,9,6,7,11,10,0,0,0,0,0,0,0,0,
			14,15,12,13,17,16,8,9,6,7,11,10,2,3,0,1,5,4,23,22,21,20,19,18,0,0,0,0,0,0,0,0,
			15,14,17,16,12,13,9,8,11,10,6,7,23,22,21,20,19,18,2,3,0,1,5,4,0,0,0,0,0,0,0,0,
			16,17,13,12,15,14,22,23,19,18,21,20,3,2,5,4,0,1,9,8,11,10,6,7,0,0,0,0,0,0,0,0,
			17,16,15,14,13,12,23,22,21,20,19,18,9,8,11,10,6,7,3,2,5,4,0,1,0,0,0,0,0,0,0,0,
			18,19,20,21,22,23,4,5,1,0,3,2,10,11,7,6,9,8,16,17,13,12,15,14,0,0,0,0,0,0,0,0,
			19,18,22,23,20,21,5,4,3,2,1,0,16,17,13,12,15,14,10,11,7,6,9,8,0,0,0,0,0,0,0,0,
			20,21,18,19,23,22,10,11,7,6,9,8,4,5,1,0,3,2,17,16,15,14,13,12,0,0,0,0,0,0,0,0,
			21,20,23,22,18,19,11,10,9,8,7,6,17,16,15,14,13,12,4,5,1,0,3,2,0,0,0,0,0,0,0,0,
			22,23,19,18,21,20,16,17,13,12,15,14,5,4,3,2,1,0,11,10,9,8,7,6,0,0,0,0,0,0,0,0,
			23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0,0];

	var map = new Array(width*height*depth);
	var colors;
	var turn;
	var _rule, ruleString, size;
	var iterations;
	var time;
	var states = new Array(PERIODBUFFERSIZE);
	
	function getDirs(rule) {
		return rule.toString(4).split("").map(e=>[13,10,17,22][e]).reverse();
	}

	function genColors() {
		colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))));
	}

	return {
		init: function (rule) {
			x = width/2;
			y = height/2;
			z = depth/2;
			map.fill("0");
			dir = Math.floor(Math.random()*24);
			turn = getDirs(rule);
			_rule = rule;
			ruleString = rule.toString(4).split("").map(e=>"RLUD"[e]).reverse().join("");
			document.getElementById("rulestring").innerHTML = ruleString + " (" + rule + ")";
			size = turn.length;
			genColors();
			index = x+y*width+z*width*height;
			iterations = 0, time = 0;
		},
		simulateAnt: function() {
			var stop = false;
			var startTime = performance.now();
			for(var max = iterations + Settings.getItpf(); iterations < max; iterations++) {
				dir = transform[(turn[map[index]]<<5)|dir];
		                if(++map[index]==size) map[index] = 0;
				states[iterations%PERIODBUFFERSIZE] = (map[index]<<8) | dir;
				x += directionx[dir];
		                y += directiony[dir];
				z += directionz[dir];
		                index += directioni[dir];
				if(x < 0 || y < 0 || z < 0 || x >= width || y >= height || z >= depth) {
					stop = true;
					break;
				}
			}
			var endTime = performance.now();
			time += (endTime-startTime)/1000;
			return !stop;	
		},
		getColors: function(i) { return colors[i]; },
		getMap: function(i) { return map[i]; },
		getIterations: function() { return iterations; },
		getTime: function() { return time; },
		getItps: function() { return iterations/time; },
		getRule: function() { return _rule; },
		getRuleString: function() { return ruleString; },
		changeColor: function() { genColors(); },
		getStates: function() { return states; },
		getPeriodSize: function(v) { var x=0,y=0,z=0; v.forEach(e=>{x+=directionx[e&255];y+=directiony[e&255];z+=directionz[e&255];}); return [x,y,z];}
	}
})();

function getPeriod(a) {
	var period = [a[0]];
	var p = 1;
	var m = 0;
	var maxperiod = a.length/1.1;
    	while(m <= 1.1*p && a.length > 0) {
		if(p > maxperiod) return -1;
		if(period[m%p]==a[m+p]) m++;
		else {
			period.push(a[p]);
			p++;
			m = 0;
    		}
	}
	var d = Ant.getPeriodSize(period);
	return [p,d];
}

frameid = 0;

function init(rule) {
	window.cancelAnimationFrame(frameid);
	Screen.init();
	Ant.init(rule);
	
	loop(0);
}

forwards = true

function loop(time) {
	if(Ant.simulateAnt()) {
		frameid = window.requestAnimationFrame(loop);
	} else {
		var v = Ant.getStates().slice(Ant.getIterations()%PERIODBUFFERSIZE+1).concat(Ant.getStates().slice(0,Ant.getIterations()%PERIODBUFFERSIZE+1)).reverse();
		console.log(getPeriod(v));
	}
	Screen.render();
}

function changeColor() {
	Ant.changeColor();
	Screen.render();
}
