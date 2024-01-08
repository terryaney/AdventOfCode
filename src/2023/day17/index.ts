import run from "aoc-automation";
import * as util from '../../utils/index.js';

class Node {
	public x: number;
	public y: number;
	public heatLoss: number;
	public cost: number;
	public totalCost: number;
	public currentDirection: string | undefined;
	public currentDirectionMoves = 0;
	public parent: Node | undefined;
	public key: string;
	public isValid: boolean;

	constructor(x: number, y: number, heatLoss: number, huristic: number, parent: Node | undefined, minMoves: number, maxMoves: number) {
		this.x = x;
		this.y = y;
		this.parent = parent;
		this.heatLoss = heatLoss;

		this.currentDirection =
			parent == undefined ? undefined :
			parent.x == x ? (parent.y > y ? "N" : "S") :
			parent.y == y ? (parent.x > x ? "W" : "E") : undefined;

		this.currentDirectionMoves =
			parent == undefined ? 0 :
			this.currentDirection == parent.currentDirection ? parent.currentDirectionMoves + 1 : 1;
	
		this.key = `${this.x},${this.y},${this.currentDirection ?? " "},${this.currentDirectionMoves}`;

		// f(n) = g(n) + h(n)
		// g(n) = cost to get to this node (parent.cost + location.cost)
		// h(n) = heuristic cost to get to the end (manhattan distance)

		// huristic = 0; // Dykstra's algorithm
		this.cost = parent == undefined ? 0 : parent.cost + heatLoss;
		// f(n) = g(n) + h(n)
		this.totalCost = this.parent == undefined ? 0 : this.cost + huristic;

		const isOpposite = this.parent == undefined ? false :
			this.currentDirection == "N" && this.parent.currentDirection == "S" ||
			this.currentDirection == "S" && this.parent.currentDirection == "N" ||
			this.currentDirection == "W" && this.parent.currentDirection == "E" ||
			this.currentDirection == "E" && this.parent.currentDirection == "W";
		
		const canTurn = ( parent?.currentDirectionMoves ?? this.currentDirectionMoves ) >= minMoves || ( this.parent?.currentDirection ?? this.currentDirection ) == this.currentDirection;
		this.isValid = !isOpposite && canTurn && this.currentDirectionMoves <= maxMoves
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const map = lines.map((line, row) => line.split("").map((char, col) => Number(char)));
	const finish = { x: map[0].length - 1, y: map.length - 1 };
	
	return { map, finish };
};

function findHeatLoss(map: Array<Array<number>>, finish: { x: number, y: number }, minMoves: number, maxMoves: number) {
	let finishNode: Node | undefined;

	// Don't know if TS has a priority queue, so just inserting into array via sorting to correct position
	const open: Array<Node> = []
	const closed: Map<string, number> = new Map();

	open.push(new Node(0, 0, 0, finish.x + finish.y, undefined, minMoves, maxMoves));

	while (open.length > 0) {
		// get the node with the lowest total cost
		const current = open.shift()!;
		closed.set(current.key, current.cost);

		// check if we are at the end
		if (current.x == finish.x && current.y == finish.y && current.currentDirectionMoves >= minMoves) {
			finishNode = current;
			break;
		}

		// get the neighbors of the current node
		[
			{ x: current.x - 1, y: current.y },
			{ x: current.x + 1, y: current.y },
			{ x: current.x, y: current.y - 1 },
			{ x: current.x, y: current.y + 1 }
		].filter(n => n.x >= 0 && n.x < map[0].length && n.y >= 0 && n.y < map.length)
			.forEach(n => {
				const neighbor = new Node(
					n.x,
					n.y,
					map[n.y][n.x],
					// h(n) = heuristic cost to get to the end (manhattan distance)
					Math.abs(n.x - finish.x) + Math.abs(n.y - finish.y),
					current,
					minMoves,
					maxMoves
				);

				if (neighbor.isValid) {
					let openIndex = -1;
				
					if ((openIndex = open.findIndex(n => n.key == neighbor.key)) > -1 && neighbor.cost < open[openIndex].cost) {
						open.splice(openIndex, 1);
						openIndex = -1; // we removed the node from the list
					}
					else if (closed.has(neighbor.key) && neighbor.cost < closed.get(neighbor.key)!) {
						closed.delete(neighbor.key);
					}
				
					if (openIndex == -1 && !closed.has(neighbor.key)) {
						let maxIndex = -1;
						for (let index = 0; index < open.length; index++) {
							if (open[index].totalCost > neighbor.totalCost) {
								maxIndex = index
								break;
							}
						}

						if (maxIndex == -1) {
							open.push(neighbor);
						}
						else {
							open.splice(maxIndex, 0, neighbor);
						}
					}
				}
			});
	}
	return finishNode;
}

function getPathCost(node: Node | undefined) {
	let totalCost = 0;
	while (node != undefined) {
		totalCost += node.heatLoss;
		node = node.parent;
	}
	return totalCost;	
}

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	return getPathCost(!isPart2
		? findHeatLoss(input.map, input.finish, 0, 3)
		: findHeatLoss(input.map, input.finish, 4, 10));
};

function printPath(lines: string[], node: Node | undefined) {
	let totalCost = 0;
	const path: string[] = [];
	const pathNodes: Map<string, string> = new Map();
	
	/*
	seen.forEach((value, key) => {
		const [x, y] = key.split(",").map(Number);
		lines[y] = lines[y].substring(0, x) + "X" + lines[y].substring(x + 1);
	});
	*/
	
	while (node != undefined) {
		totalCost += node.heatLoss;
		const char =
			node.currentDirection == "S" ? "v" :
				node.currentDirection == "N" ? "^" :
					node.currentDirection == "W" ? "<" :
						node.currentDirection == "E" ? ">" :
							lines[node.y][node.x];
	
		// lines[node.y] = lines[node.y].substring(0, node.x) + char + lines[node.y].substring(node.x + 1);
		path.push(`(${node.x},${node.y})`);
		pathNodes.set(`${node.x},${node.y}`, char);
		node = node.parent;
	}
	
	console.log(`Path: ${path.reverse().join(" -> ")}`);
	console.log(`Cost: ${totalCost}`);
	console.log("");
	// console.log(lines.map((line, row) => line.split("").map((c, col) => ` ${c}${pathNodes.has(`${col},${row}`) && pathNodes.get(`${col},${row}`) != c ? pathNodes.get(`${col},${row}`) : " "}`).join("")).join("\r\n"));
}

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				2413432311323
				3215453535623
				3255245654254
				3446585845452
				4546657867536
				1438598798454
				4457876987766
				3637877979653
				4654967986887
				4564679986453
				1224686865563
				2546548887735
				4322674655533
				`,
				expected: 102
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `
				2413432311323
				3215453535623
				3255245654254
				3446585845452
				4546657867536
				1438598798454
				4457876987766
				3637877979653
				4654967986887
				4564679986453
				1224686865563
				2546548887735
				4322674655533
				`,
				expected: 94
			},
			{
				input: `
				111111111111
				999999999991
				999999999991
				999999999991
				999999999991
				`,
				expected: 71
			}
		],
		solution: part2
	},
	trimTestInputs: true
});