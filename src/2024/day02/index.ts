import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLinesIntoArrays(rawInput, " ", true) as Array<Array<number>>;
	// console.log(lines);
	return lines;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const allReports = parseInput(rawInput);
	
	const isReportUnsafe = (report: Array<number>) => {
		const isAsc = report[0] < report[1];
		return report.some((value, index) => {
			if (index == 0) return false;
			if (isAsc ? value <= report[index - 1] : value >= report[index - 1]) return true;
			return Math.abs(value - report[index - 1]) > 3;
		});
	};
	
	let unsafeReports = allReports.filter(isReportUnsafe);
	const safeReports = allReports.length - unsafeReports.length;

	if (isPart1) {
		return safeReports;
	} else {
		return safeReports + unsafeReports.filter(report => {
			const levels = report.length;
			for (let i = 0; i < levels; i++) {
				const temp = [...report];
				temp.splice(i, 1);
				if (!isReportUnsafe(temp)) {
					return true;
				}
			}
			return false;
		}).length;
	}
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	part1: {
		tests: [
			{
				input: `
				7 6 4 2 1
				1 2 7 8 9
				9 7 6 2 1
				1 3 2 4 5
				8 6 4 4 1
				1 3 6 7 9
				`,
				expected: 2
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				7 6 4 2 1
				1 2 7 8 9
				9 7 6 2 1
				1 3 2 4 5
				8 6 4 4 1
				1 3 6 7 9
				`,
				expected: 4
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
