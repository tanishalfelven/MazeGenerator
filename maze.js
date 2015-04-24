var APP = (function(){
var GEN = {
	init : function(){
		APP.canvas = document.getElementById("canvas");
		APP.ctx = canvas.getContext("2d");

		APP.canvas.width = 400;
		APP.canvas.height = 400;

		APP.cellsPerXY = 40;
		APP.cellSize = 400 / APP.cellsPerXY;
		APP.cells = [];
		this.failsafe = [];

		this.startTime = 0;
		this.threads = 0;
		this.maxThreads = 8;

		this.populateCells();
		this.renderCells();
	},
	populateCells : function() {
		for (var x = 0; x < APP.cellsPerXY; x++) {
			APP.cells.push([]);
			for (var y = 0; y < APP.cellsPerXY; y++) {
				APP.cells[x].push(new Cell(x, y));
			}
		}
	},
	resetCells : function() {
		for (var x = 0; x < APP.cellsPerXY; x++) {
			for (var y = 0; y < APP.cellsPerXY; y++) {
				APP.cells[x][y].isAlive = true;
				APP.cells[x][y].isMaze = false;
			}
		}
	},
	updateCells : function() {
		for (var x = 0; x < APP.cellsPerXY; x++) {
			for (var y = 0; y < APP.cellsPerXY; y++) {
				APP.cells[x][y].update();
			}
		}
	},
	updateCellsInBox : function(startX, startY, width, height){
		for (var x = startX; x < startX + width; x++) {
			for (var y = startY; y < startY + height; y++) {
				if(this.cellExists(x, y)){
					APP.cells[x][y].update();
				}
			}
		}
	},
	cellExists : function(x, y) {
		if(!APP.cellsPerXY)
			console.trace();
		return x >= 0 
			&& x < APP.cellsPerXY 
			&& y >= 0 
			&& y < APP.cellsPerXY;
	},
	renderCells : function() {
		this.clearCanvas();
		for (var x = 0; x < APP.cellsPerXY; x++) {
			for (var y = 0; y < APP.cellsPerXY; y++) {
				APP.cells[x][y].draw();
			}
		}
	},
	clearCanvas : function() {
		APP.ctx.fillStyle = "black";
		APP.ctx.fillRect(0, 0, canvas.width, canvas.height);
	},
	getValidFromArray : function(array) {
		var alive = [];
		for (var i = 0; i < array.length; i++)
			if (array[i] && array[i].hasAliveAdjacent()) 
				alive.push(array[i]);
		return alive;
	},
	randXY : function() {
		return this.randomInt(5, APP.cellsPerXY - 6);
	},
	randomInt : function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	executeAsync: function(func) {
		return setInterval(func, 0);
	},
	animateMaze : function(x, y) {
		var point = APP.cells[x][y];
		point.makeIntoMaze();
		point.draw();

		this.updateCellsInBox(point.x-1, point.y-1, 3, 3);
		this.threads++;
		var mazing = this.executeAsync(function(){
			if(!point || !point.hasAliveAdjacent()){
				if(GEN.failsafe.length > 0){
					point = GEN.failsafe.pop();
					return;
				}else{
					clearInterval(mazing);
					GEN.threads--;
					if(GEN.threads <= 0){        
						APP.setGenButton("Generate!");
						APP.toggleGenButton();
						GEN.updateTime();
					}
				}
			}
			//Gather all adjacent spots
			var adjacent = point.getAliveAdjacent();
			//Select a random adjacent, make that our point and make it into a maze
			//the update all the cells so they can adjust accordingly
			var randomAdjacent = GEN.randomInt(0, adjacent.length - 1);
			point = adjacent[randomAdjacent];
			if(point){
				point.makeIntoMaze();
				point.draw();
				GEN.updateCellsInBox(point.x-1, point.y-1, 3, 3);
				adjacent = adjacent.splice(randomAdjacent, 1);
			}
			if (adjacent.length > 0) GEN.failsafe = GEN.failsafe.concat(adjacent);

			GEN.failsafe = GEN.getValidFromArray(GEN.failsafe);

			if(!point && GEN.failsafe.length > 0)
				point = GEN.failsafe.pop();

			if(GEN.threads < GEN.maxThreads && GEN.failsafe.length > 0){
				var newMaze = GEN.failsafe.pop();
				GEN.animateMaze(newMaze.x, newMaze.y);
			}
		});
	},
	updateTime : function(){
		document.getElementById("time").firstChild.data = 
			"~" + ((new Date() - this.startTime)/1000) + " sec";
	},
	doGen : function() {
		this.resetCells();
		this.clearCanvas();
		this.threads = 0;
		this.startTime = new Date();
		this.animateMaze(this.randXY(), this.randXY());
	},
	downloadAsImage : function(){
		var rawImageData = canvas.toDataURL("image/png;base64");
		rawImageData = rawImageData.replace("image/png", "image/octet-stream");
		var imgLink = document.createElement("a");
		imgLink.href = rawImageData;
		imgLink.download = "maze.png";
		imgLink.click();
	}
};
// These are the methods that are global,
// and accessible through APP.~function()~
return {	
	init : function(){
		GEN.init();
	},
	start : function(){
		if(!document.getElementById("generate").disable){
			this.setGenButton("Generating...");  
			this.toggleGenButton();   
	        GEN.doGen();
		}
	},
	setGenButton : function(newText){
		document.getElementById("generate").firstChild.data = newText;
	},
	toggleGenButton : function(){
		var btn = document.getElementById("generate");
		btn.disable = !btn.disable;
	},
	setCellSize : function() {
		APP.cellsPerXY = document.getElementById("cellsPerXY").value;
		APP.cellSize = 400 / APP.cellsPerXY;
		APP.cells = [];
		GEN.populateCells();
		GEN.renderCells();
	},
	setNumWorms : function() {
		APP.maxThreads = document.getElementById("worms").value;
	},
	cellExists: GEN.cellExists
};
})();

window.onload = APP.init;