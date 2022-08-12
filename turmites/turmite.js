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

var Ant = (function() {
	var x, y, dir, state, index;
	const directionx =[0,1,0,-1], directiony = [-1,0,1,0], directioni = [-width,1,width,-1];
	var map = new Array(width*height);
	var colors;
	var turn;
	var ruleString, size;
	var iterations;
	var time;
	var states = new Array(PERIODBUFFERSIZE);
	
	function genRandomRule(numstates,numcolors) { // make sure every color and every state is used
		turn = new Array(numstates).fill(0).map(()=>new Array(numcolors).fill(0).map(()=>[parseInt(Math.random()*numcolors),parseInt(Math.random()*4),parseInt(Math.random()*numstates)]));
		size = numcolors;
	}

	function genColors() {
		colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))));
	}

	return {
		init: function (rule) {
			// have variable rule in main function
			x = width/2;
			y = height/2;
			map.fill(0); // "0" slower but transparency
			dir = 0;
			state = 0;
			if(rule==-1) genRandomRule(4,2);
			else {
				turn = rule;
				size = rule[0].length;
			}
			
			genColors();
			index = x+y*width;	
			iterations = 0, time = 0;	
		},
		simulateAnt: function() {
			var stop = false;
			var startTime = performance.now();
			for(var max = iterations + Settings.getItpf(); iterations < max; iterations++) {
				var r = turn[state][map[index]];
				states[iterations%PERIODBUFFERSIZE] = ((state = r[2])<<16) | ((map[index] = r[0])<<8) | (dir = (dir+r[1])&3);
				x += directionx[dir];
				y += directiony[dir];
		                index += directioni[dir];
				if(x < 0 ||y < 0 || x >= width || y >= height) {
					stop = true;
					iterations++;
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
		getRule: function() { return turn; },
		recolor: function() { genColors(); },
		getStates: function() { return states; },
		getPeriodSize: function(v) { var x=0,y=0; v.forEach(e=>{x+=directionx[e&255];y+=directiony[e&255];}); return [x,y];}
	}
})();