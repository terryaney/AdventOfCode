import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const input = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(input);
		console.log("------");
	}

	let total = 0;

	// AAB
	// AA A B

	const designCache = new Map<string, number>();

	const findPattern = (design: string, maxLength: number, patterns: Set<string>) => {
		if (design.length === 0) return 1;
		if (designCache.has(design)) return designCache.get(design)!;

		let designs = 0;
		try {
			for (let i = 1; i <= Math.min(design.length, maxLength); i++) {
				const pattern = design.slice(0, i);
				if (patterns.has(pattern)) {
					designs += findPattern(design.slice(i), maxLength, patterns);
				}
			}
		} finally {
			designCache.set(design, designs);
		}
		
		return designs;
	}

	for (const design of input.designs) {
		const designs = findPattern(design, input.maxLength, input.patterns);
		if (designs > 0) {
			total += isPart1 ? 1 : designs;
		}
	}

	return total;
};

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const patterns = lines[0].split(", ");
	const maxLength = Math.max(...patterns.map(p => p.length));
	const patternsSet = new Set(patterns);
	const designs = lines.slice(2);
	return { patterns: patternsSet, maxLength, designs };
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				r, wr, b, g, bwu, rb, gb, br

				brwrr
				bggr
				gbbr
				rrbgbr
				ubwu
				bwurrg
				brgr
				bbrgwb
				`,
				expected: 6
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				r, wr, b, g, bwu, rb, gb, br

				brwrr
				bggr
				gbbr
				rrbgbr
				ubwu
				bwurrg
				brgr
				bbrgwb
				`,
				expected: 16
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
