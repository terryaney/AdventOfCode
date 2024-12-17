import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const grid = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		util.logGrid(grid);
		console.log("------");
	}

	const directions = util.movementDeltas();
	const regions = findRegions(grid, directions);

	const getKey = (s: PointWithSides<string>, d: string) => `${s.x},${s.y},${d}`;

	const total = regions.reduce((sum, region) => {
		const area = region.length;

		if (isPart1) {
			return sum + area * region.reduce((sides, point) => sides + point.sides.length, 0);
		}

		let sides = 0;
		const visited = new Set<string>();
		
		for (const point of region) {
			for (const side of point.sides) {
				const key = getKey(point, side);
				if (visited.has(key)) continue;
				
				visited.add(key);
				sides++;

				const isNorthSouth = ["N", "S"].includes(side);
				for (const d of [-1, 1]) {
					let nx = point.x;
					let ny = point.y;

					while (true) {
						nx += (isNorthSouth ? d : 0);
						ny += (!isNorthSouth ? d : 0);

						if (!grid.isInside([nx, ny])) break;
						
						const neighbor = grid.points[ny][nx];
						if (neighbor.value != point.value || neighbor.sides.indexOf(side) == -1) break;
						
						visited.add(getKey(neighbor, side));
					}
				}
			}
		}

		return sum + area * sides;
	}, 0);

	return total;
};

const findRegions = (grid: GridWithSides<string>, directions: util.MovementDelta[]) => {
	const regions: Array<Array<PointWithSides<string>>> = [];

	for (let y = 0; y < grid.rows; y++) {
		for (let x = 0; x < grid.cols; x++) {
			const start = grid.points[y][x];
			if (start.visited) continue;

			start.visited = true;
		
			const queue: Array<PointWithSides<string>> = [start];
			const region: Array<PointWithSides<string>> = [start];

			while (queue.length > 0) {
				const currentPlot = queue.shift()!;
		
				for (const d of directions) {
					const nx = currentPlot.x + d.dx;
					const ny = currentPlot.y + d.dy;
		
					if (!grid.isInside([nx, ny])) {
						currentPlot.sides.push(d.name);
						continue;
					}
		
					const neighbor = grid.points[ny][nx]!;
					
					if (neighbor.value != start.value) {
						currentPlot.sides.push(d.name);
						continue;
					}

					if (neighbor.visited) continue;
					
					neighbor.visited = true;
					region.push(neighbor);
					queue.push(neighbor);
				}
			}
		
			regions.push(region);
		}
	}

	return regions;
}

const parseInput = (rawInput: string) => {
	const grid = util.parseGrid(rawInput);
	grid.points = grid.points.map(row => row.map(cell => ({ ...cell, sides: [] } as PointWithSides<string>)));
	return grid as GridWithSides<string>;
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

type PointWithSides<TValue> = util.Point<TValue> & {
    sides: Array<string>;
};
type GridWithSides<TValue> = util.Grid<TValue> & {
	points: Array<Array<PointWithSides<TValue>>>;
};

run({
	part1: {
		tests: [
			{
				input: `
				OOOOO
				OXOXO
				OOOOO
				OXOXO
				OOOOO
				`,
				expected: 772
			},
			{
				input: `
				RRRRIICCFF
				RRRRIICCCF
				VVRRRCCFFF
				VVRCCCJFFF
				VVVVCJJCFE
				VVIVCCJJEE
				VVIIICJJEE
				MIIIIIJJEE
				MIIISIJEEE
				MMMISSJEEE
				`,
				expected: 1930
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				AAAA
				BBCD
				BBCC
				EEEC
				`,
				expected: 80
			},
			{
				input: `
				OOOOO
				OXOXO
				OOOOO
				OXOXO
				OOOOO
				`,
				expected: 436
			},
			{
				input: `
				EEEEE
				EXXXX
				EEEEE
				EXXXX
				EEEEE
				`,
				expected: 236
			},
			{
				input: `
				AAAAAA
				AAABBA
				AAABBA
				ABBAAA
				ABBAAA
				AAAAAA
				`,
				expected: 368
			},
			{
				input: `
				RRRRIICCFF
				RRRRIICCCF
				VVRRRCCFFF
				VVRCCCJFFF
				VVVVCJJCFE
				VVIVCCJJEE
				VVIIICJJEE
				MIIIIIJJEE
				MIIISIJEEE
				MMMISSJEEE
				`,
				expected: 1206
			}
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: true
});