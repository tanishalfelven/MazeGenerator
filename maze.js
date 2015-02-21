var canvas = document.getElementById("canvas");
var sizeOfCanvas = 400;
canvas.width = sizeOfCanvas;
canvas.height = sizeOfCanvas;
var ctx = canvas.getContext("2d");
var cellsPerXY = 40; //Cells are perfect squares
var cellSize = 400 / cellsPerXY;
var cells = [];
var startTime = 0;
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
var updateCellsInBox = function(startX, startY, width, height){
    for (var x = startX; x < startX + width; x++) {
        for (var y = startY; y < startY + height; y++) {
            if(cellExists(x, y)){
                cells[x][y].update();
            }
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
var getValidFromArray = function(array) {
    var alive = [];
    for (var i = 0; i < array.length; i++)
        if (array[i] !== undefined && array[i].hasAliveAdjacent()) alive.push(
            array[i]);
    return alive;
};
var randXY = function() {
    return randomInt(5, cellsPerXY - 6);
};
var randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
function executeAsync(func) {
    return setInterval(func, 0);
};
var threads = 0;
var animateMaze = function(x, y) {
    var point = cells[x][y];
    point.makeIntoMaze();
    point.draw();
    updateCellsInBox(point.x-1, point.y-1, 3, 3);
    var failsafe = [];
    threads++;
    var mazing = executeAsync(function(){
        if(point === undefined || !point.hasAliveAdjacent()){
            if(failsafe.length > 0){
                point = failsafe.pop();
                return;
            }else{
                clearInterval(mazing);
                threads--;
                if(threads <= 0){        
                    setGenButton("Generate!");
                    toggleGenButton();
                    updateTime();
                }
            }
        }
        //Gather all adjacent spots
        var adjacent = point.getAliveAdjacent();
        //Select a random adjacent, make that our point and make it into a maze
        //the update all the cells so they can adjust accordingly
        var randomAdjacent = randomInt(0, adjacent.length - 1);
        point = adjacent[randomAdjacent];
        if(point !== undefined){
            point.makeIntoMaze();
            point.draw();
            updateCellsInBox(point.x-1, point.y-1, 3, 3);
            adjacent = adjacent.splice(randomAdjacent, 1);
        }
        if (adjacent.length > 0) failsafe = failsafe.concat(adjacent);

        failsafe = getValidFromArray(failsafe);

        if(point === undefined && failsafe.length > 0)
            point = failsafe.pop();
        if(threads < 4 && failsafe.length > 0){
            var newMaze = failsafe.pop();
            animateMaze(newMaze.x, newMaze.y);
        }
    });
};
var generateMaze = function(x, y) {
    var point = cells[x][y];
    point.makeIntoMaze();
    updateCellsInBox(point.x-1, point.y-1, 3, 3);
    failsafe = [];
    threads++;
    while(true){
        if(point === undefined || !point.hasAliveAdjacent()){
            if(failsafe.length > 0){
                point = failsafe.pop();
                point.makeIntoMaze();
                updateCellsInBox(point.x-1, point.y-1, 3, 3);
                continue;
            }else{
                renderCells();
                break;
            }
        }
        //Gather all adjacent spots
        var adjacent = point.getAliveAdjacent();
        //Select a random adjacent, make that our point and make it into a maze
        //the update all the cells so they can adjust accordingly
        var randomAdjacent = randomInt(0, adjacent.length - 1);
        point = adjacent[randomAdjacent];
        if(point !== undefined){
            point.makeIntoMaze();
            updateCellsInBox(point.x-1, point.y-1, 3, 3);
            adjacent = adjacent.splice(randomAdjacent, 1);
        }
        if (adjacent.length > 0) failsafe = failsafe.concat(adjacent);

        failsafe = getValidFromArray(failsafe);

        if(point === undefined && failsafe.length > 0)
            point = failsafe.pop();
            point.makeIntoMaze();
            updateCellsInBox(point.x-1, point.y-1, 3, 3);
    }
    updateTime();
};
var setGenButton = function(newText){
    document.getElementById("generate").firstChild.data = newText;
    return;
};
var toggleGenButton = function(){
    var btn = document.getElementById("generate");
    btn.disable = !btn.disable;
    console.log(btn.disable);
};
var updateTime = function(){
    document.getElementById("time").firstChild.data = 
        "~" + ((new Date() - startTime)/1000) + " sec";
};
var start = function(){
    if(!document.getElementById("generate").disable){
        setGenButton("Generating...");  
        toggleGenButton();
        setTimeout(function(){
            doGen();
        }, 0);
    }
};
var doGen = function() {
    resetCells();
    clearCanvas();
    threads = 0;
    startTime = new Date();
    if(document.getElementById("doAnimate").checked)
        animateMaze(randXY(), randXY());
    else{
        generateMaze(randXY(), randXY());
        setGenButton("Generate!");
        toggleGenButton();
    }
};
var setCellSize = function() {
    cellsPerXY = document.getElementById("cellsPerXY").value;
    cellSize = 400 / cellsPerXY;
    cells = [];
    populateCells();
    renderCells();
};
var downloadAsImage = function(){
    var rawImageData = canvas.toDataURL("image/png;base64");
    rawImageData = rawImageData.replace("image/png", "image/octet-stream");
    var imgLink = document.createElement("a");
    imgLink.href = rawImageData;
    imgLink.download = "maze.png";
    imgLink.click();
};
populateCells();
renderCells();