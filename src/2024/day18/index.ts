import run from "aoc-automation";
import * as util from "../../utils/index.js";
import { corr, i } from "mathjs";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const input = parseInput(rawInput, testName);
	const grid = input.grid;

	/*
	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		util.logGrid(grid);
		console.log("------");
	}
	*/

	if (isPart1) {
		const allPaths = util.aStar(
			grid,
			new util.PathNode(0, 0, "E"),
			new util.PathNode(grid.rows - 1, grid.rows - 1, "E"),
			util.Movement.Directions
		)!;

		/*
		if (testName != undefined) {
			console.log("");
	
			for (let j = 0; j < allPaths[0].length; j++) {
				const p = allPaths[0].nodes[j];
				grid.points[p.y][p.x].value = p.direction;
			}
			util.logGrid(grid, `${testName} Path (${allPaths[0].length} steps, ${allPaths[0].totalCost} cost)`);
		}
		*/

		return allPaths[0].totalCost;
	}

    const blockPointsUpTo = (index: number) => {
        for (let i = 0; i <= index; i++) {
            grid.points[input.corrupted[i][1]][input.corrupted[i][0]].value = '#';
        }
    };

    const unblockPointsUpTo = (index: number) => {
        for (let i = 0; i <= index; i++) {
            grid.points[input.corrupted[i][1]][input.corrupted[i][0]].value = '.';
        }
	};	
	
	let left = 0;
	let right = input.corrupted.length - 1;
	let firstCorrupt: number[] | undefined = undefined;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		blockPointsUpTo(mid);
		
		const path = util.aStar(
			grid,
			new util.PathNode(0, 0, "E"),
			new util.PathNode(grid.rows - 1, grid.rows - 1, "E"),
			util.Movement.Directions
		);

		unblockPointsUpTo(mid);

		if (path == undefined) {
			firstCorrupt = input.corrupted[ mid ];
            right = mid - 1; // Search in the left half
        } else {
            left = mid + 1; // Search in the right half
		}
	}

	return firstCorrupt!.join(",");
};

const parseInput = (rawInput: string, testName?: string) => {
	const lines = util.parseLines(rawInput);
	const corrupted = lines.map(l => l.split(",").map(Number));
	const rows = testName != undefined ? 7 : 71;
	const cols = testName != undefined ? 7 : 71;
	const points = Array.from({ length: rows }, (r, y) => Array.from({ length: cols }, (c, x) => ({ x, y, value: ".", visited: false } as util.Point<string>)));
	const grid = { points, rows, cols, isInside: (point: Array<number>) => point[0] >= 0 && point[0] < cols && point[1] >= 0 && point[1] < rows} as util.Grid<string>;
	const part1Bytes = testName != undefined ? 12 : 1024;
	corrupted.splice(0, part1Bytes).forEach(point => {
		grid.points[point[1]][point[0]].value = "#"
	});
	return { grid, corrupted }; // corrupted has already had 0-part1Bytes removed
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				5,4
				4,2
				4,5
				3,0
				2,1
				6,3
				2,4
				1,5
				0,6
				3,3
				2,6
				5,1
				1,2
				5,5
				2,5
				6,5
				1,4
				0,4
				6,4
				1,1
				6,1
				1,0
				0,5
				1,6
				2,0
				`,
				expected: 22
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				5,4
				4,2
				4,5
				3,0
				2,1
				6,3
				2,4
				1,5
				0,6
				3,3
				2,6
				5,1
				1,2
				5,5
				2,5
				6,5
				1,4
				0,4
				6,4
				1,1
				6,1
				1,0
				0,5
				1,6
				2,0
				`,
				expected: "6,1"
			}
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
