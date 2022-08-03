function getDirs(rule) {
	return rule.toString(2).split("").map(e=>[1,3][e]).reverse();
}

var width, height, map, colors;
const MAX_ITERATIONS = 200000000;

function simulateAnt(rule) {
	width = 800;
	height = 800;
	map = new Array(width*height).fill(0);
	
	var x = width/2;
	var y = height/2;
	var dir = 0;
	var newdir = getDirs(rule);
	var size = newdir.length;
	
	const directionx = [0,1,0,-1];
	const directiony = [-1,0,1,0];

	colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))));

	var startTime = performance.now();
	var index = x+y*width;
	var state;
	for(var i = 0; i < MAX_ITERATIONS; i+=2) {
		// HORIZONTAL MOVEMENT
		state = map[index];
		dir = (dir+newdir[state])&3;
		map[index]++;
		if(map[index]==size) map[index] = 0;
		x += directionx[dir];
		index += directionx[dir];
		if(x<0 || x >= width) {
			i++;
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
			break;
		}
	}
	console.log(i, "iterations");
	var endTime = performance.now();
	console.log(i/(endTime-startTime)*1000,"it/s");
	render();
}

function render() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var img = ctx.createImageData(width,height);
	var data = img.data;

	for(var i = 0,j=0; i < width*height*4; i+=4,j++) {
		data[i+0] = colors[map[j]][0];
		data[i+1] = colors[map[j]][1];
		data[i+2] = colors[map[j]][2];
		data[i+3] = 255;
	}
	ctx.putImageData(img,0,0);
}
