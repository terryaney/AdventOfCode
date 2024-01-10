import run from "aoc-automation";
import * as util from "../../utils/index.js";

class Dig {
	public color: string | undefined;
	public shape: string | undefined;

	constructor(color?: string, shape?: string) {
		this.color = color;
		this.shape = shape;
	}
}

class Instruction {
	public direction: string;
	public distance: number;
	public color: string;

	constructor(direction: string, distance: number, color: string) {
		this.direction = direction;
		this.distance = distance;
		this.color = color;
	}
}

function convertHexToNumber(hex: string): number {
	return parseInt(hex, 16);
}

class Shoelace {
	private permimeter = 0;
	private points: Array<{ x: number; y: number }> = [];
	private location = { x: 0, y: 0 };

	public addPoint(direction: string, length: number) {
		const directions = {
			R: { x: 1, y: 0 },
			D: { x: 0, y: 1 },
			L: { x: -1, y: 0 },
			U: { x: 0, y: -1 },
		} as { [key: string]: { x: number; y: number } };
		this.permimeter += length;
		this.location.x += directions[direction].x * length;
		this.location.y += directions[direction].y * length;
		this.points.push({ x: this.location.x, y: this.location.y });
	}

	public calculateArea(): number {
		let area = 0;

		for (let index = 1; index < this.points.length; index++) {
			const p1 = this.points[index - 1];
			const p2 = this.points[index];
			area += (p2.x - p1.x) * (p2.y + p1.y);
		}

		return Math.abs(area) / 2 + this.permimeter / 2 + 1;
	}
}

const parseInput = (rawInput: string, isPart2: boolean) => {
	const lines = util.parseLines(rawInput);
	return !isPart2
		? lines.map(line => {
				const parts = line.split(" ");
				return new Instruction(
					parts[0],
					Number(parts[1]),
					parts[2].substring(1, parts[2].length - 1),
				);
		  })
		: lines.map(line => {
				const parts = line.split(" ");
				const hex = parts[2].substring(2, parts[2].length - 2);
				const direction = parts[2].substring(
					parts[2].length - 2,
					parts[2].length - 1,
				);
				return new Instruction(
					direction == "0"
						? "R"
						: direction == "1"
						? "D"
						: direction == "2"
						? "L"
						: "U",
					convertHexToNumber(hex),
					parts[2].substring(1, parts[2].length - 1),
				);
		  });
};

function findItemsInsideLoop(
	grid: Array<Array<{ shape: string } | undefined>>,
	processInsideItems: (row: number, col: number, items: number) => void,
) {
	for (let row = 0; row < grid.length; row++) {
		const locations = grid[row];
		for (let col = 0; col < locations.length; col++) {
			const location = locations[col];

			if (location == undefined) {
				// Not part of loop, try ray tracing...
				let crossings = 0;
				let foundTheLoop = false;
				let foundNextLocation = false;
				let itemsInGroup = 1;
				let lastCorner: string | undefined;
				let nextLocationCol = col;

				for (let ray = col + 1; ray < locations.length; ray++) {
					foundTheLoop ||= locations[ray] != undefined;

					if (locations[ray] == undefined) {
						// tile we MIGHT need to check...
						if (!foundTheLoop) {
							// If I haven't found loop yet and current ray item
							// needs to be checked, it will have same result
							// the location I'm checking...
							itemsInGroup++;
						} else if (!foundNextLocation) {
							// Once I've found loop, the first undefined items
							// I hit will be the next location I check...
							foundNextLocation = true;
							nextLocationCol = ray - 1;
						}
					} else {
						const shape = locations[ray]!.shape;

						if (
							shape == "|" ||
							("L7".indexOf(shape) > -1 &&
								"L7".indexOf(lastCorner!) > -1) ||
							("FJ".indexOf(shape) > -1 &&
								"FJ".indexOf(lastCorner!) > -1)
						) {
							crossings++;
						}

						if ("7JLF".indexOf(shape) > -1) {
							// If I hit a corner, if not already hitting a corner, assign it, otherwise
							// clear out (meaning I'm moving up or down again)
							lastCorner =
								lastCorner == undefined ? shape : undefined;
						}
					}
				}

				if (crossings % 2 == 1) {
					processInsideItems(row, col, itemsInGroup);
				}

				if (!foundNextLocation) {
					break; // No more locations to search in this row...
				}
				col = nextLocationCol;
			}
		}
	}
}

function calculateAreaWithRayTracing(instructions: Array<Instruction>) {
	let origin = { x: 0, y: 0 };
	let position = { x: 0, y: 0 };
	let height = 0;
	let width = 0;

	// Size grid...
	instructions.forEach(instruction => {
		let growth: number | undefined;

		switch (instruction.direction) {
			case "R":
				width = Math.max(width, instruction.distance + position.x + 1);
				position.x += instruction.distance;
				break;
			case "D":
				height = Math.max(
					height,
					instruction.distance + position.y + 1,
				);
				position.y += instruction.distance;
				break;
			case "L":
				if (instruction.distance > position.x) {
					growth = instruction.distance - position.x;
					width += growth;
					origin.x += growth;
					position.x = 0;
				} else {
					position.x -= instruction.distance;
				}
				break;
			case "U":
				if (instruction.distance > position.y) {
					growth = instruction.distance - position.y;
					height += growth;
					origin.y += growth;
					position.y = 0;
				} else {
					position.y -= instruction.distance;
				}
				break;
		}
	});

	const grid: Array<Array<Dig | undefined>> = new Array(height)
		.fill(undefined)
		.map(() => new Array(width));

	// Draw grid...
	let previousDirection = instructions[instructions.length - 1].direction;

	instructions.forEach(instruction => {
		// console.log(`Instruction: ${instruction.direction} ${instruction.distance} ${instruction.color}`);
		switch (instruction.direction) {
			case "R":
			case "L":
				for (let index = 0; index < instruction.distance; index++) {
					const dig = new Dig(
						instruction.color,
						previousDirection == "U" && instruction.direction == "R"
							? "F"
							: previousDirection == "U" &&
							  instruction.direction == "L"
							? "7"
							: previousDirection == "D" &&
							  instruction.direction == "R"
							? "L"
							: previousDirection == "D" &&
							  instruction.direction == "L"
							? "J"
							: "-",
					);
					previousDirection = instruction.direction;
					grid[origin.y][
						origin.x +
							index * (instruction.direction == "R" ? 1 : -1)
					] = dig;
				}
				origin.x +=
					instruction.distance *
					(instruction.direction == "R" ? 1 : -1);
				break;
			case "D":
			case "U":
				for (let index = 0; index < instruction.distance; index++) {
					const dig = new Dig(
						instruction.color,
						previousDirection == "L" && instruction.direction == "D"
							? "F"
							: previousDirection == "L" &&
							  instruction.direction == "U"
							? "L"
							: previousDirection == "R" &&
							  instruction.direction == "D"
							? "7"
							: previousDirection == "R" &&
							  instruction.direction == "U"
							? "J"
							: "|",
					);
					previousDirection = instruction.direction;
					grid[
						origin.y +
							index * (instruction.direction == "D" ? 1 : -1)
					][origin.x] = dig;
				}
				origin.y +=
					instruction.distance *
					(instruction.direction == "D" ? 1 : -1);
				break;
		}

		/*
		console.log("");
		map.forEach(line => {
			console.log(line.map(dig => dig?.shape ?? ".").join(""));
		});	
		console.log("");
		*/
	});

	// Fill grid
	findItemsInsideLoop(
		grid as Array<Array<{ shape: string }>>,
		(row, col, items) => {
			for (let index = 0; index < items; index++) {
				grid[row][col + index] = new Dig("X", "X");
			}
		},
	);

	return grid.reduce(
		(sum, line) => sum + line.filter(dig => dig != undefined).length,
		0,
	);
}

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput, isPart2);

	// return calculateAreaWithRayTracing(input);

	const shoelace = new Shoelace();
	input.forEach(instruction =>
		shoelace.addPoint(instruction.direction, instruction.distance),
	);
	return shoelace.calculateArea();
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				R 6 (#70c710)
				D 5 (#0dc571)
				L 2 (#5713f0)
				D 2 (#d2c081)
				R 2 (#59c680)
				D 2 (#411b91)
				L 5 (#8ceee2)
				U 2 (#caa173)
				L 1 (#1b58a2)
				U 2 (#caa171)
				R 2 (#7807d2)
				U 3 (#a77fa3)
				L 2 (#015232)
				U 2 (#7a21e3)
				`,
				expected: 62,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				R 6 (#70c710)
				D 5 (#0dc571)
				L 2 (#5713f0)
				D 2 (#d2c081)
				R 2 (#59c680)
				D 2 (#411b91)
				L 5 (#8ceee2)
				U 2 (#caa173)
				L 1 (#1b58a2)
				U 2 (#caa171)
				R 2 (#7807d2)
				U 3 (#a77fa3)
				L 2 (#015232)
				U 2 (#7a21e3)
				`,
				expected: 952408144115,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
