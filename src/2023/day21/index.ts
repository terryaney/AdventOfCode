import run from "aoc-automation";
import * as util from "../../utils/index.js";
import { assert } from "console";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const startLine = lines.findIndex(l => l.includes("S"));
	return { lines, start: { x: lines[startLine].indexOf("S"), y: startLine } };
};

const fillGrid = (
	grid: string[],
	startX: number,
	startY: number,
	stepsRemaining: number,
) => {
	// S, . = garden plots
	// # = rock
	// Walk out 'stepsNeeded' to keep spawning markers to where he could reach
	// console.log(lines, start, stepsNeeded);

	const tokens: Array<{ x: number; y: number; stepsRemaining: number }> = [
		{ x: startX, y: startY, stepsRemaining: stepsRemaining },
	];
	const answers: Set<string> = new Set();
	const seen: Set<string> = new Set();

	while (tokens.length > 0) {
		const token = tokens.shift()!;

		if (token.stepsRemaining % 2 == 0) {
			answers.add(`${token.x},${token.y}`);
		}

		if (token.stepsRemaining <= 0) {
			continue;
		}

		const { x, y } = token;

		[
			{ x, y: y - 1 },
			{ x, y: y + 1 },
			{ x: x - 1, y },
			{ x: x + 1, y },
		]
			.filter(
				({ x, y }) =>
					x >= 0 &&
					y >= 0 &&
					x < grid[0].length &&
					y < grid.length &&
					grid[y][x] != "#" &&
					!seen.has(`${x},${y}`),
			)
			.forEach(location => {
				seen.add(`${location.x},${location.y}`);
				tokens.push({
					x: location.x,
					y: location.y,
					stepsRemaining: token.stepsRemaining - 1,
				});
			});

		/*
		const grid = grid.map(l => l + "");
		grid[start.y] = grid[start.y].substring(0, start.x) + 'S' + grid[start.y].substring(start.x + 1);
		tokens.forEach(({ x, y }) => {
			grid[y] = grid[y].substring(0, x) + 'O' + grid[y].substring(x + 1);
		});
		grid.forEach(l => console.log(l));
		console.log("");
		*/
	}

	return answers.size;
};

const solve = (
	rawInput: string,
	testName: string | undefined,
	isPart2: boolean,
) => {
	const { lines, start } = parseInput(rawInput);

	const stepsNeeded = !isPart2
		? testName == undefined
			? 64
			: 6
		: testName == undefined
		? 26501365
		: Number(testName.split(", ")[2]);

	if (!isPart2) {
		return fillGrid(lines, start.x, start.y, stepsNeeded);
	} else {
		/*
		assert(lines.length == lines[0].length, "Expected square grid");
		assert(start.x == start.y && start.y == Math.floor(lines.length / 2), "Expected start in middle of grid");
		assert(stepsNeeded % lines.length == Math.floor(lines.length / 2), "Expected stepsNeeded to be a multiple of grid size + size / 2");
		*/

		const gridWidth = lines.length;
		const gridToVisitRightOfStart = Math.floor(stepsNeeded / gridWidth) - 1;

		// Grids you enter where you have odd number of steps remaining...
		// Grids rounded down to nearest multiple of 2^2 + 1
		const oddGrids = Math.pow(
			Math.floor(gridToVisitRightOfStart / 2) * 2 + 1,
			2,
		);
		// Grids rounded up to nearest multiple of 2^2
		const evenGrids = Math.pow(
			Math.floor((gridToVisitRightOfStart + 1) / 2) * 2,
			2,
		);

		// Assuming grid is sparse enough so that you can reach any point without lots of twists/turns
		// For odd grids, sufficiently large odd number, and my number is big enough to start LL and Manhattan to UR
		const oddGridPoints = fillGrid(
			lines,
			start.x,
			start.y,
			gridWidth * 2 + 1,
		);
		const evenGridPoints = fillGrid(lines, start.x, start.y, gridWidth * 2);

		const vertexStepsRemaining = gridWidth - 1;
		const top = fillGrid(
			lines,
			start.x,
			gridWidth - 1,
			vertexStepsRemaining,
		);
		const right = fillGrid(lines, 0, start.y, vertexStepsRemaining);
		const bottom = fillGrid(lines, start.x, 0, vertexStepsRemaining);
		const left = fillGrid(
			lines,
			gridWidth - 1,
			start.y,
			vertexStepsRemaining,
		);

		const smallStepsRemaining = Math.floor(gridWidth / 2) - 1;
		const smallTopRight = fillGrid(
			lines,
			0,
			gridWidth - 1,
			smallStepsRemaining,
		);
		const smallTopLeft = fillGrid(
			lines,
			gridWidth - 1,
			gridWidth - 1,
			smallStepsRemaining,
		);
		const smallBottomRight = fillGrid(lines, 0, 0, smallStepsRemaining);
		const smallBottomLeft = fillGrid(
			lines,
			gridWidth - 1,
			0,
			smallStepsRemaining,
		);

		const largeStepsRemaining = Math.floor((gridWidth * 3) / 2) - 1;
		const largeTopRight = fillGrid(
			lines,
			0,
			gridWidth - 1,
			largeStepsRemaining,
		);
		const largeTopLeft = fillGrid(
			lines,
			gridWidth - 1,
			gridWidth - 1,
			largeStepsRemaining,
		);
		const largeBottomRight = fillGrid(lines, 0, 0, largeStepsRemaining);
		const largeBottomLeft = fillGrid(
			lines,
			gridWidth - 1,
			0,
			largeStepsRemaining,
		);

		return (
			oddGrids * oddGridPoints +
			evenGrids * evenGridPoints +
			top +
			right +
			bottom +
			left +
			(gridToVisitRightOfStart + 1) *
				(smallTopRight +
					smallBottomRight +
					smallBottomLeft +
					smallTopLeft) +
			gridToVisitRightOfStart *
				(largeTopRight +
					largeBottomRight +
					largeBottomLeft +
					largeTopLeft)
		);
	}
};

const part1 = (rawInput: string, testName?: string) =>
	solve(rawInput, testName, false);
const part2 = (rawInput: string, testName?: string) =>
	solve(rawInput, testName, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 16,
			},
		],
		solution: part1,
	},
	part2: {
		/* Can't run tests due to assumptions made for solution (row/col of S is all empty)
		tests: [
			{
				name: "6",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 16
			},
			{
				name: "10",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 50
			},
			{
				name: "50",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 1594
			},
			{
				name: "100",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 6536
			},
			{
				name: "500",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 167004
			},
			{
				name: "1000",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 668697
			},
			{
				name: "5000",
				input: `
				...........
				.....###.#.
				.###.##..#.
				..#.#...#..
				....#.#....
				.##..S####.
				.##..#...#.
				.......##..
				.##.#.####.
				.##..##.##.
				...........
				`,
				expected: 16733044
			}
		],
		*/
		solution: part2,
	},
	trimTestInputs: true,
});
