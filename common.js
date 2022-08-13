var Settings = (function() {
	return {
		getItpf: function() {
			var value = document.getElementById("itpf").value;
			var itpf = Math.exp(value/100*Math.log(10000000));
			return Math.floor(itpf);
		},
		drawFog: function() { return document.getElementById("fog").checked; },
		sliceDepth: function() { return parseInt(document.getElementById("slice").value); },
		sliceSize: function() { return parseInt(document.getElementById("slicesize").value); },
		wCoord: function() { return parseInt(document.getElementById("wcoord").value);},
		rotationAngle: function() { return parseInt(document.getElementById("rotation").value)*Math.PI/180}
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
	Ant.recolor();
	Screen.render();
}

function downloadImage() {
	var link = document.getElementById("download");
	link.download = Ant.getRule().toString();
	link.href = document.getElementById("antcanvas").toDataURL();
}
