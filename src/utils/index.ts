/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.ts,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.ts'
 *     import { myUtil } from '../utils/index.ts'
 *
 *   also incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 *
 */

export const parseLines = (rawInput: string): Array<string> => rawInput.split("\n");

export const parseLinesIntoArrays = (rawInput: string, lineSplit: string, toNumber: boolean = false): Array<Array<string | number>> =>
	parseLines(rawInput).map((line) => line.split(lineSplit).map((x) => toNumber ? Number(x) : x));

export const movementDeltas = (includeDiagonals?: boolean) =>
	includeDiagonals
		? [
			{ dx: -1, dy: 0, direction: "W", opposite: "E" } as MovementDelta,
			{ dx: -1, dy: -1, direction: "NW", opposite: "SE" } as MovementDelta,
			{ dx: 0, dy: 1, direction: "N", opposite: "S" } as MovementDelta,
			{ dx: 1, dy: 1, direction: "NE", opposite: "SW" } as MovementDelta,
			{ dx: 1, dy: 0, direction: "E", opposite: "W" } as MovementDelta,
			{ dx: 1, dy: -1, direction: "SE", opposite: "NW" } as MovementDelta,
			{ dx: 0, dy: -1, direction: "S", opposite: "N" } as MovementDelta,
			{ dx: -1, dy: 1, direction: "SW", opposite: "NE" } as MovementDelta
		]
		: [
			{ dx: -1, dy: 0, direction: "W", opposite: "E" } as MovementDelta,
			{ dx: 0, dy: -1, direction: "N", opposite: "S" } as MovementDelta,
			{ dx: 1, dy: 0, direction: "E", opposite: "W" } as MovementDelta,
			{ dx: 0, dy: 1, direction: "S", opposite: "N" } as MovementDelta
		];

export type MovementDelta = { dx: number, dy: number, direction: string, opposite: string };
export type Point<TValue> = { x: number, y: number, value: TValue, visited: boolean };
export type Grid<TValue> = {
	points: Array<Array<Point<TValue>>>,
	rows: number,
	cols: number,
	isInside: (point: Array<number>) => boolean,
	find: (value: TValue) => Point<TValue> | undefined
};

export const parseGrid = <TValue = string>(rawInput: string, convert?: (value: string) => TValue, visited?: (value: string) => boolean): Grid<TValue> => {
	const convertFn = convert ?? ((value: string) => value as unknown as TValue);
	const visitedFn = visited ?? ((value: string) => false);
	const points = rawInput.split("\n").map((row, y) => row.split("").map((cell, x) => ({ x, y, value: convertFn(cell), visited: visitedFn(cell) })));

	return {
		points,
		rows: points.length,
		cols: points[0].length,
		isInside: ([x, y]) => x >= 0 && x < points[0].length && y >= 0 && y < points.length,
		find: (value: TValue) => {
			for (let y = 0; y < points.length; y++) {
				for (let x = 0; x < points[0].length; x++) {
					if (points[y][x].value === value) {
						return points[y][x];
					}
				}
			}
			return undefined;
		}
	};
} 

export const logGrid = <TValue>(grid: Grid<TValue>, title?: string): void => {
	console.log((title || "") + "\n");
	const rows = grid.rows;
	const cols = grid.cols;
	const rowDigits = String(rows - 1).length;
	const colDigits = String(cols - 1).length;
	const maxCellSpace = Math.max(colDigits, grid.points.flat().reduce((max, cell) => Math.max(max, String(cell.value).length + 1), 0));
	const logX_Axis = () => console.log(`${" ".repeat(rowDigits)} | ${Array.from({ length: cols }, (_, i) => i.toString().padStart(colDigits, "0").padStart(maxCellSpace, " ")).join(" ")}`);
	const logHorizontalLine = () => console.log(`${"-".repeat(rowDigits)}-${Array.from({ length: cols }, (_, i) => "-".padStart(maxCellSpace, "-")).join("-")}--`);
	
	logX_Axis();
	logHorizontalLine();
	grid.points.forEach((row, y) => {
		console.log(`${y.toString().padStart(rowDigits, "0")} | ${row.map( cell => " ".repeat(maxCellSpace - 2) + (cell.visited ? "*" : " ") + cell.value).join(" ")}`);
	});
	logHorizontalLine();
	logX_Axis();

	console.log("")
};

export const manhattanDistance = <TValue = string>(a: Point<TValue> | PathNode, b: Point<TValue> | PathNode): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export class PathNode {
	x: number;
	y: number;
	costFromStart: number;
	costToFinish: number;
	totalCost: number;
	direction: 'N' | 'E' | 'S' | 'W';
	parent?: PathNode;

	constructor(x: number, y: number, direction: 'N' | 'E' | 'S' | 'W') {
		this.x = x;
		this.y = y;
		this.direction = direction;
		this.costFromStart = 0;
		this.costToFinish = 0;
		this.totalCost = 0;	
	}
}

const get_aStarNeighbors = <TValue = string>(grid: Grid<TValue>, node: PathNode, movementDeltas: Array<MovementDelta>): Array<PathNode> => {
	const neighbors = movementDeltas.map((delta) => {
		const x = node.x + delta.dx;
		const y = node.y + delta.dy;
		
		if (!grid.isInside([x, y])) return undefined;

		return new PathNode(x, y, delta.direction as 'N' | 'E' | 'S' | 'W');
	}).filter(n => n != undefined);

	return neighbors as Array<PathNode>;
};

export const aStar = <TValue = string>(
	grid: Grid<TValue>,
	start: PathNode,
	end: PathNode,
	movementDeltas: Array<MovementDelta>,	
	movementCost: (current: PathNode, neighbor: PathNode) => number = (current, neighbor) => 1,
	canMove: (neighbor: PathNode) => boolean = (neighbor) => grid.points[neighbor.y][neighbor.x].value != "#"
): Array<Array<PathNode>> | undefined => {
	// Step 1: Find openList node with lowest totalCost, move node to closedList
	// Step 2: If currentNode = end, return path (reversed)
	// Step 3: Get neighbors of currentNode
	//		- If in closedList, skip
	//		- If not in openList, calculate costs, set parent, add to openList
	//		- If in openList and costFromStart is lower, update costFromStart and parent
	// Step 4: Repeat
	
	start.costFromStart = 0;
	start.costToFinish = manhattanDistance(start, end);
	start.totalCost = start.costFromStart + start.costToFinish;

	const openList = [start];
	const closedList: Array<PathNode> = [];
	const backTracks: Record<string, Array<PathNode>> = {};
	
	let isStartMovement = true;
	const pathsFound: Array<PathNode> = [];

	while (openList.length > 0) {
		const currentNode = openList.reduce((minNode, node) => node.totalCost < minNode.totalCost ? node : minNode, openList[0]);
		const currentIndex = openList.indexOf(currentNode);
		
		openList.splice(currentIndex, 1);
		closedList.push(currentNode);

		if (currentNode.x === end.x && currentNode.y === end.y) {
			pathsFound.push(currentNode);
			break;
		}

		const neighbors = get_aStarNeighbors(grid, currentNode, movementDeltas.filter(d => isStartMovement || d.direction != d.opposite));
		isStartMovement = false;

		for (const neighbor of neighbors) {
			if (!canMove(neighbor)) continue;
			const closedNeighbor = closedList.find(n => n.x == neighbor.x && n.y == neighbor.y)
			const costFromStart = currentNode.costFromStart + movementCost(currentNode, neighbor);

			if (closedNeighbor) {
				continue;
			}

			const openNeighbor = openList.find(n => n.x == neighbor.x && n.y == neighbor.y);

			if (!openNeighbor || costFromStart < openNeighbor.costFromStart) {
				neighbor.costFromStart = costFromStart;
				neighbor.costToFinish = manhattanDistance(neighbor, end);
				neighbor.totalCost = neighbor.costFromStart + neighbor.costToFinish;
				neighbor.parent = currentNode;

				if (!openNeighbor) {
					openList.push(neighbor);
				}
			}
		}
	}

	if (pathsFound.length == 0) return undefined;
	
	const allPaths: Array<Array<PathNode>> = [];

	for (const endPath of pathsFound) {
		allPaths.push(...getPaths(endPath, backTracks));
	}
	return allPaths;
};

const getBackTrackKey = (node?: PathNode) => `${node?.x},${node?.y}`;
const clearBackTrack = (node: PathNode, backTracks: Record<string, Array<PathNode>>) => delete backTracks[getBackTrackKey(node)];
const addBackTrack = (node: PathNode, backTracks: Record<string, Array<PathNode>>) => {
	const key = getBackTrackKey(node);
	if (!backTracks[key]) backTracks[key] = [];
	backTracks[key].push(node);
};

const getPaths = (node: PathNode, backTracks: Record<string, Array<PathNode>>): Array<Array<PathNode>> => {
	const allPaths: Array<Array<PathNode>> = [];
	const path: Array<PathNode> = [];
	let current: PathNode | undefined = node;
	while (current) {
		path.push(current);
		current = current.parent;

		const backTrack = backTracks[getBackTrackKey(current)];
		
		if (backTrack) {
			const pathToEnd = [...path].reverse();
			for (const backNode of backTrack) {
				const backNodePath = getPaths(backNode, backTracks);
				backNodePath.forEach(p => allPaths.push([...p, ...pathToEnd]));
			}
		}
	}
	allPaths.push(path.reverse());
	return allPaths;
};
