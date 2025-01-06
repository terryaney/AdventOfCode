import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);

	return {
		a: parseInt(lines[0].split(":")[1]),
		b: parseInt(lines[1].split(":")[1]),
		c: parseInt(lines[2].split(":")[1]),
		program: lines[4].split(":")[ 1 ].trim().split(",").map(Number)
	};
};

const part1 = (rawInput: string, testName?: string) => {
	const input = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(input);
		console.log("------");
	}

	var instruction = 0;
	var output: Array<number> = [];

	const getCombo = (operand: number) => {
		if (operand <= 3) return operand;
		if (operand == 4) return input.a;
		if (operand == 5) return input.b;
		return input.c;
	};
	const dvOp = (operand: number) => Math.floor(input.a / Math.pow(2, getCombo(operand)));

	while (instruction <= input.program.length - 1) {
		var opCode = input.program[instruction];
		var operand = input.program[instruction + 1];

		// console.log(`instruction: ${instruction}, opCode: ${opCode}, operand: ${operand}`);

		// 3 - jzn - A == 0, nothing, else, jump instruction pointer (do not increase by 2)
		if (opCode == 3) {
			instruction = input.a != 0 ? operand : instruction + 2;
			continue;
		}

		// program - opcode, operand, opcode, operand, ...
		// literal - 0-7 = 0-7
		// combo - 0-3 = 0-3, 4 = A, 5 = B, 6 = C
		
		// 0 - adv - division, numerator is A and denom is 2^combo, floor to int and put into A
		if (opCode == 0) input.a = dvOp(operand);
		// 1 - blx - B ^ literal, put in B
		else if (opCode == 1) input.b = input.b ^ operand;
		// 2 - bst - combo % 8 (lowest 3 bits?), put in B
		else if (opCode == 2) input.b = getCombo(operand) % 8;
		// 4 - bxc - B | C, put in B, ignore operand
		else if (opCode == 4) input.b = input.b ^ input.c;
		// 5 - out - combo % 8, output value (if multiple, comma delim)
		else if (opCode == 5) output.push(getCombo(operand) % 8);
		// 6 - bdv - same as '0', put result in B
		else if (opCode == 6) input.b = dvOp(operand);
		// 7 - cdv - same as '0', put result in C
		else if (opCode == 7) input.c = dvOp(operand);

		instruction += 2
	}
	return output.join(",");
};
	
const part2 = (rawInput: string, testName?: string) => {
	const program = parseInput(rawInput).program;
	if (program[program.length - 1] != 0 || program[program.length - 2] != 3) throw new Error("Program does not end in JNZ 0");

	const find = (target: Array<number>, answer: bigint): bigint | undefined => {
		if (target.length == 0) return answer;
		const targetValue = BigInt(target[target.length - 1]);

		for (let t = 0; t < 8; t++) {
			let a = answer << BigInt(3) | BigInt(t);
			let b = BigInt(0), c = BigInt(0);
			let output: BigInt | undefined = undefined;

			const getCombo = (operand: number) => {
				if (operand <= 3) return BigInt(operand);
				if (operand == 4) return a;
				if (operand == 5) return b;
				return c;
			};

			let hasOpCode0 = false;

			for (let pointer = 0; pointer < program.length - 2; pointer += 2) {
				const opCode = program[pointer];
				const operand = program[pointer + 1];

				if (opCode == 0) {
					if (hasOpCode0) throw new Error("Cannot have multiple ADV");
					if (operand !== 3) throw new Error("Cannot have ADV with operand != 3");
					hasOpCode0 = true;
				}
				else if (opCode == 1) b = b ^ BigInt(operand);
				// 2 - bst - combo % 8 (lowest 3 bits?), put in B
				else if (opCode == 2) b = getCombo(operand) % BigInt(8);
				else if (opCode == 3) throw new Error("Cannot have JNZ in the middle of the program");
				// 4 - bxc - B | C, put in B, ignore operand	
				else if (opCode == 4) b = b ^ c;
				// 5 - out - combo % 8, output value (if multiple, comma delim)
				else if (opCode == 5) {
					if (output !== undefined) throw new Error("Cannot have multiple OUT");
					output = getCombo(operand) % BigInt(8);
				}
				// 6 - bdv - same as '0', put result in B
				else if (opCode == 6) b = a >> getCombo(operand);
				// 7 - cdv - same as '0', put result in C
				else if (opCode == 7) c = a >> getCombo(operand);

				if (output == targetValue) {
					// found a *possible* answer
					const sub = find(target.slice(0, -1), a);
					
					if (sub == undefined) continue;
	
					return sub;
				}
			}
		}

		return undefined;
	}

	return find(program, BigInt(0))?.toString();
}

run({
	part1: {
		tests: [
			{
				input: `
				Register A: 729
				Register B: 0
				Register C: 0

				Program: 0,1,5,4,3,0
				`,
				expected: "4,6,3,5,6,3,5,2,1,0"
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			/*
			{
				input: `
				Register A: 2024
				Register B: 0
				Register C: 0

				Program: 0,3,5,4,3,0
				`,
				expected: 117440
			}
			*/
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
