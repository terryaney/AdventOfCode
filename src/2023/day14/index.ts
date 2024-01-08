import run from "aoc-automation";
import * as util from '../../utils/index.js';

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const grid = lines.map(line => line.split(""));
	return grid;
};

function rollRowRocks(grid: string[][], row: number, rollTo: number, anchor: number, rocks: number, direction: string) {
	if (rocks == 0) return;

	for (let col = 0; col < Math.abs(anchor - rollTo); col++) {
		grid[row][rollTo + col * ( direction == "W" ? 1 : -1 )] = col < rocks ? "O" : ".";
	}
}

function rollRow(grid: string[][], row: number, direction: string) {
	let rollTo = direction == "W" ? 0 : grid[0].length - 1;
	let rocks = 0;

	for (let col = 0; col < grid[0].length; col++) {
		const currentCol = direction == "W" ? col : grid[0].length - 1 - col;
		const nextCol = currentCol + (direction == "W" ? 1 : -1);
		const lastCol = direction == "W" ? grid[0].length - 1 : 0;

		if (grid[row][currentCol] == "O") {
			rocks++;
		}
		
		if (grid[row][currentCol] == "#") {
			rocks = 0;
			rollTo = nextCol;
		}
		else if (currentCol == lastCol || grid[row][nextCol] == "#") {
			rollRowRocks(grid, row, rollTo, nextCol, rocks, direction);
		}
	}
}

function rollColumnRocks(grid: string[][], column: number, rollTo: number, anchor: number, rocks: number, direction: string) {
	if (rocks == 0) return;

	for (let row = 0; row < Math.abs(anchor - rollTo); row++) {
		grid[rollTo + row * ( direction == "N" ? 1 : -1 )][column] = row < rocks ? "O" : ".";
	}
}

function rollColumn(grid: string[][], column: number, direction: string) {
	let rollTo = direction == "N" ? 0 : grid.length - 1;
	let rocks = 0;

	for (let row = 0; row < grid.length; row++) {
		const currentRow = direction == "N" ? row : grid.length - 1 - row;
		const nextRow = currentRow + (direction == "N" ? 1 : -1);
		const lastRow = direction == "N" ? grid.length - 1 : 0;

		if (grid[currentRow][column] == "O") {
			rocks++;
		}
		
		if (grid[currentRow][column] == "#") {
			rocks = 0;
			rollTo = nextRow;
		}
		else if (currentRow == lastRow || grid[nextRow][column] == "#") {
			rollColumnRocks(grid, column, rollTo, nextRow, rocks, direction);
		}
	}
}

const solve = (rawInput: string, isPart2: boolean) => {
	const grid = parseInput(rawInput);

	if ( !isPart2 ) {
		for (let col = 0; col < grid[0].length; col++) {
			rollColumn(grid, col, "N");
		}
	}
	else {
		const cache: { [key: string]: number } = {};

		for (let cycle = 0; cycle < 1000000000; cycle++) {
			for (let col = 0; col < grid[0].length; col++) {
				rollColumn(grid, col, "N");
			}
			for (let row = 0; row < grid.length; row++) {
				rollRow(grid, row, "W");
			}
			for (let col = 0; col < grid[0].length; col++) {
				rollColumn(grid, col, "S");
			}
			for (let row = 0; row < grid.length; row++) {
				rollRow(grid, row, "E");
			}
			const cacheKey = grid.map(r => r.join("")).join("");
			if (cache[cacheKey] != undefined) {
				const multiple = cycle - cache[cacheKey];
				// console.log("found:" + cache[cacheKey], "current: " + cycle, cacheKey);
				cycle = 1000000000 - ((1000000000 - cycle) % multiple - 1) - 1;
			}
			else {
				cache[cacheKey] = cycle;
			}
		}
	}

	return grid.reduce((acc, line, i) => {
		const countOfOs = line.filter(i => i == "O").length;
		const weight = countOfOs * (grid.length - i);
		return acc + weight;
	}, 0);
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				O....#....
				O.OO#....#
				.....##...
				OO.#O....O
				.O.....O#.
				O.#..O.#.#
				..O..#O..O
				.......O..
				#....###..
				#OO..#....
				`,
				expected: 136
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `
				O....#....
				O.OO#....#
				.....##...
				OO.#O....O
				.O.....O#.
				O.#..O.#.#
				..O..#O..O
				.......O..
				#....###..
				#OO..#....
				`,
				expected: 64
			}
		],
		solution: part2
	},
	trimTestInputs: true
});