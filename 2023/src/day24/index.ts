import run from "aocrunner";
import * as util from '../utils/index.js';
import { gcd } from "mathjs";

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

	return lines.map(line => {
		const [left, right] = line.split(" @ ");
		const [px, py, pz] = left.split(", ").map(n => parseInt(n));
		const [vx, vy, vz] = right.split(", ").map(n => parseInt(n));
		
		return { px, py, pz, vx, vy, vz } as IHailStone;
	});
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

class ChineseRemainderConstructor {
	private _bases: number[];
	private _prod: number;
	private _inverses: number[];
	private _muls: number[];
  
	constructor(bases: number[]) {
		this._bases = bases;
		this._prod = bases.reduce((p, x) => p * x, 1);
		this._inverses = this._bases.map(x => this._prod / x);
		this._muls = this._inverses.map((inv, i) => inv * this.mulInv(inv, this._bases[i]));
	}
  
	rem(mods: number[]): number {
		let ret = 0;
		for (let i = 0; i < this._muls.length; i++) {
			ret += this._muls[i] * mods[i];
		}
		return ret % this._prod;
	}
  
	mulInv(a: number, b: number): number {
		let initialB = b;
		let x0 = 0, x1 = 1;
		if (b === 1) {
			return 1;
		}
		while (a > 1) {
			const div = Math.floor(a / b);
			const mod = a % b;
			a = b;
			b = mod;
			[x0, x1] = [x1 - div * x0, x0];
		}
		return x1 >= 0 ? x1 : x1 + initialB;
	}
}
  
function chineseRemainder(n: number[], mods: number[]): number {
	return new ChineseRemainderConstructor(n).rem(mods);
}

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const hailstones = parseInput(rawInput);
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
		// https://www.youtube.com/watch?v=91qd9Uv2I9E
		// https://github.com/joshackland/advent_of_code/blob/master/2023/python/24.py
		function isPositiveInteger(x: number): boolean {
			return x > 0 && Math.floor(x) === x;
		}

		const s = hailstones.map(h => h.px + h.py + h.pz);
		const sv = hailstones.map(h => h.vx + h.vy + h.vz);
		let value = 0;

		for (let sv_r = -1000; sv_r < 1000; sv_r++) {
			if (sv.includes(sv_r)) {
				continue;
			}
			
			let m_and_s = s.map((s_i, i) => [(sv[i] - sv_r), s_i % (sv[i] - sv_r)]);
			
			for (let i = 0; i < m_and_s.length; i++) {
			  if (m_and_s[i][0] < 0) {
				m_and_s[i][0] = -m_and_s[i][0];
				m_and_s[i][1] = m_and_s[i][1] + m_and_s[i][0];
			  }
			}

			m_and_s.sort((a, b) => b[0] - a[0]);
			let m: number[] = [];
			let s_: number[] = [];
		
			while (m_and_s.length > 0) {
			  let [m_i, s_i] = m_and_s.shift()!;
			  m.push(m_i);
			  s_.push(s_i);
			  m_and_s = m_and_s.filter(([m_j, s_j]) => gcd(m_j, m_i) === 1);
			}
			let s_r = chineseRemainder(m, s_);
			if (s.every((s_i, i) => isPositiveInteger((s_r - s_i) / (sv[i] - sv_r)))) {
			  value = s_r;
			}
		}
		return value;
	}
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

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