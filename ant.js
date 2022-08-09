var width = 1000, height = 1000;
var PERIODBUFFERSIZE = 1000000;

var Screen = (function() {
	var canvas, ctx, img, data;
	var renderTime, frames;
	
	return {
		init: function() {
			canvas = document.getElementById('antcanvas');
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext('2d');
			img = ctx.createImageData(width,height);
			data = img.data;
			renderTime = 0;
			frames = 0;
		},
		render: function () {
			frames++;
			var startTime = performance.now();
			for(var i = 0,j=0,len=width*height*4; i < len; j++) {
				var state = Ant.getCell(j);
				data[i++] = Ant.getColors(state)[0];
				data[i++] = Ant.getColors(state)[1];
				data[i++] = Ant.getColors(state)[2];
				data[i++] = (state!=="0")*255;
			}
			ctx.putImageData(img,0,0);
			var endTime = performance.now();
			renderTime += (endTime-startTime)/1000;
			document.getElementById('rendertime').innerHTML=(endTime-startTime).toFixed(3)+" ms";	
			document.getElementById('iterations').innerHTML=Ant.getIterations().toLocaleString()+" iterations";
			document.getElementById('itps').innerHTML=Ant.getItps().toLocaleString()+" iterations/s";	
		},
		getRenderTime: function() { return renderTime; },
		getFrameTime: function() { return renderTime/frames; },
		getContext: function() { return ctx; },
		getRaster: function() { return data; }
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
		renderType: function() { return document.getElementById("rendertype").value; },
		sliceDepth: function() { return parseInt(document.getElementById("slice").value); },
		sliceSize: function() { return parseInt(document.getElementById("slicesize").value); }
	}
})();

var Ant = (function() {
	var x, y, dir, index;
	const directionx =[0,1,0,-1], directiony = [-1,0,1,0], directioni = [-width,1,width,-1];
	var map = new Array(width*height);
	var colors;
	var turn;
	var _rule, ruleString, size;
	var iterations;
	var time;
	var states = new Array(PERIODBUFFERSIZE);
	
	function getDirs(rule) {
		return rule.toString(2).split("").map(e=>[3,1][e]).reverse();
	}

	function genColors() {
		colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))));
	}

	return {
		init: function (rule) {
			// have variable rule in main function
			x = width/2;
			y = height/2;
			map.fill("0");
			dir = 0;
			turn = getDirs(rule);
			_rule = rule;
			ruleString = turn.map(e=>" R L"[e]).join("");
			document.getElementById("rulestring").innerHTML = ruleString + " (" + rule + ")";
			size = turn.length;
			genColors();
			index = x+y*width;	
			iterations = 0, time = 0;	
		},
		simulateAnt: function() {
			var stop = false;
			var startTime = performance.now();
			for(var max = iterations + Settings.getItpf(); iterations < max;) {
				// HORIZONTAL MOVEMENT
				dir = (dir+turn[map[index]])&3;
				if(++map[index]==size) map[index] = 0;
				states[iterations++%PERIODBUFFERSIZE] = (map[index]<<8) | dir;
				x += directionx[dir];
				index += directioni[dir];
				if(x < 0 || x >= width) {
					stop = true;
					break;
				}
				// VERTICAL MOVEMENT
		                dir = (dir+turn[map[index]])&3;
		                map[index]++;
		                if(map[index]==size) map[index] = 0;
		                states[(iterations++)%PERIODBUFFERSIZE] = (map[index]<<8) | dir;
				y += directiony[dir];
		                index += directioni[dir];
				if(y < 0 || y >= height) {
					stop = true;
					break;
				}
			}
			var endTime = performance.now();
			time += (endTime-startTime)/1000;
			return !stop;	
		},
		getColors: function(i) { return colors[i]; },
		getMap: function(i) { return map; },
		getCell: function(i) { return map[i]; },
		getIterations: function() { return iterations; },
		getTime: function() { return time; },
		getItps: function() { return iterations/time; },
		getRule: function() { return _rule; },
		changeColor: function() { genColors(); },
		getStates: function() { return states; },
		getPeriodSize: function(v) { var x=0,y=0; v.forEach(e=>{x+=directionx[e&255];y+=directiony[e&255];}); return [x,y];}
	}
})();

function getPeriod(a) {
	var period = [a[0]];
	var p = 1;
	var m = 0;
	var maxperiod = a.length/1.1;
    	while(m <= 1.1*p || m < 200) {
		if(p > maxperiod || m > a.length) return -1;
		if(period[m%p]==a[m]) m++;
		else {
			period.push(a[p]);
			m = p++;
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
	
	document.getElementById("period").innerHTML = "";
	document.getElementById("highwaysize").innerHTML = "";
	
	loop(0);
}

function loop(time) {
	if(Ant.simulateAnt()) {
		frameid = window.requestAnimationFrame(loop);
	} else {
		var v = Ant.getStates().slice(Ant.getIterations()%PERIODBUFFERSIZE).concat(Ant.getStates().slice(0,Ant.getIterations()%PERIODBUFFERSIZE)).reverse();
		document.getElementById("period").innerHTML = "Finding period...";
		var p = getPeriod(v);
		if(p==-1) document.getElementById("period").innerHTML = "Period not found";
		else {
			document.getElementById("period").innerHTML = "Period: " + p[0];
			document.getElementById("highwaysize").innerHTML = "Highway size: " + p[1].map(x=>Math.abs(x)).join("x");		
		}
	}
	Screen.render();
}

function changeColor() {
	Ant.changeColor();
	Screen.render();
}
