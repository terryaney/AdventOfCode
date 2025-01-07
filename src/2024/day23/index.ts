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

	// Code solution here...

	return total;
};

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines;
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				kh-tc
				qp-kh
				de-cg
				ka-co
				yn-aq
				qp-ub
				cg-tb
				vc-aq
				tb-ka
				wh-tc
				yn-cg
				kh-ub
				ta-co
				de-co
				tc-td
				tb-wq
				wh-td
				ta-ka
				td-qp
				aq-cg
				wq-ub
				ub-vc
				de-ta
				wq-aq
				wq-vc
				wh-yn
				ka-de
				kh-ta
				co-tc
				wh-qp
				tb-vc
				td-yn
				`,
				expected: 7
			},
		],
		solution: part1,
	},
	part2: {
		testsPending: [
			{
				input: `
				{testDataPending}
				`,
				expected: "{expectedPending}"
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: true
});
