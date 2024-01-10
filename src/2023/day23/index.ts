import run from "aoc-automation";
import * as util from "../../utils/index.js";

const directionsAllowed: Record<string, Array<{ x: number; y: number }>> = {
	"<": [{ x: -1, y: 0 }],
	">": [{ x: 1, y: 0 }],
	"^": [{ x: 0, y: -1 }],
	v: [{ x: 0, y: 1 }],
	".": [
		{ x: -1, y: 0 },
		{ x: 1, y: 0 },
		{ x: 0, y: -1 },
		{ x: 0, y: 1 },
	],
};

const getPossibleMoves = (
	lines: string[],
	x: number,
	y: number,
	isPart1: boolean,
) => {
	const ch = lines[y][x];

	if (ch == "#") return [];

	const possibleMoves = directionsAllowed[isPart1 ? ch : "."];

	return possibleMoves
		.map(n => ({ x: x + n.x, y: y + n.y }))
		.filter(
			n =>
				n.x >= 0 &&
				n.x < lines[0].length &&
				n.y >= 0 &&
				n.y < lines.length &&
				lines[n.y][n.x] != "#",
		);
};

const parseInput = (rawInput: string, isPart1: boolean) => {
	const lines = util.parseLines(rawInput);
	const start = { x: lines[0].indexOf("."), y: 0 };
	const finish = {
		x: lines[lines.length - 1].indexOf("."),
		y: lines.length - 1,
	};

	const points = new Map<string, { x: number; y: number }>(
		[start, finish].map(n => [`${n.x},${n.y}`, n]),
	);

	for (let y = 0; y < lines.length; y++) {
		for (let x = 0; x < lines[y].length; x++) {
			// Pass false for possible moves here b/c everything is allowed just to find 'intersections'
			if (getPossibleMoves(lines, x, y, false).length >= 3) {
				points.set(`${x},${y}`, { x, y });
			}
		}
	}

	const graph: Map<string, Map<string, number>> = new Map();

	// Find distance to next point of interest and make a graph element
	points.forEach(start => {
		const stack = [{ x: start.x, y: start.y, distance: 0 }];
		const startKey = `${start.x},${start.y}`;
		const seen = new Set([startKey]);

		while (stack.length > 0) {
			const current = stack.shift()!;
			const currentKey = `${current.x},${current.y}`;

			if (current.distance != 0 && points.has(currentKey)) {
				const graphItem =
					graph.get(startKey) ??
					graph.set(startKey, new Map()).get(startKey)!;
				graphItem.set(currentKey, current.distance);
				continue;
			}

			const possibleMoves = getPossibleMoves(
				lines,
				current.x,
				current.y,
				isPart1,
			).filter(n => !seen.has(`${n.x},${n.y}`));

			possibleMoves.forEach(n => {
				stack.push({ x: n.x, y: n.y, distance: current.distance + 1 });
				seen.add(`${n.x},${n.y}`);
			});
		}
	});

	const input = { graph, start, finish };
	// console.log(input);
	return input;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = parseInput(rawInput, isPart1);
	const finish = `${input.finish.x},${input.finish.y}`;

	/*
	if (!isPart1) {
		console.log(input)
	}
	*/

	const seen = new Set<string>();

	const dfs = (pt: string) => {
		if (pt == finish) {
			return 0;
		}

		let maxDistance = -Infinity;

		// Prevent cycles/backtracking
		seen.add(pt);
		input.graph.get(pt)!.forEach((distance, neighbor) => {
			if (!seen.has(neighbor)) {
				maxDistance = Math.max(maxDistance, dfs(neighbor) + distance);
			}
		});
		seen.delete(pt);
		return maxDistance;
	};

	return dfs(`${input.start.x},${input.start.y}`);
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				#.#####################
				#.......#########...###
				#######.#########.#.###
				###.....#.>.>.###.#.###
				###v#####.#v#.###.#.###
				###.>...#.#.#.....#...#
				###v###.#.#.#########.#
				###...#.#.#.......#...#
				#####.#.#.#######.#.###
				#.....#.#.#.......#...#
				#.#####.#.#.#########v#
				#.#...#...#...###...>.#
				#.#.#v#######v###.###v#
				#...#.>.#...>.>.#.###.#
				#####v#.#.###v#.#.###.#
				#.....#...#...#.#.#...#
				#.#########.###.#.#.###
				#...###...#...#...#.###
				###.###.#.###v#####v###
				#...#...#.#.>.>.#.>.###
				#.###.###.#.###.#.#v###
				#.....###...###...#...#
				#####################.#
				`,
				expected: 94,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				#.#####################
				#.......#########...###
				#######.#########.#.###
				###.....#.>.>.###.#.###
				###v#####.#v#.###.#.###
				###.>...#.#.#.....#...#
				###v###.#.#.#########.#
				###...#.#.#.......#...#
				#####.#.#.#######.#.###
				#.....#.#.#.......#...#
				#.#####.#.#.#########v#
				#.#...#...#...###...>.#
				#.#.#v#######v###.###v#
				#...#.>.#...>.>.#.###.#
				#####v#.#.###v#.#.###.#
				#.....#...#...#.#.#...#
				#.#########.###.#.#.###
				#...###...#...#...#.###
				###.###.#.###v#####v###
				#...#...#.#.>.>.#.>.###
				#.###.###.#.###.#.#v###
				#.....###...###...#...#
				#####################.#
				`,
				expected: 154,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
