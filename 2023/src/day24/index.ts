import run from "aocrunner";
import * as util from '../utils/index.js';

interface IHailStone {
	px: number;
	py: number;
	pz: number;
	vx: number;
	vy: number;
	vz: number;
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);

	const hailstones = lines.map(line => {
		const [left, right] = line.split(" @ ");
		const [px, py, pz] = left.split(", ").map(n => parseInt(n));
		const [vx, vy, vz] = right.split(", ").map(n => parseInt(n));
		
		return { px, py, pz, vx, vy, vz } as IHailStone;
	});

	const stones = hailstones.map(hailstone => new Stone({ x: hailstone.px, y: hailstone.py, z: hailstone.pz }, { x: hailstone.vx, y: hailstone.vy, z: hailstone.vz }));

	return { hailstones, stones };
};

const getFutureIntersection = (x1: number, y1: number, vx1: number, vy1: number, x2: number, y2: number, vx2: number, vy2: number) => {
	const d = (vx2 * vy1 - vx1 * vy2);

	if (d == 0) return undefined;
	
	const t = (vx1 * (y2 - y1) + vy1 * (x1 - x2)) / d;
	const intersection = { x: x2 + vx2 * t, y: y2 + vy2 * t };

	if (![{ x: x1, y: y1, vx: vx1, vy: vy1 }, { x: x2, y: y2, vx: vx2, vy: vy2 }]
		.every(n => (intersection.x - n.x) * n.vx >= 0 && (intersection.y - n.y) * n.vy >= 0 )) {
		return undefined;
	}

	return intersection;
};



interface LongCoordinate { x: number; y: number; }
interface Coordinate3D { x: number; y: number; z: number; }
/**
 * Stone projected unto some axis (basically eliminating the projected axis, being x, y or z).
 */
class ProjectedStone {
	a: bigint; b: bigint; c: bigint;

	constructor(public position: LongCoordinate, public velocity: LongCoordinate) {
		this.a = BigInt(velocity.y);
		this.b = BigInt(-velocity.x);
		this.c = BigInt(velocity.y * position.x - velocity.x * position.y);
	}
	
	addingVelocity(delta: LongCoordinate): ProjectedStone {
		return new ProjectedStone(this.position, { x: this.velocity.x + delta.x, y: this.velocity.y + delta.y });
	}
}
class Stone {
	constructor(public position: Coordinate3D, public velocity: Coordinate3D) { }

	projected(component: number): ProjectedStone {
		switch (component) {
			case 0: return new ProjectedStone({ x: this.position.y, y: this.position.z }, { x: this.velocity.y, y: this.velocity.z });
			case 1: return new ProjectedStone({ x: this.position.x, y: this.position.z }, { x: this.velocity.x, y: this.velocity.z });
			case 2: return new ProjectedStone({ x: this.position.x, y: this.position.y }, { x: this.velocity.x, y: this.velocity.y });
			default: throw new Error(`Invalid component: ${component}`);
		}
	}
}

// Solve two linear equations for x and y
// Equations of the form: ax + by = c
function solveLinearEquation(a1: bigint, b1: bigint, c1: bigint, a2: bigint, b2: bigint, c2: bigint): LongCoordinate | undefined {
	const d = b2 * a1 - b1 * a2;
	if (d == BigInt(0) ) return undefined;
	const x = (b2 * c1 - b1 * c2) / d;
	const y = (c2 * a1 - c1 * a2) / d;
	return { x: Number(x), y: Number(y) };
}
/**
 * Processes all pairs of stones by projecting them unto the specified component (0 == x, 1 == y, 2 == z).
 *
 * Optionally a delta velocity is applied to each stone.
 *
 * If the processing block returns false this function immediately exits
 */
function processPairs(stones: Stone[], projectedComponent: number, deltaSpeed: LongCoordinate = { x: 0, y: 0 }, process: (arg: LongCoordinate | null) => boolean) {
	for (let i = 0; i < stones.length; i++) {
		for (let j = i + 1; j < stones.length; j++) {
			const firstStone = stones[i].projected(projectedComponent).addingVelocity(deltaSpeed);
			const secondStone = stones[j].projected(projectedComponent).addingVelocity(deltaSpeed);
			let intersection = solveLinearEquation(firstStone.a, firstStone.b, firstStone.c, secondStone.a, secondStone.b, secondStone.c);
			if (intersection != undefined && [firstStone, secondStone].every(it => Math.sign(intersection!.y - it.position.y) === Math.sign(it.velocity.y))) {
				if (!process(intersection)) return;
			}
		}
	}
}
/**
 * Searches for multiple intersection position using the specified projected component (x, y or z-axis).
 *
 * Brute forces over combinations of vx, vy to find a possible solution.
 *
 * The key insight is that a minus delta velocity can be applied to any stone and assume the rock to remain stationary (speed zero).
 * Because the rock has to collide with every stone, the stone paths should all have an intersection (which is the position of the rock).
 *
 * Returns a pair of position to velocity of the rock found for the projection, or null if no solution could be found.
 */
function findRockPositionAndVelocity(stones: Stone[], component: number): [LongCoordinate, LongCoordinate] | null {
	const maxValue = 400;
	const minResultCount = 5;
	for (let vx = -maxValue; vx <= maxValue; vx++) {
		for (let vy = -maxValue; vy <= maxValue; vy++) {
			const deltaV = { x: vx, y: vy };
			const matchingPositions: LongCoordinate[] = [];
			let resultCount = 0;
			processPairs(stones, component, deltaV, intersection => {
				if (intersection) {
					matchingPositions.push(intersection);
					resultCount++;
					return resultCount < minResultCount;
				} else {
					return false;
				}
			});
			if (matchingPositions.length === 1 && resultCount >= Math.min(minResultCount, stones.length / 2)) {
				return [matchingPositions[0], { x: -deltaV.x, y: -deltaV.y }];
			}
		}
	}
	return null;
}
  
const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const input = parseInput(rawInput);
	const hailstones = input.hailstones;
	const stones = input.stones;
	const testAreaMin = testName != undefined ? 7 : 200000000000000;
	const testAreaMax = testName != undefined ? 27 : 400000000000000;

	if (isPart1) {
		let inTestArea = 0;

		for (let i = 0; i < hailstones.length; i++) {
			const p1 = hailstones[i];
			for (let j = i + 1; j < hailstones.length; j++) {
				const p2 = hailstones[j];
				const intersection = getFutureIntersection(p1.px, p1.py, p1.vx, p1.vy, p2.px, p2.py, p2.vx, p2.vy);
				// console.log(p1, p2, intersection);
				if (intersection != undefined && intersection.x >= testAreaMin && intersection.x <= testAreaMax && intersection.y >= testAreaMin && intersection.y <= testAreaMax) {
					inTestArea++;
				}
			}
		}
		return inTestArea;
	}
	else {
		// Project to z-axis
		const result1 = findRockPositionAndVelocity(stones, 2);
		if (!result1) throw new Error("Could not find result");

		// Project to x-axis
		const result2 = findRockPositionAndVelocity(stones, 0);
		if (!result2) throw new Error("Could not find result");

		// Project to y-axis
		const result3 = findRockPositionAndVelocity(stones, 1);
		if (!result3) throw new Error("Could not find result");

		/*
		const [x1, y1] = result1[0];
		const [y2, z1] = result2[0];
		const [x2, z2] = result3[0];
		const [vx1, vy1] = result1[1];
		const [vy2, vz1] = result2[1];
		const [vx2, vz2] = result3[1];
		*/
		const x1 = result1[0].x;
		const y1 = result1[0].y;
		const y2 = result2[0].x;
		const z1 = result2[0].y;
		const x2 = result3[0].x;
		const z2 = result3[0].y;
		const vx1 = result1[1].x;
		const vy1 = result1[1].y;
		const vy2 = result2[1].x;
		const vz1 = result2[1].y;
		const vx2 = result3[1].x;
		const vz2 = result3[1].y;
		
		if (y1 !== y2 || x1 !== x2 || z1 !== z2) {
			throw new Error("Expected positions to match");
		}
		if (vy1 !== vy2 || vx1 !== vx2 || vz1 !== vz2) {
			throw new Error("Expected velocities to match");
		}

		console.log(`Found rock position and velocity: ${x1},${y1},${z1} @ ${vx1},${vy1},${vz1}`);

		console.log(x1 + y1 + z1);
	}
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	onlyTests: true,
	part1: {
		tests: [
			{
				input: `
				19, 13, 30 @ -2,  1, -2
				18, 19, 22 @ -1, -1, -2
				20, 25, 34 @ -2, -2, -4
				12, 31, 28 @ -1, -2, -1
				20, 19, 15 @  1, -5, -3
				`,
				expected: 2
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `
				19, 13, 30 @ -2,  1, -2
				18, 19, 22 @ -1, -1, -2
				20, 25, 34 @ -2, -2, -4
				12, 31, 28 @ -1, -2, -1
				20, 19, 15 @  1, -5, -3
				`,
				expected: 47
			}
		],
	solution: part2
	},
	trimTestInputs: true
});