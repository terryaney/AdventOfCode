import run from "aoc-automation";
import * as util from "../../utils/index.js";

class Robot {
	public position: Array<number> = [0, 0];
	public velocity: Array<number> = [0, 0];

	constructor(position: Array<number>, velocity: Array<number>) {
		this.position = position;
		this.velocity = velocity;
	}
}

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const robots = parseInput(rawInput);
	const rows = testName != undefined ? 7 : 103;
	const cols = testName != undefined ? 11 : 101;
	const vHalf = Math.floor(rows / 2);
	const hHalf = Math.floor(cols / 2);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(robots);
		console.log("------");
	}

	const points = testName != undefined ? Array.from({ length: rows }, (r, y) => Array.from({ length: cols }, (c, x) => ({ x, y, value: 0, visited: false } as util.Point<number>))) : undefined;
	const grid = testName != undefined ? { points, rows, cols, isInside: (point: Array<number>) => point[0] >= 0 && point[0] < cols && point[1] >= 0 && point[1] < rows } as util.Grid<number> : undefined;

	const getQuadrantFactor = () => {
		let q1 = 0, q2 = 0, q3 = 0, q4 = 0;
		for (let r of robots) {
			if (r.position[0] < hHalf && r.position[1] < vHalf) q1++;
			else if (r.position[0] > hHalf && r.position[1] < vHalf) q2++;
			else if (r.position[0] < hHalf && r.position[1] > vHalf) q3++;
			else if (r.position[0] > hHalf && r.position[1] > vHalf) q4++;
		}
	
		return q1 * q2 * q3 * q4;
	};

	if (isPart1) {
		for (let r of robots) {
			// % is invariant with addition/multiplication.
			// This means that (a + b) % n = (a % n + b % n), and can do a single calc and % the entire result.
			r.position[0] = ((r.position[0] + r.velocity[0] * 100) % cols + cols) % cols;
			r.position[1] = ((r.position[1] + r.velocity[1] * 100) % rows + rows) % rows;
			
			if (testName != undefined) grid!.points[r.position[1]][r.position[0]].value++;
		}
		if (testName != undefined) util.logGrid(grid!, "Robots after 100 seconds");
		return getQuadrantFactor();
	}
	else {
		// rows * cols robots all wrap around and start over...
		var minQuadrantFactor = Number.POSITIVE_INFINITY;
		var minIteration = 0;

		for (let i = 0; i < rows * cols; i++) {
			for (let r of robots) {
				// Move robot
				r.position[0] = ((r.position[0] + r.velocity[0]) % cols + cols) % cols;
				r.position[1] = ((r.position[1] + r.velocity[1]) % rows + rows) % rows;
			}

			var cFactor = getQuadrantFactor();
			if (cFactor < minQuadrantFactor) {
				minQuadrantFactor = cFactor;
				minIteration = i + 1;
			}
		}

		return minIteration;
	}
};

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines.map(l => {
		const parts = l.split(" ");
		const position = parts[0].split("=")[1].split(",").map(Number);
		const velocity = parts[1].split("=")[1].split(",").map(Number);
		return new Robot(position, velocity);
	});
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				p=0,4 v=3,-3
				p=6,3 v=-1,-3
				p=10,3 v=-1,2
				p=2,0 v=2,-1
				p=0,0 v=1,3
				p=3,0 v=-2,-2
				p=7,6 v=-1,-3
				p=3,0 v=-1,-2
				p=9,3 v=2,3
				p=7,3 v=-1,2
				p=2,4 v=2,-3
				p=9,5 v=-3,-3
				`,
				expected: 12
			},
		],
		solution: part1,
	},
	part2: {
		tests: [],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
