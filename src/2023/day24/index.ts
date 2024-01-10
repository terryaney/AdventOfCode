import run from "aoc-automation";
import * as util from "../../utils/index.js";
import { subtract, multiply, divide, abs, bignumber, BigNumber } from "mathjs";

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

	const particles = hailstones.map(
		hailstone =>
			new Particle3(
				new Vec3(
					bignumber(hailstone.px),
					bignumber(hailstone.py),
					bignumber(hailstone.pz),
				),
				new Vec3(
					bignumber(hailstone.vx),
					bignumber(hailstone.vy),
					bignumber(hailstone.vz),
				),
			),
	);

	return { hailstones, particles };
};

const getFutureIntersection = (
	x1: number,
	y1: number,
	vx1: number,
	vy1: number,
	x2: number,
	y2: number,
	vx2: number,
	vy2: number,
) => {
	const d = vx2 * vy1 - vx1 * vy2;

	if (d == 0) return undefined;

	const t = (vx1 * (y2 - y1) + vy1 * (x1 - x2)) / d;
	const intersection = { x: x2 + vx2 * t, y: y2 + vy2 * t };

	if (
		![
			{ x: x1, y: y1, vx: vx1, vy: vy1 },
			{ x: x2, y: y2, vx: vx2, vy: vy2 },
		].every(
			n =>
				(intersection.x - n.x) * n.vx >= 0 &&
				(intersection.y - n.y) * n.vy >= 0,
		)
	) {
		return undefined;
	}

	return intersection;
};

// Code implemented from https://aoc.csokavar.hu/?day=24 and https://github.com/encse/adventofcode/blob/master/2023/Day24/Solution.cs
class Vec2 {
	constructor(public x0: BigNumber, public x1: BigNumber) {}
}
class Vec3 {
	constructor(
		public x0: BigNumber,
		public x1: BigNumber,
		public x2: BigNumber,
	) {}
}
class Particle2 {
	constructor(public pos: Vec2, public vel: Vec2) {}
}
class Particle3 {
	constructor(public pos: Vec3, public vel: Vec3) {}
}
function project(
	ps: Particle3[],
	proj: (vec: Vec3) => [BigNumber, BigNumber],
): Particle2[] {
	return ps.map(
		p =>
			new Particle2(
				new Vec2(proj(p.pos)[0], proj(p.pos)[1]),
				new Vec2(proj(p.vel)[0], proj(p.vel)[1]),
			),
	);
}
// returns if p hits (goes very close to) pos
function Hits(p: Particle2, pos: Vec2): boolean {
	// var d = (pos.x0 - p.pos.x0) * p.vel.x1 - (pos.x1 - p.pos.x1) * p.vel.x0;
	var d = subtract(
		multiply(pos.x0.minus(p.pos.x0), p.vel.x1),
		multiply(pos.x1.minus(p.pos.x1), p.vel.x0),
	);
	return abs(d) < bignumber(0.0001);
}
// returns the pos hit by both p1 and p2
function Intersection(p1: Particle2, p2: Particle2): Vec2 | undefined {
	// this would look way better if I had a matrix library at my disposal.
	var determinant = p1.vel.x0
		.times(p2.vel.x1)
		.minus(p1.vel.x1.times(p2.vel.x0));
	if (determinant == bignumber(0)) {
		return undefined; //particles don't meet
	}

	const ba = p1.vel.x0.times(p1.pos.x1);
	const bb = p1.vel.x1.times(p1.pos.x0);
	var b0 = ba.minus(bb);
	var b1 = p2.vel.x0.times(p2.pos.x1).minus(p2.vel.x1.times(p2.pos.x0));

	return new Vec2(
		divide(
			p2.vel.x0.times(b0).minus(p1.vel.x0.times(b1)),
			determinant,
		) as BigNumber,
		divide(
			p2.vel.x1.times(b0).minus(p1.vel.x1.times(b1)),
			determinant,
		) as BigNumber,
	);
}
function solve2D(particles: Particle2[]): Vec2 {
	// We try to guess the speed of our stone (a for loop), then supposing
	// that it is the right velocity we create a new reference frame that
	// moves with that speed. The stone doesn't move in this frame, it has
	// some fixed unknown coordinates. Now transform each particle into
	// this reference frame as well. Since the stone is not moving, if we
	// properly guessed the speed, we find that each particle meets at the
	// same point. This must be the stone's location.
	const translateV = (p: Particle2, vel: Vec2) =>
		new Particle2(
			p.pos,
			new Vec2(p.vel.x0.minus(vel.x0), p.vel.x1.minus(vel.x1)),
		);

	const s = 500;
	for (let v1 = -s; v1 < s; v1++) {
		for (let v2 = -s; v2 < s; v2++) {
			const vel = new Vec2(bignumber(v1), bignumber(v2));

			const stone = Intersection(
				translateV(particles[0], vel),
				translateV(particles[1], vel),
			);

			if (
				stone != undefined &&
				particles.every(p => Hits(translateV(p, vel), stone))
			) {
				return stone;
			}
		}
	}
	throw new Error();
}

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const input = parseInput(rawInput);
	const hailstones = input.hailstones;
	const testAreaMin = testName != undefined ? 7 : 200000000000000;
	const testAreaMax = testName != undefined ? 27 : 400000000000000;

	if (isPart1) {
		let inTestArea = 0;

		for (let i = 0; i < hailstones.length; i++) {
			const p1 = hailstones[i];
			for (let j = i + 1; j < hailstones.length; j++) {
				const p2 = hailstones[j];
				const intersection = getFutureIntersection(
					p1.px,
					p1.py,
					p1.vx,
					p1.vy,
					p2.px,
					p2.py,
					p2.vx,
					p2.vy,
				);
				// console.log(p1, p2, intersection);
				if (
					intersection != undefined &&
					intersection.x >= testAreaMin &&
					intersection.x <= testAreaMax &&
					intersection.y >= testAreaMin &&
					intersection.y <= testAreaMax
				) {
					inTestArea++;
				}
			}
		}
		return inTestArea;
	} else {
		const particles = input.particles;
		const stoneXY = solve2D(project(particles, vec => [vec.x0, vec.x1]));
		const stoneXZ = solve2D(project(particles, vec => [vec.x0, vec.x2]));
		// return Math.round(stoneXY.x0.plus(stoneXY.x1).plus(stoneXZ.x1));
		return BigInt(stoneXY.x0.plus(stoneXY.x1).plus(stoneXZ.x1).valueOf());
	}
};

const part1 = (rawInput: string, testName?: string) =>
	solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) =>
	solve(rawInput, false, testName);

run({
	onlyTests: false,
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
				expected: 2,
			},
		],
		solution: part1,
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
				expected: 47n,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
