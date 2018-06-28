export default class Cell {
	constructor(x, y, isAvailable = true) {
		this.x = x;
		this.y = y;
		this.isAvailable = isAvailable;
		this.isMaze      = false;
	}

	makeMaze() {
		this.isMaze = true;
		this.makeUnavailable();
	}

	makeUnavailable() {
		this.isAvailable = false;
	}
}