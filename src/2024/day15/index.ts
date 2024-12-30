import run from "aoc-automation";
import * as util from "../../utils/index.js";
import { dir } from "console";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const input = parseInput(rawInput, isPart1);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		util.logGrid(input.grid);
		console.log("------");
	}

	const deltas = util.Movement.Directions;
	const deltaMap: Record<string, util.MovementDelta> = {
		">": deltas.find(d => d.direction === "E")!,
		"<": deltas.find(d => d.direction === "W")!,
		"^": deltas.find(d => d.direction === "N")!,
		"v": deltas.find(d => d.direction === "S")!
	};


	for (const movement of input.movements) {
		for (let m = 0; m < movement.length; m++) {
			const direction = movement[m];
			const visited = new Set<string>();

			var robotLocation = isPart1
				? moveElementPart1(input.grid, deltaMap, input.robot.x, input.robot.y, direction)
				: getElementsToMovePart2(input.grid, deltaMap, visited, input.robot.x, input.robot.y, direction);
			
			if (robotLocation == undefined || (!isPart1 && (robotLocation as Array<ElementToMove>).length == 0)) {
				while (m < movement.length - 1 && direction == movement[m + 1]) {
					m++;
				}
				continue;
			}
			
			if (!isPart1) {
				const elementsToMove = robotLocation as Array<ElementToMove>;
				if (elementsToMove.length == 0) continue;

				visited.clear();
				for (const element of elementsToMove) {
					const from = input.grid.points[element.fromY][element.fromX];
					const to = input.grid.points[element.toY][element.toX];
					to.value = element.value;
					let key = `${element.toX},${element.toY}`;
					visited.add(key);

					key = `${element.fromX},${element.fromY}`;
					if (visited.has(key)) continue;
					from.value = ".";
				}
				robotLocation = [elementsToMove[elementsToMove.length - 1].toX, elementsToMove[elementsToMove.length - 1].toY];
			}
			
			const newLocation = robotLocation as Array<number>;
			input.robot.x = newLocation[0];
			input.robot.y = newLocation[1];
	
			// if (testName != undefined && !isPart1) util.logGrid(input.grid, `Direction ${movement[m]}`);
		}
	}

	// util.logGrid(input.grid, `After Movements`);

	const total = input.grid.points.reduce((acc, row) => {
			return acc + row.reduce((acc, cell) => {
				return acc + ((cell.value == "O" || cell.value == "[") ? 100 * (cell.y + 1) + (cell.x + 1) : 0);
			}, 0);
		}, 0);

	// console.log(`Total: ${total}`);
	return total;
};

class ElementToMove
{	
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	value: string;

	constructor(fromX: number, fromY: number, toX: number, toY: number, value: string)
	{
		this.fromX = fromX;
		this.fromY = fromY;
		this.toX = toX;
		this.toY = toY;
		this.value = value;
	}
}

const getElementsToMovePart2 = (grid: util.Grid<string>, deltaMap: Record<string, util.MovementDelta>, visited: Set<string>, x: number, y: number, direction: string): Array<ElementToMove> | undefined => {
	const delta = deltaMap[direction];
	const nextX = x + delta.dx;
	const nextY = y + delta.dy;
	const elementsToMove: Array<ElementToMove> = [];

	const nextCell = grid.isInside([nextX, nextY])
		? grid.points[nextY][nextX]
		: undefined;
	
	if (nextCell == undefined || nextCell.value == "#") return;

	const key = `${nextX},${nextY}`;
	if (visited.has(key)) return [];
	visited.add(key);

	const isLR = direction == ">" || direction == "<";
	const isBoxNext = nextCell.value == "[" || nextCell.value == "]";

	if (isBoxNext) {
		let nextToMove = getElementsToMovePart2(grid, deltaMap, visited, nextCell.x, nextCell.y, direction);
		if (!nextToMove) return;
		elementsToMove.push(...nextToMove);
		
		if (!isLR) {
			// isLR means simple movements, don't have to worry about overlapping edge cases...
			nextToMove = getElementsToMovePart2(grid, deltaMap, visited, nextCell.x + (nextCell.value == "[" ? 1 : -1), nextCell.y, direction);
			if (!nextToMove) return;
			elementsToMove.push(...nextToMove);
		}
	}

	const curValue = grid.points[y][x].value;
	if (isLR || curValue != "]") {
		elementsToMove.push(new ElementToMove(x, y, nextX, nextY, grid.points[y][x].value));
		if (!isLR && curValue == "[") {
			elementsToMove.push(new ElementToMove(x + 1, y, nextX + 1, nextY, grid.points[y][x + 1].value));
		}
	}
	return elementsToMove
}

const moveElementPart1 = (grid: util.Grid<string>, deltaMap: Record<string, util.MovementDelta>, x: number, y: number, direction: string): Array<number> | undefined => {
	const delta = deltaMap[direction];
	const nextX = x + delta.dx;
	const nextY = y + delta.dy;

	const nextCell = grid.isInside([nextX, nextY])
		? grid.points[nextY][nextX]
		: undefined;
	
	if (nextCell == undefined || nextCell.value == "#") return;

	// If you can't push the object, return
	if (nextCell.value == "O" && !moveElementPart1(grid, deltaMap, nextX, nextY, direction)) return;

	if (nextCell.value == ".") {
		nextCell.value = grid.points[y][x].value;
		grid.points[y][x].value = ".";
		return [nextX, nextY];
	}
}

const parseInput = (rawInput: string, isPart1: boolean) => {
	const lines = util.parseLines(rawInput);
	const blankLine = lines.indexOf("");
	const gridLines =
		lines.slice(1, blankLine - 1)
			.map(l => {
				const gridLine = l.slice(1, l.length - 1);
				if (isPart1) return gridLine;

				const elements =
					gridLine
						.split("")
						.map(c => c == "." ? ".." : c == "O" ? "[]" : c == "@" ? "@." : "##")
						.join("");
				return `#${elements}#`;
			});
	
	const grid = util.parseGrid(gridLines.join("\n"));
	const rY = grid.points.findIndex(row => row.findIndex(cell => cell.value === "@") !== -1);
	const rX = grid.points[rY].findIndex(cell => cell.value === "@");
	const movements = lines.slice(blankLine + 1);
	return {
		grid,
		robot: { x: rX, y: rY },
		movements
	};
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				########
				#..O.O.#
				##@.O..#
				#...O..#
				#.#.O..#
				#...O..#
				#......#
				########

				<^^>>>vv<v>>v<<
				`,
				expected: 2028
			},
			{
				input: `
				##########
				#..O..O.O#
				#......O.#
				#.OO..O.O#
				#..O@..O.#
				#O#..O...#
				#O..O..O.#
				#.OO.O.OO#
				#....O...#
				##########

				<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
				vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
				><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
				<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
				^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
				^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
				>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
				<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
				^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
				v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
				`,
				expected: 10092
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			/*
			{
				input: `
				#######
				#...#.#
				#.....#
				#..OO@#
				#..O..#
				#.....#
				#######

				<vv<<^^<<^^
				`,
				expected: 100
			},
			*/
			{
				input: `
				##########
				#..O..O.O#
				#......O.#
				#.OO..O.O#
				#..O@..O.#
				#O#..O...#
				#O..O..O.#
				#.OO.O.OO#
				#....O...#
				##########

				<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
				`,
				expected: 9021
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
