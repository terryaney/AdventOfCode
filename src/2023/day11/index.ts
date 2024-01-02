import run from "aocrunner";
import * as util from '../../utils/index.js';

class Galaxy {
	public row: number;
	public col: number;

	constructor(row: number, col: number) {
		this.row = row;
		this.col = col;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);

	// Expand rows...
	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		
		if (Array.from(line).every(c => c == ".")) {
			lines.splice(index + 1, 0, "*".repeat(line.length));
		}
	}

	// Expand columns...
	for (let col = 0; col < lines[ 0 ].length; col++) {
		let expandCol = true;
		
		for (let row = 0; row < lines.length; row++) {
			if ( lines[ row ][ col ] != "." && lines[ row ][ col ] != "*" ) {
				expandCol = false;
				break;
			}		
		}
		
		if ( expandCol ) {
			for (let row = 0; row < lines.length; row++) {
				lines[row] = lines[row].slice(0, col) + "*" + lines[row].slice(col);
			}
			col++; // Skip the newly added column
		}
	}

	let galaxies: Array<Galaxy> = [];

	// Find all galaxies...
	for (let row = 0; row < lines.length; row++) {
		const line = lines[row];
	
		for (let col = 0; col < line.length; col++) {
			const char = line[col];
	
			if (char == "#") {
				galaxies.push(new Galaxy(row, col));
			}
		}	
	}
	
	return { universe: lines, galaxies: galaxies };
};

function calculateDistance(universe: Array<string>, startGalaxy: Galaxy, endGalaxy: Galaxy, growthFactor: number) {
	let rowDiff = Math.abs(startGalaxy.row - endGalaxy.row);
	let colDiff = Math.abs(startGalaxy.col - endGalaxy.col);
	let expandedSteps = 0;
	if (growthFactor > 1) {
		if (rowDiff > 1) {
			// At least one row between start and end...check each row to see if they are an expanded row...
			const startRow = Math.min(startGalaxy.row, endGalaxy.row);
			const maxRowToCheck = Math.max(startGalaxy.row, endGalaxy.row);
			for (let row = startRow + 1; row < maxRowToCheck; row++) {
				if (universe[row][startGalaxy.col] == "*") {
					expandedSteps++;
				}
			}
		}

		if (colDiff > 1) {
			// At least one column between start and end...check each column to see if they are an expanded column...
			const startCol = Math.min(startGalaxy.col, endGalaxy.col);
			const maxColToCheck = Math.max(startGalaxy.col, endGalaxy.col);
			for (let col = startCol + 1; col < maxColToCheck; col++) {
				if (universe[startGalaxy.row][col] == "*") {
					expandedSteps++;
				}
			}
		}
	}

	const distance = rowDiff + colDiff + expandedSteps * (growthFactor - 2);
	return distance;
}

const solve = (rawInput: string, isPart2: boolean, isTestCase?: boolean) => {
	const input = parseInput(rawInput);

	let totalDistance = 0;
	let pairs = 0;
	
	for (let start = 0; start < input.galaxies.length; start++) {
		const startGalaxy = input.galaxies[start];
		
		for (let end = start + 1; end < input.galaxies.length; end++) {
			const endGalaxy = input.galaxies[end];
			totalDistance += calculateDistance(input.universe, startGalaxy, endGalaxy, !isPart2 ? 1 : ( ( isTestCase ?? false ) ? 100 : 1000000 ));
			pairs++;
		}
	}
	
	return totalDistance;
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, true, testName != undefined);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				...#......
				.......#..
				#.........
				..........
				......#...
				.#........
				.........#
				..........
				.......#..
				#...#.....
				`,
				expected: 374,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				...#......
				.......#..
				#.........
				..........
				......#...
				.#........
				.........#
				..........
				.......#..
				#...#.....
				`,
				expected: 8410,
			}
		],
		solution: part2,
	},
	trimTestInputs: true
});