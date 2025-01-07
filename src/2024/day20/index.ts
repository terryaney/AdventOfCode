import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const input = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		util.logGrid(input.grid, testName);
		console.log("------");
	}

	input.start.direction = "S";

	const path = util.aStar(input.grid, input.start, input.end)![0];
	const savingsRequired = testName != undefined
		? ( isPart1 ? 20 : 50)
		: 100;
	const cheatTime = isPart1 ? 2 : 20;
	let cheats = 0;

	for (let n = 0; n < path.length - savingsRequired; n++) {
		const node = path.nodes[n];

		for (let c = n + savingsRequired + 2; c < path.length; c++) {
			const cheat = path.nodes[c];
			const distance = util.Movement.manhattanDistance(node, cheat);
			const stepsSaved = c - n - distance;
			if (stepsSaved >= savingsRequired && distance <= cheatTime) {
				// console.log(`Cheat from ${node.x},${node.y} to ${cheat.x},${cheat.y} saved ${stepsSaved} steps`);
				cheats++;
			}
		}
	}
	return cheats;
};

const parseInput = (rawInput: string) => {
	const grid = util.parseGrid(rawInput);
	const start = grid.find("S")!;
	const end = grid.find("E")!;
	return {
		grid,
		start: new util.PathNode(start.x, start.y, "N"),
		end: new util.PathNode(end.x, end.y, "N")
	};
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				###############
				#...#...#.....#
				#.#.#.#.#.###.#
				#S#...#.#.#...#
				#######.#.#.###
				#######.#.#...#
				#######.#.###.#
				###..E#...#...#
				###.#######.###
				#...###...#...#
				#.#####.#.###.#
				#.#...#.#.#...#
				#.#.#.#.#.#.###
				#...#...#...###
				###############
				`,
				expected: 5
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				###############
				#...#...#.....#
				#.#.#.#.#.###.#
				#S#...#.#.#...#
				#######.#.#.###
				#######.#.#...#
				#######.#.###.#
				###..E#...#...#
				###.#######.###
				#...###...#...#
				#.#####.#.###.#
				#.#...#.#.#...#
				#.#.#.#.#.#.###
				#...#...#...###
				###############
				`,
				expected: 285
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
