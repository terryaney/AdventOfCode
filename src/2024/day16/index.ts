import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const grid = parseInput(rawInput);

	if (false && testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		util.logGrid(grid);
		console.log("------");
	}

	var start = grid.find("S")!;
	var end = grid.find("E")!;

	const allPaths = util.aStar(
		grid,
		new util.PathNode(start.x, start.y, "E"), 
		new util.PathNode(end.x, end.y, "N"),
		util.Movement.Directions,
		(current, neighbor) => 1 + (current.direction != neighbor.direction ? 1000 : 0),
		undefined,
		!isPart1
	)!;

	if (false && testName != undefined && !isPart1) {
		console.log("");
		const finalGrid = parseInput(rawInput);	
		for (let i = 0; i < allPaths.length; i++) {
			const logGrid = parseInput(rawInput);			
			for (let j = 0; j < allPaths[i].length; j++) {
				const p = allPaths[i].nodes[j];
				logGrid.points[p.y][p.x].value = p.direction;
				finalGrid.points[p.y][p.x].value = "O";
			}
			// util.logGrid(logGrid, `${testName} Path ${i + 1} (${allPaths[i].length} steps, ${allPaths[i][allPaths[i].length - 1].totalCost} cost)`);
		}
		util.logGrid(finalGrid, `${testName} All Paths`);
	}

	if (isPart1) return allPaths[0].totalCost;

	const points = new Set<string>();
	for (let i = 0; i < allPaths.length; i++) {
		for (let j = 0; j < allPaths[i].length; j++) {
			const p = allPaths[i].nodes[j];
			points.add(`${p.x},${p.y}`);
		}
	}

	return points.size;
};

const parseInput = (rawInput: string) => util.parseGrid<string>(rawInput);

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				#####
				###E#
				###.#
				#...#
				#.#.#
				#...#
				#.#.#
				#...#
				#.###
				#S###
				#####
				`,
				expected: 3010
			},
			{
				input: `
				###############
				#.......#....E#
				#.#.###.#.###.#
				#.....#.#...#.#
				#.###.#####.#.#
				#.#.#.......#.#
				#.#.#####.###.#
				#...........#.#
				###.#.#####.#.#
				#...#.....#.#.#
				#.#.#.###.#.#.#
				#.....#...#.#.#
				#.###.#.#.#.#.#
				#S..#.....#...#
				###############
				`,
				expected: 7036
			},
			{
				input: `
				#################
				#...#...#...#..E#
				#.#.#.#.#.#.#.#.#
				#.#.#.#...#...#.#
				#.#.#.#.###.#.#.#
				#...#.#.#.....#.#
				#.#.#.#.#.#####.#
				#.#...#.#.#.....#
				#.#.#####.#.###.#
				#.#.#.......#...#
				#.#.###.#####.###
				#.#.#...#.....#.#
				#.#.#.#####.###.#
				#.#.#.........#.#
				#.#.#.#########.#
				#S#.............#
				#################
				`,
				expected: 11048
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				#####
				###E#
				###.#
				#...#
				#.#.#
				#...#
				#.#.#
				#...#
				#.###
				#S###
				#####
				`,
				expected: 17
			},
			{
				input: `
				###############
				#.......#....E#
				#.#.###.#.###.#
				#.....#.#...#.#
				#.###.#####.#.#
				#.#.#.......#.#
				#.#.#####.###.#
				#...........#.#
				###.#.#####.#.#
				#...#.....#.#.#
				#.#.#.###.#.#.#
				#.....#...#.#.#
				#.###.#.#.#.#.#
				#S..#.....#...#
				###############
				`,
				expected: 45
			},
			{
				input: `
				#################
				#...#...#...#..E#
				#.#.#.#.#.#.#.#.#
				#.#.#.#...#...#.#
				#.#.#.#.###.#.#.#
				#...#.#.#.....#.#
				#.#.#.#.#.#####.#
				#.#...#.#.#.....#
				#.#.#####.#.###.#
				#.#.#.......#...#
				#.#.###.#####.###
				#.#.#...#.....#.#
				#.#.#.#####.###.#
				#.#.#.........#.#
				#.#.#.#########.#
				#S#.............#
				#################
				`,
				expected: 64
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});