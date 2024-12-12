import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const grid = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Grid`);
		util.logGrid(grid);
		console.log("------");
	}

	const rows = grid.length;
	const cols = grid[0].length;
	const trailheads = grid.flatMap((row, y) => row.map((cell, x) => cell == 0 ? [x, y] : null)).filter(x => x != null) as [number, number][];
	const deltas = util.movementDeltas();

	const key = (x: number, y: number) => `${x},${y}`;

	// BFS
	const getSummits = (x: number, y: number) => {
		const queue: [number, number][] = [[x, y]];
		const visited = new Set<string>(key(x, y));

		let summits = 0;
		while (queue.length > 0) {
			const [cx, cy] = queue.shift()!;
			for (const [dx, dy] of deltas) {
				const nx = cx + dx;
				const ny = cy + dy;
				// in grid
				if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
				// one elevation change
				const nextValue = grid[ny][nx];
				if (nextValue != grid[cy][cx] + 1) continue;

				const deltaKey = key(nx, ny);
				if (isPart1 && visited.has(deltaKey)) continue;
				visited.add(deltaKey);

				if (nextValue == 9) {
					summits++;
				}
				else {
					queue.push([nx, ny]);
				}
			}
		}

		return summits;
	};

	let total = 0;

	for (const [x, y] of trailheads) {
		total += getSummits(x, y);;
	}

	return total;
};

const parseInput = (rawInput: string) => {
	const grid = util.parseGrid(rawInput);
	return grid.map(row => row.map(c => parseInt(c)));
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				89010123
				78121874
				87430965
				96549874
				45678903
				32019012
				01329801
				10456732
				`,
				expected: 36
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				89010123
				78121874
				87430965
				96549874
				45678903
				32019012
				01329801
				10456732
				`,
				expected: 81
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
