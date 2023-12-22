import run from "aocrunner";
import * as util from '../utils/index.js';

class Lense {
	public label: string;
	public focalLength: number;

	constructor(label: string, focalLength: number) {
		this.label = label;
		this.focalLength = focalLength;
	}
}

const parseInput = (rawInput: string, isPart2: boolean) => {
	const codes = util.parseLines(rawInput)[0].split(",");

	const asciiDictionary: { [key: string]: number } = {};

	for (let i = 0; i < 256; i++) {
		const char = String.fromCharCode(i);
		asciiDictionary[char] = i;
	}
	
	const boxes: Array<Array<Lense>> = isPart2
		? new Array(256).fill(null).map(() => [])
		: [];

	if (isPart2) {
		codes.forEach(code => {
			const isAddition = code.indexOf("=") > -1;
			const codeParts = isAddition ? code.split("=") : code.split("-");
			const label = codeParts[0];
			const focalLength = isAddition ? Number(codeParts[1]) : -1;
			const boxIndex = hashString(label, asciiDictionary);
			const box = boxes[boxIndex];
		
			const lenseIndex = box.findIndex(lense => lense.label == label);
	
			if (!isAddition && lenseIndex > -1) {
				// remove lense at index, and move all remaining forward
				box.splice(lenseIndex, 1);
			}
			else if (isAddition && lenseIndex > -1) {
				box[lenseIndex].focalLength = focalLength;
			}
			else if (isAddition && lenseIndex == -1) {
				box.push(new Lense(label, focalLength));
			}
		});
	}
	
	return { codes, asciiDictionary, boxes };
};

function hashString(str: string, asciiDictionary: { [key: string]: number }) {
	let currentValue = 0;
	for (let index = 0; index < str.length; index++) {
		const letter = str[index];
		const ascii = asciiDictionary[letter];
		currentValue += ascii;
		currentValue *= 17;
		currentValue %= 256;
	}
	return currentValue;
}

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput, isPart2);

	if (!isPart2) {
		return input.codes.reduce((totalValue, code) => totalValue + hashString(code, input.asciiDictionary), 0);
	}
	else {
		return input.boxes.reduce((totalValue, box, b) => {
			return totalValue + box.reduce((boxValue, lense, l) => {
				return boxValue + (b + 1) * (l + 1) * lense.focalLength;
			}, 0);
		}, 0);
	}
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
				expected: 1320
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
				expected: 145
			}
		],
		solution: part2
	},
	trimTestInputs: true
});