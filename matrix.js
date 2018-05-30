class Cell {
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

class Matrix {
	constructor(width, height, worms) {
		this.width = width;
		this.height = height;
		this.grid = [...Array(width)].map((row, x) => [...Array(height)].map((cell, y) => new Cell(x, y)));
		this.maxActive = worms;
		this.active = [];
		this.fallbacks = [];
	}

	update() {
		this.grid.forEach((row) => {
			row.forEach((cell) => {
				if (this.isCrowded(cell)) {
					cell.makeUnavailable();
				}
			});
		})
	}

	randInRange(max, min = 0) {
		return Math.floor(Math.random() * max) + min;
	}

	initGenerate() {
		this.active.push(this.getCell(this.randInRange(this.width), this.randInRange(this.height)));
		this.active[0].makeMaze();
		this.generate();
	}

	generate() {
		this.active = this.active.filter((cell) => !this.isCrowded(cell));

		while (this.active.length < this.maxActive && this.fallbacks.length > 0) {
			let current = this.fallbacks.pop();
			if (this.getAvailableAdjacent(current).length > 0) {
				this.active.push(current);
			}
		}

		this.active.forEach(p => {
			// loop through all active points, gather available adjacent points, create the next maze segment from a random one, add the rest to our fallbacks array
			let available = this.getAvailableAdjacent(p);
			if (available.length > 0) {
				let nextMazeIndex = available[this.randInRange(available.length)];
				p = available.splice(nextMazeIndex, 1)[0];
				p.makeMaze();
				this.fallbacks.concat(available);
			}
		});

		if (this.fallbacks.length > 0 || this.active.length > 0) {
			setTimeout(() => {this.generate()}, 250);
		}
		m.redraw();
	}

	getAdjacentCells(p) {
		// get every adjacent cell (left, right, up, down), then check if at least one cell is available
		return [this.getCell(p.x - 1, p.y), this.getCell(p.x + 1, p.y), this.getCell(p.x, p.y - 1), this.getCell(p.x, p.y + 1)];
	}

	isCrowded(p) {
		return !this.getAdjacentCells(p).some((cell) => cell.isAvailable);
	}

	getAvailableAdjacent(p) {
		return this.getAdjacentCells(p).filter((cell) => cell.isAvailable);
	}

	getCell(x, y) {
		return 0 <= x && x < this.width && 0 <= y && y < this.height ? this.grid[x][y] : new Cell(0, 0, false);
	}

	view(vnode) {
		return m("table", 
			this.grid.map(row => {
				return m("tr.row", row.map(cell => {
					return m("td", { class : cell.isMaze ? "maze" : "cell" });
				}));
			})
		);
	}
}