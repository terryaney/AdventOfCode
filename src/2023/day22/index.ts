import run from "aocrunner";
import * as util from '../../utils/index.js';
import { re } from "mathjs";

class Brick {
	public x: number;
	public y: number;
	public z: number;

	public supporting: Array<Brick> = [];
	public supportedBy: Array<Brick> = [];

	width: number;
	length: number;
	height: number;

	constructor(x: number, y: number, z: number, width: number, length: number, height: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.width = width;
		this.length = length;
		this.height = height;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);

	const bricks = lines.map(line => {
		const points = line.split('~');
		const start = points[0].split(',').map(Number);
		const end = points[1].split(',').map(Number);
		return new Brick(start[0], start[1], start[2], end[0] - start[0] + 1, end[1] - start[1] + 1, end[2] - start[2] + 1);
	}).sort((a, b) => a.z - b.z);

	const overlaps = (a: Brick, b: Brick) => {
		return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.length && a.y + a.length > b.y;
	};

	bricks.forEach((brick, index) => {
		let maxZ = 1;
		for (let i = 0; i < index; i++) {
			const check = bricks[i];
			if (overlaps(brick, check)) {
				maxZ = Math.max(maxZ, check.z + check.height);
			}
		}
		brick.z = maxZ;
	});

	bricks.sort((a, b) => a.z - b.z);

	bricks.forEach((brick, index) => {
		const top = brick.z + brick.height;

		for (let i = 0; i < bricks.length; i++) {
			const check = bricks[i];
			if (check.z == top && overlaps(brick, check)) {
				brick.supporting.push(check);
				check.supportedBy.push(brick);
			}
			if ( check.z > top) {
				break;
			}
		}
	});
	return bricks;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const bricks = parseInput(rawInput);
	// console.log(bricks);

	if (isPart1) {
		// 1,0,1~1,2,1
		// 2 xyz coordinates for each edge
		// ex: 2,2,2~2,2,2 - single cube
		// ex: 0,0,10~1,0,10 - 2 cube rectangle
		// ex: 0,0,1~0,0,10 - 10 cube vertical line
		// z=0, min brick z=1

		// Bricks are safe to disintegrate if, after removing it, no other bricks would fall further directly downward.
		return bricks.reduce((acc, brick) => {
			if ( brick.supporting.length == 0 ) {
				return acc + 1;
			}

			return brick.supporting.every(support => support.supportedBy.length > 1)
				? acc + 1
				: acc;
		}, 0);
	}
	else {
		return bricks.reduce((acc, brick) => {
			const queue = brick.supporting.filter(support => support.supportedBy.length == 1);
			const falling = new Set(queue);
			falling.add(brick);

			while (queue.length > 0) {
				const check = queue.shift()!;

				check.supporting.forEach(support => {
					if (!falling.has(support) && support.supportedBy.every(s => falling.has(s))) {
						falling.add(support);
						queue.push(support);
					}
				});
			}

			return acc + falling.size - 1;
		}, 0);
	}
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				1,0,1~1,2,1
				0,0,2~2,0,2
				0,2,3~2,2,3
				0,0,4~0,2,4
				2,0,5~2,2,5
				0,1,6~2,1,6
				1,1,8~1,1,9
				`,
				expected: 5
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `
				1,0,1~1,2,1
				0,0,2~2,0,2
				0,2,3~2,2,3
				0,0,4~0,2,4
				2,0,5~2,2,5
				0,1,6~2,1,6
				1,1,8~1,1,9
				`,
				expected: 7
			}
		],
		solution: part2
	},
	trimTestInputs: true
});