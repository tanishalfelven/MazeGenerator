function Cell(x, y) {
	this.x = x;
	this.y = y;
	// Being dead means the cell is no longer
	// able to be used in the creation of the maze
	this.isAlive = true;
	this.isMaze = false;
}
Cell.prototype.isAlive = true;
Cell.prototype.isMaze = false;
Cell.prototype.makeIntoMaze = function() {
	this.isMaze = true;
	this.setDead();
};
Cell.prototype.setAlive = function() {
	this.isAlive = true;
};
Cell.prototype.setDead = function() {
	this.isAlive = false;
};
Cell.prototype.update = function() {
	if (this.isCrowded()) this.setDead();
};
Cell.prototype.getRel = function(relX, relY) {
	if (APP.cellExists(this.x + relX, this.y + relY)) 
		return APP.cells[this.x + relX][this.y + relY];
	return undefined;
};
Cell.prototype.isCrowded = function() {
	var adjacent = this.getDirectlyAdjacent();
	var numOfMaze = 0;
	for (var i = 0; i < adjacent.length; i++) {
		if (adjacent[i] !== undefined && adjacent[i].isMaze) {
			numOfMaze++;
		}
	}
	if (numOfMaze > 1) return true;
	return false;
};
Cell.prototype.getDirectlyAdjacent = function() {
	return [
		this.getRel(-1, 0),
		this.getRel(1, 0),
		this.getRel(0, -1),
		this.getRel(0, 1)
	];
};
Cell.prototype.hasAliveAdjacent = function() {
	var adjacent = this.getDirectlyAdjacent();
	for (var i = 0; i < adjacent.length; i++) 
		if (adjacent[i] && adjacent[i].isAlive) 
			return true;
	return false;
};
Cell.prototype.getAliveAdjacent = function() {
	var adjacent = this.getDirectlyAdjacent();
	var alive = [];
	for (var i = 0; i < 4; i++) {
		if (adjacent[i] !== undefined && adjacent[i].isAlive) 
			alive.push(adjacent[i]);
	}
	return alive;
};
Cell.prototype.draw = function() {
	if (!this.isMaze) APP.ctx.fillStyle = "black";
	if (this.isMaze) APP.ctx.fillStyle = "white";
			
	APP.ctx.fillRect(this.x * APP.cellSize, this.y * APP.cellSize, APP.cellSize, APP.cellSize);
};