import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines.map(l => {
		const [result, rest] = l.split(": ");
		const ranges = rest.split(" ").map(n => parseInt(n));
		return { result: parseInt(result), values: ranges, valid: false };
	});
};

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const equations = parseInput(rawInput);
	for (const equation of equations) {
		equation.valid = isCorrect(equation.result, equation.values, !isPart1);
	}
	return equations.filter(e => e.valid).reduce((acc, e) => acc + e.result, 0);
}

const isCorrect = (result: number, values: number[], allowConcat: boolean): boolean => {
	if (values.length === 1) return result == values[0];
	
	const last = values[values.length - 1];
	
	if (result % last == 0 && isCorrect(result / last, values.slice(0, values.length - 1), allowConcat)) return true;
	if (result > last && isCorrect(result - last, values.slice(0, values.length - 1), allowConcat)) return true;

	const resultString = result.toString();
	const lastString = last.toString();
	if (allowConcat && resultString.length > lastString.length && resultString.endsWith(lastString) && isCorrect(parseInt(resultString.substring(0, resultString.length - lastString.length)), values.slice(0, values.length - 1), allowConcat)) return true;

	return false;
}

const solveMine = (rawInput: string, isPart1: boolean, testName?: string) => {
	const equations = parseInput(rawInput);

	if (false && testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(equations);
		console.log("------");
	}

	for (const equation of equations) {
		const permutations = generatePermutations(equation.values.length - 1, isPart1 ? ["*", "+"] : ["*", "+", "|"]);

		for (const permutation of permutations) {
			let result = equation.values[0];
			for (let i = 0; i < permutation.length; i++) {
				if (permutation[i] == "|") {
					result = parseInt(result.toString() + equation.values[i + 1].toString());
				} else if (permutation[i] == "*") {
					result *= equation.values[i + 1];
				}
				else {
					result += equation.values[i + 1];
				}
			}

			if (result === equation.result) {
				equation.valid = true;
				break;
			}
		}
	}
	return equations.filter(e => e.valid).reduce((acc, e) => acc + e.result, 0);
};

function generatePermutations(choices: number, symbols: string[]): string[][] {
    const results: string[][] = [];

    function backtrack(current: string[], depth: number) {
        if (depth === choices) {
            results.push([...current]);
            return;
        }

        for (const symbol of symbols) {
            current.push(symbol);
            backtrack(current, depth + 1);
            current.pop();
        }
    }

    backtrack([], 0);
    return results;
}

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				190: 10 19
				3267: 81 40 27
				83: 17 5
				156: 15 6
				7290: 6 8 6 15
				161011: 16 10 13
				192: 17 8 14
				21037: 9 7 18 13
				292: 11 6 16 20
				`,
				expected: 3749
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				190: 10 19
				3267: 81 40 27
				83: 17 5
				156: 15 6
				7290: 6 8 6 15
				161011: 16 10 13
				192: 17 8 14
				21037: 9 7 18 13
				292: 11 6 16 20
				`,
				expected: 11387
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
