import run from "aocrunner";
import * as util from '../utils/index.js';

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const startLine = lines.findIndex(l => l.includes('S'));
	return { lines, start: { x: lines[startLine].indexOf('S'), y: startLine } };
};

const solve = (rawInput: string, testName: string | undefined, isPart2: boolean) => {
	const { lines, start } = parseInput(rawInput);
	const stepsNeeded = !isPart2
		? (testName == undefined ? 64 : 6)
		: (testName == undefined ? 26501365 : Number(testName.split(", ")[2]));

	// S, . = garden plots
	// # = rock
	// Walk out 'stepsNeeded' to keep spawning markers to where he could reach
	// console.log(lines, start, stepsNeeded);
	
	let tokens: Array<{ x: number, y: number }> = [start];
	
	for (let index = 0; index < stepsNeeded; index++) {
		const newTokens: { [key: string]: { x: number, y: number } } = {};
	
		tokens.forEach(token => {
			const { x, y } = token;
			[
				{ x, y: y - 1 },
				{ x, y: y + 1 },
				{ x: x - 1, y },
				{ x: x + 1, y }
			].filter(({ x, y }) => x >= 0 && y >= 0 && x < lines[0].length && y < lines.length)
				.forEach(location => {
					if (lines[location.y][location.x] === '.' || lines[location.y][location.x] === 'S') {
						newTokens[`${location.x},${location.y}`] = location;
					}
				});
		});
		tokens = [...Object.values(newTokens)]
		
		/*
		const grid = lines.map(l => l + "");
		grid[start.y] = grid[start.y].substring(0, start.x) + 'S' + grid[start.y].substring(start.x + 1);
		tokens.forEach(({ x, y }) => {
			grid[y] = grid[y].substring(0, x) + 'O' + grid[y].substring(x + 1);
		});
		grid.forEach(l => console.log(l));
		console.log("");
		*/
	}

	return tokens.length;
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, testName, false);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, testName, true);

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
				expected: 16
			}
		],
		solution: part1
	},
	part2: {
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
		solution: part2
	},
	trimTestInputs: true
});