import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const grid = util.parseGrid(rawInput, undefined, cell => ["<", ">", "^", "v"].includes(cell));
	
	const row = grid.points.findIndex(r => r.some(c => c.visited));
	const col = grid.points[row].findIndex(c => c.visited);

	return {
		start: { row, col, orientation: grid.points[row][col].value },
		grid
	};
};

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const { start, grid } = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		util.logGrid(grid);
		console.log("------");
	}

	const move = (orientation: string, row: number, col: number) => {
		let dc = 0;
		let dr = 0;

		switch (orientation) {
			case "<": dc--; break;
			case ">": dc++; break;
			case "^": dr--; break;
			case "v": dr++; break;
		}

		return row + dr >= 0 && row + dr < grid.rows && col + dc >= 0 && col + dc < grid.cols
			? { dr, dc }
			: undefined;
	};

	const turn = (orientation: string) => {
		switch (orientation) {
			case "<": return "^";
			case ">": return "v";
			case "^": return ">";
			default: return "<";
		}
	}

	const walk = (markVisit: boolean = true) => {
		let row = start.row;
		let col = start.col;
		let orientation = start.orientation;
		
		const seen = new Set<string>();
		seen.add(`${row},${col},${!markVisit ? orientation : ''}`);
		
		let moveTo = move(orientation, row, col);
		while (moveTo != undefined) {
			if (grid.points[moveTo.dr + row][moveTo.dc + col].value === "#") {
				orientation = turn(orientation);
			} else {
				row += moveTo.dr;
				col += moveTo.dc;
				if (markVisit) {
					grid.points[row][col].visited = true;
				}
				const key = `${row},${col},${!markVisit ? orientation : ''}`;
				if (!markVisit && seen.has(key)) return undefined;
				seen.add(key);
			}
			moveTo = move(orientation, row, col);
		}
		return seen;
	};

	const visted = walk();

	if (isPart1) {
		return visted!.size;
	} else {
		let total = 0;

		// brute force...
		for (let r = 0; r < grid.rows; r++) {
			for (let c = 0; c < grid.cols; c++) {
				const cell = grid.points[r][c];
				if (!cell.visited || cell.value != ".") continue;

				cell.value = "#";
				
				if (walk(false) == undefined) {
					total++;
				}

				cell.value = ".";
			}
		}

		return total;
	}
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				....#.....
				.........#
				..........
				..#.......
				.......#..
				..........
				.#..^.....
				........#.
				#.........
				......#...
				`,
				expected: 41
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				....#.....
				.........#
				..........
				..#.......
				.......#..
				..........
				.#..^.....
				........#.
				#.........
				......#...
				`,
				expected: 6
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
