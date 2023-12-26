import run from "aocrunner";
import * as util from '../utils/index.js';

const directionsAllowed: Record<string, Array<{ x: number, y: number }>> = {
	"<": [{ x: -1, y: 0 }],
	">": [{ x: 1, y: 0 }],
	"^": [{ x: 0, y: -1 }],
	"v": [{ x: 0, y: 1 }],
	".": [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }]
};

const getPossibleMoves = (lines: string[], x: number, y: number, isPart1: boolean) => {
	const possibleMoves = isPart1
		? directionsAllowed[lines[y][x]]
		: lines[y][x] != "#" ? directionsAllowed["."] : [];

	return possibleMoves
		.map(n => ({ x: x + n.x, y: y + n.y }))
		.filter(n => n.x >= 0 && n.x < lines[0].length && n.y >= 0 && n.y < lines.length && lines[n.y][n.x] != "#");
};

const parseInput = (rawInput: string, isPart1: boolean) => {
	const lines = util.parseLines(rawInput);	
	const start = { x: lines[0].indexOf("."), y: 0 };
	const finish = { x: lines[lines.length - 1].indexOf("."), y: lines.length - 1 };

	// Changing to be 'edge contraction' friendly, so identify all nodes that have 2 possible neighbors
	const points = new Map<string, { x: number, y: number }>([start, finish].map(n => [`${n.x},${n.y}`, n]));

	// Find all points of interest by finding nodes with 3 or more valid neighbors
	for (let y = 0; y < lines.length; y++) {
		for (let x = 0; x < lines[y].length; x++) {
			// Pass false for possible moves here b/c everything is allowed
			if (getPossibleMoves(lines, x, y, false).length >= 3) {
				points.set(`${x},${y}`, { x, y });
			}
		}
	}

	const graph: Map<string, Map<string, number>> = new Map();
	
	// Find distance to next point of interest and make a graph element
	points.forEach(start => {
		const stack = [{ x: start.x, y: start.y, distance: 0 }]
		const startKey = `${start.x},${start.y}`;
		const visited = new Set([startKey]);
		
		while (stack.length > 0) {
			const current = stack.pop()!;
			const currentKey = `${current.x},${current.y}`;

			if (current.distance != 0 && points.has(currentKey)) {
				const graphItem = graph.get(startKey) ?? graph.set(startKey, new Map()).get(startKey)!;
				graphItem.set(currentKey, current.distance);
				continue;
			}

			getPossibleMoves(lines, current.x, current.y, isPart1)
				.filter(n => !visited.has(`${n.x},${n.y}`))
				.forEach(n => {
					stack.push({ x: n.x, y: n.y, distance: current.distance + 1 });
					visited.add(`${n.x},${n.y}`);
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

	const seen = new Set<string>();

	const bfs = (pt: string) => {
		if (pt == finish) {
			return 0;
		}

		let maxDistance = -1;

		// Prevent cycles/backtracking
		seen.add(pt);
		input.graph.get(pt)!.forEach((distance, neighbor) => {
			if (!seen.has(neighbor)) {
				maxDistance = Math.max(maxDistance, bfs(neighbor) + distance);
			}
		});
		seen.delete(pt);
		return maxDistance;
	};
	
	return bfs(`${input.start.x},${input.start.y}`);
};

function printPath(lines: string[], node: Node | undefined) {
	const pathNodes: Map<string, string> = new Map();
	
	while (node != undefined) {
		pathNodes.set(`${node.x},${node.y}`, "0");
		node = node.parent;
	}
	
	console.log("");
	// console.log(lines.map((line, row) => line.split("").map((c, col) => ` ${c}${pathNodes.has(`${col},${row}`) && pathNodes.get(`${col},${row}`) != c ? pathNodes.get(`${col},${row}`) : " "}`).join("")).join("\r\n"));
	console.log(lines.map((line, row) => line.split("").map((c, col) => `${pathNodes.has(`${col},${row}`) ? "0" : c}`).join("")).join("\r\n"));
}

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: true,
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
				expected: 94
			}
		],
		solution: part1
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
				expected: 154
			}
		],
		solution: part2
	},
	trimTestInputs: true
});