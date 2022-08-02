function getDirs(rule) {
	newdir = [];
	while(rule != 0) {
	newdir.push((rule&1)==0 ? 1:3);
	rule = rule >> 1;
	}
	return newdir;
}

function simulateAnt(rule) {
	var width = 800;
	var height = 800;
	var map = new Array(width*height).fill(0);

	var x = 400;
	var y = 400;
	var dir = 0;
	var newdir = getDirs(rule);
	var size = newdir.length;

	const directionx = [0,1,0,-1];
	const directiony = [-1,0,1,0];

	var colors = new Array(size).fill(0).map(x=>(new Array(3).fill(0).map(y=>Math.floor(Math.random()*256))))

	var startTime = performance.now();

	for(var i = 1; i < 200000000; i++) {
		var index = x+y*width;
		var state = map[index];
		dir = (dir+newdir[state])&3;
		map[index]++;
		if(map[index]==size) map[index] = 0;
		//map[index] = newstate[state];
		x += directionx[dir];
		y += directiony[dir];
		if(x<0 || y < 0 || x >= width || y >= height) break;
	}
	console.log(i, "iterations");
	var endTime = performance.now();
	console.log(i/(endTime-startTime)*1000,"it/s");
	render(map,colors,width,height);
}

function render(map,colors,width,height) {
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
