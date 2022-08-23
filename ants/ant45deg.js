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
				data[i++] = 255;
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

var Ant = (function() {
	var x, y, dir, index;
	const directionx =[0,1,1,1,0,-1,-1,-1], directiony = [-1,-1,0,1,1,1,0,-1], directioni = [-width,-width+1,1,width+1,width,width-1,-1,-width-1];
	var map = new Uint8Array(width*height);
	var colors;
	var turn;
	var _rule, ruleString, size;
	var iterations;
	var time;
	var states = new Array(PERIODBUFFERSIZE);
	
	function getDirs(rule) {
		var array = [parseInt(rule%4n)+1];
		rule = rule/4n;
		while(rule!=0n) {
			array.push(parseInt(rule%8n));
			rule = rule/8n;
		}
		return array;
	}

	function genColors() {
		colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))));
	}

	return {
		init: function (rule) {
			x = width/2;
			y = height/2;
			map.fill(0); // "0" for transparency, twice as slow
			dir = 0;
			turn = getDirs(rule);
			_rule = rule;
			ruleString = turn.map(e=>"FfRrBbLl"[e]).join("");
			document.getElementById("rulestring").innerHTML = ruleString + " (" + rule + ")";
			size = turn.length;
			genColors();
			index = x+y*width;	
			iterations = 0, time = 0;	
		},
		simulateAnt: function(steps) {
			var stop = false;
			var startTime = performance.now();
			for(var max = iterations + steps; iterations < max;) {
				dir = (dir+turn[map[index]])&7;
				if(++map[index]==size) map[index] = 0;
				states[iterations++%PERIODBUFFERSIZE] = (map[index]<<8) | dir;
				x += directionx[dir];
				y += directiony[dir];
				index += directioni[dir];
				if(x < 0 || y < 0 || x >= width || y >= height) {
					stop = true;
					break;
				}
			}
			var endTime = performance.now();
			time += (endTime-startTime)/1000;
			return !stop;	
		},
		simulateBackwards: function() {
			for(var i = 0, it = iterations; it > 0 && i < PERIODBUFFERSIZE; i++, it--) {
				index -= directioni[dir];
				x -= directionx[dir];
				y -= directiony[dir];
				states[i] = (map[index]<<8) | dir;
				if(--map[index]<0) map[index] = size-1;
				dir = (dir-turn[map[index]])&7;
			}
			return getPeriod(states);	
		},
		getColors: function(i) { return colors[i]; },
		getMap: function(i) { return map; },
		getCell: function(i) { return map[i]; },
		getIterations: function() { return iterations; },
		getTime: function() { return time; },
		getItps: function() { return iterations/time; },
		getRule: function() { return _rule; },
		recolor: function() { genColors(); },
		getStates: function() { return states; },
		getPeriodSize: function(v) { var x=0,y=0; v.forEach(e=>{x+=directionx[e&255];y+=directiony[e&255];}); return [x,y];}
	}
})();