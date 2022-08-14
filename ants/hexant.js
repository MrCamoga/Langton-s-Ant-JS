var width = 1200, height = 1200;
var PERIODBUFFERSIZE = 1000000;

var Screen = (function() {
	var canvas, ctx, img, data, buffer, bufferctx;
	var renderTime, frames;
	
	return {
		init: function() {
			canvas = document.getElementById('antcanvas');
			ctx = canvas.getContext('2d');
			ctx.canvas.width = width*1.5;
			ctx.canvas.height = height;
			img = ctx.createImageData(width,height);
			data = img.data;
			renderTime = 0;
			frames = 0;

			buffer = document.createElement('canvas');
			buffer.width = width;
			buffer.height = height;

			bufferctx = buffer.getContext('2d');
			bufferctx.createImageData(width,height);
			ctx.transform(1, 0, 0.5, 1, 0, 0);
			ctx.imageSmoothingEnabled = false;
		},
		render: function () {
			frames++;
			var startTime = performance.now();
			for(var i = 0,j=0,len=width*height*4; i < len; j++) {
				var state = Ant.getMap(j);
				data[i++] = Ant.getColors(state)[0];
				data[i++] = Ant.getColors(state)[1];
				data[i++] = Ant.getColors(state)[2];
				data[i++] = (state!=="0")*255;
			}
			bufferctx.putImageData(img,0,0);
			ctx.drawImage(buffer,0,0);
			//ctx.beginPath(); ctx.rect(0,0,width,height); ctx.stroke();
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
	const 	directionx =[0,1,1,0,-1,-1], 
		directiony = [-1,-1,0,1,1,0],
		directioni = [-width,-width+1,1,width,width-1,-1];
	var map = new Array(width*height);
	var colors;
	var turn;
	var _rule, ruleString, size;
	var iterations;
	var time;
	var states = new Array(PERIODBUFFERSIZE);
	
	function getDirs(rule) {
		var array = [parseInt(rule%3n)+1];
		rule = rule/3n;
		while(rule!=0n) {
			array.push(parseInt(rule%6n));
			rule = rule/6n;
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
			map.fill('0');
			dir = 0;
			turn = getDirs(rule);
			_rule = rule;
			ruleString = turn.map(e=>"FRrBlL"[e]).join("");
			document.getElementById("rulestring").innerHTML = ruleString + " (" + rule + ")";
			size = turn.length;
			genColors();
			index = x+y*width;
			iterations = 0, time = 0;	
		},
		simulateAnt: function() {
			var stop = false;
			var startTime = performance.now();
			for(var max = iterations + Settings.getItpf(); iterations < max; iterations++) {
		                dir = (dir+turn[map[index]])%6;
		                if(++map[index]==size) map[index] = 0;
		                states[iterations%PERIODBUFFERSIZE] = (map[index]<<8) | dir;
				x += directionx[dir];
				y += directiony[dir];
		                index = x+y*width;
				if(x<0 || y < 0 || x >= width || y >= height) {
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
		recolor: function() { genColors(); },
		getStates: function() { return states; },
		getPeriodSize: function(v) { var x=0,y=0; v.forEach(e=>{x+=directionx[e&255];y+=directiony[e&255];}); return [x,y];}
	}
})();
