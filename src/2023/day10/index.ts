import run from "aoc-automation";
import * as util from '../../utils/index.js';

class Location {
	public readonly row: number;
	public readonly col: number;
	public shape: string;
	constructor(row: number, col: number, lines: string[]) {
		this.row = row;
		this.col = col;
		this.shape = lines[row][col];
	}
}

function getNextLocation(lines: string[], previousLocation: Location, currentLocation: Location): Location {
	const pipe = lines[currentLocation.row][currentLocation.col];
	
	switch (pipe) {
		case "|": // North and South
			return new Location(currentLocation.row + (previousLocation.row < currentLocation.row ? 1 : -1), currentLocation.col, lines);
		case "-": // East and West
			return new Location(currentLocation.row, currentLocation.col + (previousLocation.col < currentLocation.col ? 1 : -1), lines);
		case "L": // North and East
			return new Location(
				currentLocation.row + (previousLocation.row < currentLocation.row ? 0 : -1),
				currentLocation.col + (previousLocation.row < currentLocation.row ? 1 : 0),
				lines
			);
		case "J": // North and West
			return new Location(
				currentLocation.row + (previousLocation.row < currentLocation.row ? 0 : -1),
				currentLocation.col + (previousLocation.row < currentLocation.row ? -1 : 0),
				lines
			);
		case "7": // South and West
			return new Location(
				currentLocation.row + (previousLocation.row > currentLocation.row ? 0 : 1),
				currentLocation.col + (previousLocation.row > currentLocation.row ? -1 : 0),
				lines
			);
		// case "F": // South and East
		default:
			return new Location(
				currentLocation.row + (previousLocation.row > currentLocation.row ? 0 : 1),
				currentLocation.col + (previousLocation.row > currentLocation.row ? 1 : 0),
				lines
			);
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const map: Array<Array<Location | undefined>> = lines.map( l => new Array<Location | undefined>(l.length) );

	let rowS = -1;
	let colS = -1;

	// Find start...
	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		colS = line.indexOf("S");
		if (colS > -1) {
			rowS = index;
			break;
		}	
	}
	let previousLocation = map[rowS][colS] = new Location(rowS, colS, lines);
	let currentLocation: Location | undefined;

	// Convert S to a valid pipe shape and choose first pipe to travel, setting currentSteps to 1 since you moved one step finding this...
	let currentSteps = 1;
	const startCanMoveUp = previousLocation.row > 0 && "|F7".indexOf(lines[previousLocation.row - 1][previousLocation.col]) > -1;
	const startCanMoveLeft = previousLocation.col > 0 && "-FL".indexOf(lines[previousLocation.row][previousLocation.col - 1]) > -1;
	const startCanMoveRight = previousLocation.col < lines[0].length && "-7J".indexOf(lines[previousLocation.row][previousLocation.col + 1]) > -1;
	const startCanMoveDown = previousLocation.row < lines.length && "|LJ".indexOf(lines[previousLocation.row + 1][previousLocation.col]) > -1;

	if (startCanMoveUp) {
		map[previousLocation.row - 1][previousLocation.col] = currentLocation = new Location(previousLocation.row - 1, previousLocation.col, lines);
	}
	else if (startCanMoveLeft) {
		map[previousLocation.row][previousLocation.col - 1] = currentLocation = new Location(previousLocation.row, previousLocation.col - 1, lines);
	}
	else if (startCanMoveRight) {
		map[previousLocation.row][previousLocation.col + 1] = currentLocation = new Location(previousLocation.row, previousLocation.col + 1, lines);
	}
	else if (startCanMoveDown) {
		map[previousLocation.row + 1][previousLocation.col] = currentLocation = new Location(previousLocation.row + 1, previousLocation.col, lines);
	}

	// Travel path (via lines and line indexes) and fill in the map, stopping once I've looped around
	while (map[currentLocation!.row][currentLocation!.col]!.shape != "S") {
		const nextLocation = getNextLocation(lines, previousLocation, currentLocation!);
		previousLocation = currentLocation!;
		map[nextLocation.row][nextLocation.col] = currentLocation = nextLocation;
		currentSteps++;
	}

	if (startCanMoveUp) {
		currentLocation!.shape = startCanMoveDown ? "|" : startCanMoveLeft ? "J" : "L";
	}
	else if (startCanMoveLeft) {
		currentLocation!.shape = startCanMoveDown ? "7" : startCanMoveRight ? "-" : "J";
	}
	else if (startCanMoveRight) {
		currentLocation!.shape = startCanMoveDown ? "F" : startCanMoveLeft ? "-" : "L";
	}
	else if (startCanMoveDown) {
		currentLocation!.shape = startCanMoveUp ? "|" : startCanMoveLeft ? "7" : "F";
	}

	return { map: map, totalSteps: currentSteps, lines: lines };
};

function findItemsInsideLoop(map: Array<Array<{ shape: string } | undefined>>, processInsideItems: (row: number, col: number, items: number) => void) {
	for (let row = 0; row < map.length; row++) {
		const locations = map[row];
		for (let col = 0; col < locations.length; col++) {
			const location = locations[col];
	
			if (location == undefined) {
				// Not part of loop, try ray tracing...
				let crossings = 0;
				let foundTheLoop = false;
				let foundNextLocation = false;
				let itemsInGroup = 1;
				let lastCorner: string | undefined;
	
				for (let ray = col + 1; ray < locations.length; ray++) {
					foundTheLoop ||= locations[ray] != undefined;
					
					if (locations[ray] == undefined) {
						// tile we MIGHT need to check...
						if (!foundTheLoop) {
							// If I haven't found loop yet and current ray item
							// needs to be checked, it will have same result
							// the location I'm checking...
							itemsInGroup++;
						}
						else if (!foundNextLocation) {
							// Once I've found loop, the first undefined items
							// I hit will be the next location I check...
							foundNextLocation = true;
							col = ray - 1;
						}
					}
					else {
						const shape = locations[ray]!.shape;
	
						if (shape == "|" || ( "L7".indexOf(shape) > -1 && "L7".indexOf(lastCorner!) > -1 ) || ( "FJ".indexOf(shape) > -1 && "FJ".indexOf(lastCorner!) > -1 ) ) {
							crossings++;
						}
						
						if ("7JLF".indexOf(shape) > -1) {
							// If I hit a corner, if not already hitting a corner, assign it, otherwise 
							// clear out (meaning I'm moving up or down again)
							lastCorner = lastCorner == undefined ? shape : undefined;
						}
					}
				}
				
				if (crossings % 2 == 1) {
					processInsideItems(row, col, itemsInGroup);
				}
	
				if (!foundNextLocation) {
					break; // No more locations to search in this row...
				}
			}
		}	
	}
}

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);
	const map = input.map;
	const lines = input.lines;
	
	if ( !isPart2 ) {
		return input.totalSteps / 2;
	}
	else {
		let pointsInsideLoop = 0;
		findItemsInsideLoop(map, (row, col, items) => {
			pointsInsideLoop += items;
		});
		return pointsInsideLoop;		
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
				.....
				.S-7.
				.|.|.
				.L-J.
				.....
				`,
				expected: 4,
			},
			{
				input: `
				..F7.
				.FJ|.
				SJ.L7
				|F--J
				LJ...
				`,
				expected: 8,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				...........
				.S-------7.
				.|F-----7|.
				.||.....||.
				.||.....||.
				.|L-7.F-J|.
				.|..|.|..|.
				.L--J.L--J.
				...........
				`,
				expected: 4,
			},
			{
				input: `
				..........
				.S------7.
				.|F----7|.
				.||....||.
				.||....||.
				.|L-7F-J|.
				.|..||..|.
				.L--JL--J.
				..........
				`,
				expected: 4,
			},
			{
				input: `
				.F----7F7F7F7F-7....
				.|F--7||||||||FJ....
				.||.FJ||||||||L7....
				FJL7L7LJLJ||LJ.L-7..
				L--J.L7...LJS7F-7L7.
				....F-J..F7FJ|L7L7L7
				....L7.F7||L7|.L7L7|
				.....|FJLJ|FJ|F7|.LJ
				....FJL-7.||.||||...
				....L---J.LJ.LJLJ...
				`,
				expected: 8,
			},
			{
				input: `
				FF7FSF7F7F7F7F7F---7
				L|LJ||||||||||||F--J
				FL-7LJLJ||||||LJL-77
				F--JF--7||LJLJ7F7FJ-
				L---JF-JLJ.||-FJLJJ7
				|F|F-JF---7F7-L7L|7|
				|FFJF7L7F-JF7|JL---7
				7-L-JL7||F7|L7F-7F7|
				L.L7LFJ|||||FJL7||LJ
				L7JLJL-JLJLJL--JLJ.L
				`,
				expected: 10,
			}
		],
		solution: part2,
	},
	trimTestInputs: true
});