import run from "aocrunner";
import * as util from '../utils/index.js';

class Tile {
	public energy = 0;
	public content: string;

	private dictionary: { [key: string]: string } = {};

	constructor(content: string) {
		this.content = content;
	}

	public hasPassedThrough(direction: string): boolean {
		if ( this.dictionary[direction] == undefined ) {
			this.dictionary[direction] = direction;
			return false;
		}
		return true;
	}
}

class Beam {
	static beamId = 1;
	
	public id: number = Beam.beamId++;
	public col: number;
	public row: number;
	public direction: string;
	public isRepeating = false;

	constructor(row: number, col: number, direction: string) {
		this.col = col;
		this.row = row;
		this.direction = direction;
	}

	public getActive(grid: Array<Array<Tile>>) {
		return !this.isRepeating && this.col >= 0 && this.row >= 0 && this.col < grid[0].length && this.row < grid.length;
	}

	public move(grid: Array<Array<Tile>>): Beam | undefined {
		const tile = grid[this.row][this.col];
		const encountered = tile.content;

		let spawn: Beam | undefined;

		if (!tile.hasPassedThrough(this.direction)) {
			tile.energy++;
			
			switch (encountered) {
				case "/":
					switch (this.direction) {
						case "E":
							this.row--;
							this.direction = "N";
							break;
						case "W":
							this.row++;
							this.direction = "S";
							break;
						case "N":
							this.col++;
							this.direction = "E";
							break;
						case "S":
							this.col--;
							this.direction = "W";
							break;
					}
					break;
				case "\\":
					switch (this.direction) {
						case "E":
							this.row++;
							this.direction = "S";
							break;
						case "W":
							this.row--;
							this.direction = "N";
							break;
						case "N":
							this.col--;
							this.direction = "W";
							break;
						case "S":
							this.col++;
							this.direction = "E";
							break;
					}
					break;
				case ".":
					switch (this.direction) {
						case "E":
							this.col++;
							break;
						case "W":
							this.col--;
							break;
						case "N":
							this.row--;
							break;
						case "S":
							this.row++;
							break;
					}
					break;
				case "|":
					switch (this.direction) {
						case "E":
						case "W":
							this.row--;
							this.direction = "N";
							spawn = new Beam(this.row + 2, this.col, "S");
							break;
						case "N":
							this.row--;
							break;
						case "S":
							this.row++;
							break;
					}
					break;
				case "-":
					switch (this.direction) {
						case "N":
						case "S":
							this.col--;
							this.direction = "W";
							spawn = new Beam(this.row, this.col + 2, "E");
							break;
						case "E":
							this.col++;
							break;
						case "W":
							this.col--;
							break;
					}
					break;
			}
		}
		else {
			this.isRepeating = true;
		}

		return spawn;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines.map(line => line.split("").map(char => new Tile(char)));
};

function analyzeGrid(grid: Array<Array<Tile>>, start: Beam) {
	const beams: Array<Beam> = [];
	beams.push(start);

	let currentBeam: Beam | undefined;

	while ((currentBeam = beams.shift()) != undefined) {
		const startDirection = currentBeam.direction;
		const startRow = currentBeam.row;
		const startCol = currentBeam.col;
		const startContent = grid[currentBeam.row][currentBeam.col].content;
		const split = currentBeam.move(grid);

		if (currentBeam.getActive(grid)) {
			beams.push(currentBeam);
		}
		// console.log(`Beam ${currentBeam.id.toString().padStart(3, '0')}: Move ${currentBeam.direction} from [${startCol}, ${startRow}] (${startContent}) to [${currentBeam.col > -1 && currentBeam.col < grid[0].length ? currentBeam.col : "-"}, ${currentBeam.row > -1 && currentBeam.row < grid.length ? currentBeam.row : "-"}] (${currentBeam.active ? grid[currentBeam.row][currentBeam.col].content : " "}) heading ${currentBeam.direction}${!currentBeam.active ? currentBeam.isRepeating ? " *REPEATING*" : " *EXIT*" : ""}`)

		if (split?.getActive(grid) == true) {
			beams.push(split);
			// console.log(`Beam ${split.id.toString().padStart(3, '0')}:                Spawned at [${split.col}, ${split.row}] (${grid[split.row][split.col].content}) heading ${split.direction}`)
			split.id = split.id;		
		}

		if (beams.length > 100) {
			console.log("Too many beams!");
			break;
		}
	}

	return grid.flatMap(row => row).reduce((acc, tile) => acc + ( tile.energy > 0 ? 1 : 0 ), 0);
}

const solve = (rawInput: string, isPart2: boolean) => {
	if (!isPart2) {
		return analyzeGrid(parseInput(rawInput), new Beam(0, 0, "E"));
	}
	else {
		let maxTotalEnergy = 0;
		const grid = parseInput(rawInput);
		const rows = grid.length;
		const cols = grid[0].length;
		
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const startDirection =
					row == 0 ? "S" :
						row == rows - 1 ? "N" :
							col == 0 ? "E" :
								col == cols - 1 ? "W" :
									undefined;
				
				if (startDirection != undefined) {
					let gridEnergy = Math.max(
						analyzeGrid(parseInput(rawInput), new Beam(row, col, startDirection)),
						( row == 0 || row == rows - 1 ) && col == 0 ? analyzeGrid(parseInput(rawInput), new Beam(row, col, "E")) : 0,
						( row == 0 || row == rows - 1 ) && col == cols - 1 ? analyzeGrid(parseInput(rawInput), new Beam(row, col, "W")) : 0
					);
					if ( gridEnergy > maxTotalEnergy ) {
						maxTotalEnergy = gridEnergy;
					}
				}
			}
		}
		return maxTotalEnergy;		
	}
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				.|...\\....
				|.-.\\.....
				.....|-...
				........|.
				..........
				.........\\
				..../.\\\\..
				.-.-/..|..
				.|....-|.\\
				..//.|....
				`,
				expected: 46
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `
				.|...\\....
				|.-.\\.....
				.....|-...
				........|.
				..........
				.........\\
				..../.\\\\..
				.-.-/..|..
				.|....-|.\\
				..//.|....
				`,
				expected: 51
			}
		],
		solution: part2
	},
	trimTestInputs: true
});