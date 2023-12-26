import run from "aocrunner";
import * as util from '../utils/index.js';
import { start } from "repl";

class Node {
	public x: number;
	public y: number;
	public cost: number;
	public key: string;
	public totalCost: number;
	public visited: Set<string>;
	public parent: Node | undefined;

	constructor(x: number, y: number, cost: number, huristic: number, parent?: Node) {
		this.x = x;
		this.y = y;
		this.cost = cost;
		this.key = `${this.x},${this.y}`;
		this.totalCost = this.cost + huristic;
		this.visited = new Set(parent?.visited.keys() ?? []);
		this.visited.add(this.key);
		this.parent = parent;
	}
}

const manhattanDistance = (a: { x: number, y: number }, b: { x: number, y: number } ) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);	
	const finish = { x: lines[lines.length - 1].indexOf("."), y: lines.length - 1 };
	const startCol = lines[0].indexOf(".");
	const input = { map: lines, start: new Node(startCol, 0, 0, manhattanDistance({ x: startCol, y: 0 }, finish)), finish: finish };
	// console.log(input);
	return input;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = parseInput(rawInput);

	const map = input.map;
	const open: Array<Node> = [input.start]
	const closed: Map<string, number> = new Map();

	let finishNode: Node | undefined = undefined;

	while (open.length > 0) {
		const current = open.shift()!;
		const key = `${current.x},${current.y}`;
		closed.set(key, current.cost);
		
		if ( current.x == input.finish.x && current.y == input.finish.y ) {
			if (finishNode == undefined || current.cost > finishNode.cost) {
				finishNode = current;
			}
			continue;
		}

		const part2Allowed = ".<>^v";
		const moves = [
			{ x: current.x - 1, y: current.y, allowed: ".<" },
			{ x: current.x + 1, y: current.y, allowed: ".>" },
			{ x: current.x, y: current.y - 1, allowed: ".^" },
			{ x: current.x, y: current.y + 1, allowed: ".v" }
		].filter(n => n.x >= 0 && n.x < map[0].length && n.y >= 0 && n.y < map.length && ( isPart1 ? n.allowed : part2Allowed ).indexOf(map[n.y][n.x]) > -1 && !current.visited.has(`${n.x},${n.y}`));

		moves.forEach(n => {
			const neighbor = new Node(n.x, n.y, current.cost + 1, manhattanDistance(n, input.finish), current);
			
			let openIndex = -1;
			
			if ((openIndex = open.findIndex(n => n.key == neighbor.key)) > -1 && neighbor.cost > open[openIndex].cost) {
				open.splice(openIndex, 1);
				openIndex = -1; // we removed the node from the list
			}
			else if (closed.has(neighbor.key) && neighbor.cost > closed.get(neighbor.key)!) {
				closed.delete(neighbor.key);
			}

			if (openIndex == -1 && !closed.has(neighbor.key)) {
				let insertIndex = -1;
				for (let index = 0; index < open.length; index++) {
					if (open[index].totalCost < neighbor.totalCost) {
						insertIndex = index
						break;
					}
				}

				open.splice(Math.max(insertIndex, 0), 0, neighbor);
			}
		});
	}

	// printPath(input.map, finishNode);

	return finishNode!.cost;
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