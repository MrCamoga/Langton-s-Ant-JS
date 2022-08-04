var width = 1000, height = 1000;

var Screen = (function() {
	var canvas, ctx, img, data;
	var renderTime, frames;
	
	return {
		init: function() {
			canvas = document.getElementById('antcanvas');
			ctx = canvas.getContext('2d');
			img = ctx.createImageData(width,height);
			data = img.data;
			renderTime = 0;
			frames = 0;
		},
		render: function () {
			frames++;
			var startTime = performance.now();
			for(var i = 0,j=0; i < width*height*4; j++) {
				data[i++] = Ant.getColors(Ant.getMap(j))[0];
				data[i++] = Ant.getColors(Ant.getMap(j))[1];
				data[i++] = Ant.getColors(Ant.getMap(j))[2];
				data[i++] = 255;
			}
			ctx.putImageData(img,0,0);
			var endTime = performance.now();
			renderTime += (endTime-startTime)/1000;		
		},
		getRenderTime: function() { return renderTime; },
		getFrameTime: function() { return renderTime/frames; }
	}
})();

var Ant = (function() {
	var x, y, dir, index, state;
	const directionx =[0,1,0,-1], directiony = [-1,0,1,0];
	var map;
	var colors;
	var newdir;
	var ruleString, size;
	var iterations;
	var time;
	
	function getDirs(rule) {
		return rule.toString(2).split("").map(e=>[1,3][e]).reverse();
	}

	return {
		init: function (rule) {
			// have variable rule in main function
			x = width/2;
			y = height/2;
			map = new Array(width*height).fill(0);
			dir = 0;
			newdir = getDirs(rule);
			ruleString = rule.toString(2).split("").map(e=>"RL"[e]).reverse().join("");
			size = newdir.length;
			colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))));
			index = x+y*width;	
			iterations = 0, time = 0;	
		},
		simulateAnt: function() {
			var stop = false;
			var startTime = performance.now();
			for(var i = 0; i < 5000000; i+=2) {
				// HORIZONTAL MOVEMENT
				state = map[index];
				dir = (dir+newdir[state])&3;
				map[index]++;
				if(map[index]==size) map[index] = 0;
				x += directionx[dir];
				index += directionx[dir];
				if(x<0 || x >= width) {
					i++;
					stop = true;
					break;
				}
				// VERTICAL MOVEMENT		
		                state = map[index];
		                dir = (dir+newdir[state])&3;
		                map[index]++;
		                if(map[index]==size) map[index] = 0;
		                y += directiony[dir];
		                index += directiony[dir]*width;
				if(y < 0 || y >= height) {
					i+=2;
					stop = true;
					break;
				}
			}
			iterations += i;
			var endTime = performance.now();
			time += (endTime-startTime)/1000;
			return !stop;	
		},
		getColors: function(i) { return colors[i]; },
		getMap: function(i) { return map[i]; },
		getIterations: function() { return iterations; },
		getTime: function() { return time; },
		getItps: function() { return iterations/time; },
		getRule: function() { return ruleString; }
	}
})();

frameid = 0;

function init(rule) {
	window.cancelAnimationFrame(frameid);
	Screen.init();
	Ant.init(rule);
	
	loop(0);
}

function loop(time) {
	if(Ant.simulateAnt()) frameid = window.requestAnimationFrame(loop);
	Screen.render();
}
