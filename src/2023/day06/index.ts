import run from "aoc-automation";
import * as util from '../../utils/index.js';

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return {
		times: lines[0].split(":")[1].split(" ").filter(item => item != "").map(Number),
		distances: lines[1].split(":")[1].split(" ").filter(item => item != "").map(Number)
	}
};

function waysToWinRace(time: number, distance: number): number {
	let minTimeToCharge = 0;
	let maxTimeToCharge = 0;

	for (let chargeMs = 1; chargeMs < time; chargeMs++) {
		if ( (chargeMs * (time - chargeMs)) > distance ) {
			minTimeToCharge = chargeMs;
			break;
		}		
	}

	for (let chargeMs = time - 1; chargeMs > 0; chargeMs--) {
		if ( (chargeMs * (time - chargeMs)) > distance ) {
			maxTimeToCharge = chargeMs;
			break;
		}		
	}

	return maxTimeToCharge - minTimeToCharge + 1;
}

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	if ( !isPart2 ) {
		return input.times.reduce((acc, time, index) => {
			return acc * waysToWinRace(time, input.distances[index]);
		}, 1);
	}
	else {
		return waysToWinRace(Number(input.times.join("")), Number(input.distances.join("")));
	}
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
					Time:      7  15   30
					Distance:  9  40  200
				`,
				expected: 288,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					Time:      7  15   30
					Distance:  9  40  200
				`,
				expected: 71503,
			}
		],
		solution: part2,
	},
	trimTestInputs: true
});