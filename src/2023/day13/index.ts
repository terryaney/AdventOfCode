import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);

	const patterns: Array<Array<string>> = [];

	let currentPattern: Array<string> = [];

	for (const line of lines) {
		if (line === "") {
			patterns.push(currentPattern);
			currentPattern = [];
		} else {
			currentPattern.push(line);
		}
	}
	patterns.push(currentPattern);

	return patterns;
};

function isDifferentByOne(above: string, below: string): boolean {
	let diff = 0;
	for (let i = 0; i < above.length; i++) {
		if (above[i] != below[i]) {
			diff++;
			if (diff > 1) {
				return false;
			}
		}
	}

	return diff == 1;
}

function reflectedOn(
	pattern: Array<string>,
	isSmudge: boolean,
	previousReflection?: number,
): number | undefined {
	for (let i = 1; i < pattern.length; i++) {
		const above = i - 1;
		const below = i;
		if (
			below != previousReflection &&
			(pattern[below] == pattern[above] ||
				(isSmudge && isDifferentByOne(pattern[above], pattern[below])))
		) {
			let isReflection = true;

			for (let j = above - 1; j > -1; j--) {
				const diff = above - j;
				if (above - diff < 0 || below + diff >= pattern.length) {
					break;
				} else if (
					pattern[above - diff] != pattern[below + diff] &&
					(!isSmudge ||
						!isDifferentByOne(
							pattern[above - diff],
							pattern[below + diff],
						))
				) {
					isReflection = false;
					break;
				}
			}

			if (isReflection) {
				return below;
			}
		}
	}

	return undefined;
}

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	let summary = 0;
	let smudgeSummary = 0;

	input.forEach((pattern, patternIndex) => {
		let reflection = reflectedOn(pattern, false);
		let smudgeReflection = reflectedOn(pattern, true, reflection);

		if (reflection != undefined) {
			// console.log(`Pattern ${patternIndex} is a horizontal reflection between ${reflection - 1} and ${reflection}, increase by ${reflection * 100}`);
			summary += reflection * 100;
		}
		if (smudgeReflection != undefined) {
			// console.log(`Pattern ${patternIndex} is a horizontal smudge reflection between ${smudgeReflection - 1} and ${smudgeReflection}, increase by ${smudgeReflection * 100}`);
			smudgeSummary += smudgeReflection * 100;
		}

		if (reflection == undefined || smudgeReflection == undefined) {
			const invertedPattern = Array.from(
				{ length: pattern[0].length },
				(_, index) => index,
			).map(index => {
				/* 0-8 */
				return pattern.map(line => line[index]).join("");
			});

			if (reflection == undefined) {
				reflection = reflectedOn(invertedPattern, false);
				// console.log(`Pattern ${patternIndex} is a vertical reflection between ${reflection - 1} and ${reflection}, increase by ${reflection}`);
				summary += reflection!;
			} else {
				reflection = undefined;
			}

			if (smudgeReflection == undefined) {
				smudgeReflection = reflectedOn(
					invertedPattern,
					true,
					reflection,
				);
				// console.log(`Pattern ${patternIndex} is a smudge reflection between ${smudgeReflection - 1} and ${smudgeReflection}, increase by ${smudgeReflection}`);
				smudgeSummary += smudgeReflection!;
			}
		}
	});

	return !isPart2 ? summary : smudgeSummary;
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				#.##..##.
				..#.##.#.
				##......#
				##......#
				..#.##.#.
				..##..##.
				#.#.##.#.
				
				#...##..#
				#....#..#
				..##..###
				#####.##.
				#####.##.
				..##..###
				#....#..#
				`,
				expected: 405,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				#.##..##.
				..#.##.#.
				##......#
				##......#
				..#.##.#.
				..##..##.
				#.#.##.#.
				
				#...##..#
				#....#..#
				..##..###
				#####.##.
				#####.##.
				..##..###
				#....#..#
				`,
				expected: 400,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
