import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => util.parseGrid(rawInput);

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const grid = parseInput(rawInput);
	const frequencies: Record<string, Array<{ x: number, y: number }>> = {};
	for (let r = 0; r < grid.length; r++) {
		for (let c = 0; c < grid[r].length; c++) {
			const cell = grid[r][c];
			if (cell !== ".") {
				if (frequencies[cell] == undefined) {
					frequencies[cell] = [];
				}
				frequencies[cell].push({ x: c, y: r });
			}
		}
	}

	if (isPart1 && testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(frequencies);
		util.logGrid(grid);
		console.log("------");
	}

	const antinodes: Set<string> = new Set();
	const rows = grid.length;
	const cols = grid[0].length;
	const tryAntinode = (x: number, y: number): boolean => {
		if (x >= 0 && x < cols && y >= 0 && y < rows) {
			const key = `${x}, ${y}`;
			if (!antinodes.has(key)) {
				antinodes.add(key);
			}
			return true;
		}
		return false;
	}

	Object.keys(frequencies).forEach(key => {
		const points = frequencies[key];
		for (let i = 0; i < points.length; i++) {
			const start = points[i];
			
			if (!isPart1 && points.length > 1) {
				tryAntinode(start.x, start.y);
			}

			for (let j = i + 1; j < points.length; j++) {
				const end = points[j];

				if (!isPart1) {
					tryAntinode(end.x, end.y);
				}

				const dr = start.y - end.y;
				const dc = start.x - end.x;

				for (const antenna of [{ loc: start, delta: 1 }, { loc: end, delta: -1 }]) {
					let antinodeDelta = 1;

					while (true) {
						let antinodeX = antenna.loc.x + dc * antenna.delta * antinodeDelta;
						let antinodeY = antenna.loc.y + dr * antenna.delta * antinodeDelta;
						
						if (!tryAntinode(antinodeX, antinodeY)) break;
						if (isPart1) break;
						antinodeDelta++;
					}
				}
			}
		}
	});

	return antinodes.size;
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				............
				........0...
				.....0......
				.......0....
				....0.......
				......A.....
				............
				............
				........A...
				.........A..
				............
				............
				`,
				expected: 14
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				............
				........0...
				.....0......
				.......0....
				....0.......
				......A.....
				............
				............
				........A...
				.........A..
				............
				............
				`,
				expected: 34
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
