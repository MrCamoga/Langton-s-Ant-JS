function generateRuleTable() {
	var table = document.getElementById("ruletable");
	var 	numstates = parseInt(document.getElementById("ruletablestates").value), 
		numcolors = parseInt(document.getElementById("ruletablecolors").value);
	var c = new Array(numcolors).fill(0);
	var c3 = new Array(numcolors*3).fill(0);
	var s = new Array(numstates).fill(0);
	table.innerHTML = '<tr><th rowspan="2" colspan="2">State transition table</th><th colspan="'+(3*numcolors)+'">Color</th></tr>';
	table.innerHTML += '<tr>' + c.map((x,i)=>'<th colspan="3">'+i+'</th>').join("") + '</tr>';
	table.innerHTML += s.map((x,i)=>'<tr>' + (i==0?'<th rowspan="'+numstates+'">State</th>':'')+'<th>'+i+'</th>' + c3.map((y,j)=>'<td><input type="text"></td>').join("") + '</tr>').join("");
}

function readRuleTable() {
	var table = document.getElementById("ruletable");
	var 	numstates = parseInt(document.getElementById("ruletablestates").value), 
		numcolors = parseInt(document.getElementById("ruletablecolors").value);

	var data = new Array(numstates).fill(0).map(x=>new Array(numcolors).fill(0).map(x=>new Array(3).fill(0)));
	var inputs = table.getElementsByTagName("input");
	for(var i = 0, index = 0; i < numstates; i++) {
		for(var j = 0; j < numcolors; j++) {
			data[i][j][0]=parseInt(inputs[index++].value);
			data[i][j][1]=parseInt(inputs[index++].value);
			data[i][j][2]=parseInt(inputs[index++].value);
		}
	}
	return data;
}

function genRandomRule(numdirs) {
	var table = document.getElementById("ruletable");
	var 	numstates = parseInt(document.getElementById("ruletablestates").value), 
		numcolors = parseInt(document.getElementById("ruletablecolors").value);

	var inputs = table.getElementsByTagName("input");
	for(var i = 0; i < inputs.length; i++) {
		inputs[i].value = parseInt(Math.random()*[numcolors,numdirs,numstates][i%3]);
	}
}