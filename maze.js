var canvas = document.getElementById("canvas");
var sizeOfCanvas = 400;
canvas.width = sizeOfCanvas;
canvas.height = sizeOfCanvas;
var ctx = canvas.getContext("2d");
var cellsPerXY = 40; //Cells are perfect squares
var cellSize = 400 / cellsPerXY;
var cells = [];
var populateCells = function() {
    for (var x = 0; x < cellsPerXY; x++) {
        cells.push([]);
        for (var y = 0; y < cellsPerXY; y++) {
            cells[x].push(new Cell(x, y));
        }
    }
};
var resetCells = function() {
    for (var x = 0; x < cellsPerXY; x++) {
        for (var y = 0; y < cellsPerXY; y++) {
            cells[x][y].isAlive = true;
            cells[x][y].isMaze = false;
        }
    }
};
var updateCells = function() {
    for (var x = 0; x < cellsPerXY; x++) {
        for (var y = 0; y < cellsPerXY; y++) {
            cells[x][y].update();
        }
    }
};
var cellExists = function(x, y) {
    return x >= 0 && x < cellsPerXY && y >= 0 && y < cellsPerXY;
};
var renderCells = function() {
    clearCanvas();
    for (var x = 0; x < cellsPerXY; x++) {
        for (var y = 0; y < cellsPerXY; y++) {
            cells[x][y].draw();
        }
    }
};
var clearCanvas = function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

function Cell(x, y) {
    this.x = x;
    this.y = y;
    /*
    Being dead means the cell is no longer
    able to be used in the creation of the maze
    */
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
    if (cellExists(this.x + relX, this.y + relY)) return cells[this.x +
        relX][this.y + relY];
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
    return [this.getRel(-1, 0), this.getRel(1, 0), this.getRel(0, -1), this
        .getRel(0, 1)
    ];
};
Cell.prototype.hasAliveAdjacent = function() {
    var adjacent = this.getDirectlyAdjacent();
    for (var i = 0; i < adjacent.length; i++) {
        if (adjacent[i] !== undefined && adjacent[i].isAlive) return true;
    }
    return false;
};
Cell.prototype.getAliveAdjacent = function() {
    var adjacent = this.getDirectlyAdjacent();
    var alive = [];
    for (var i = 0; i < 4; i++) {
        if (adjacent[i] !== undefined && adjacent[i].isAlive) alive.push(
            adjacent[i]);
    }
    return alive;
};
Cell.prototype.draw = function() {
    if (!this.isMaze) ctx.fillStyle = "black";
    if (this.isMaze) ctx.fillStyle = "white";
    ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
};
var getValidFromArray = function(array) {
    var alive = [];
    for (var i = 0; i < array.length; i++)
        if (array[i] !== undefined && array[i].hasAliveAdjacent()) alive.push(
            array[i]);
    return alive;
};
var randXY = function() {
    return randomInt(0, cellsPerXY - 1);
};
var randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
var generateMaze = function(x, y) {
    //Select starting point, make it into maze
    var point = cells[x][y];
    point.makeIntoMaze();
    failsafe = [];
    //Make sure our start has places to move to
    while (point.hasAliveAdjacent()) {
        //Gather all adjacent spots
        var adjacent = point.getAliveAdjacent();
        //Select a random adjacent, make that our point and make it into a maze
        //the update all the cells so they can adjust accordingly
        var randomAdjacent = randomInt(0, adjacent.length - 1);
        point = adjacent[randomAdjacent];
        point.makeIntoMaze();
        updateCells();
        adjacent = adjacent.splice(randomAdjacent, 1);
        if (adjacent.length > 0) failsafe = failsafe.concat(adjacent);
        failsafe = getValidFromArray(failsafe);
        if (!point.hasAliveAdjacent() && failsafe.length > 0) {
            point = failsafe.pop();
            point.makeIntoMaze();
            updateCells();
        }
    }
};
var doGen = function() {
    resetCells();
    generateMaze(randXY(), randXY());
    renderCells();
};
populateCells();
renderCells();