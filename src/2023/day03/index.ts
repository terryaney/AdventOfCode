import run from "aocrunner";
import * as util from '../../utils/index.js';

function isNumber(value: string): boolean { return !isNaN(Number(value)); }

const part1 = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const countOfLines = lines.length;

	let totalPart1 = 0;

	for (let row = 0; row < lines.length; row++) {
		const line = lines[row];
		
		for (let col = 0; col < line.length; col++) {
			const character = line[col];
			
			if (isNumber(character)) {
				const startPosition = Math.max(0, col - 1);
	
				let numString = character;
	
				// Move col pointer to next possible number
				while(col < line.length - 1 && isNumber(line[col + 1])) {
					col++;
					numString = numString + line[col];
				}
	
				const endPosition = Math.min(line.length - 1, col + 1);
	
				// Is Number Valid?
				const rowsToCheck = [row - 1, row, row + 1].filter(r => r >= 0 && r < countOfLines);
	
				let numberIsValid = false;
	
				for (let rowToCheck = 0; rowToCheck < rowsToCheck.length; rowToCheck++) {
					const lineToCheck = lines[rowsToCheck[rowToCheck]];
					
					for (let colToCheck = startPosition; colToCheck <= endPosition; colToCheck++) {
						const characterToCheck = lineToCheck[colToCheck];
	
						if ( !isNumber(characterToCheck) && characterToCheck != "." ) {
							numberIsValid = true;
							break;
						}
					}
	
					if (numberIsValid) {
						break;
					}
				}
	
				if ( numberIsValid ) {
					totalPart1 = totalPart1 + Number(numString);
				}
			}
		}
	}
	return totalPart1;
};
const part2 = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const countOfLines = lines.length;

	let totalPart2 = 0;

	const gears: Array<number> = [];

	for (let row = 0; row < lines.length; row++) {
		const line = lines[row];
		
		for (let col = 0; col < line.length; col++) {
			const character = line[col];
			
			if (character == "*") {
				const startColumn = Math.max(0, col - 1);
				const endColumn = Math.min(line.length - 1, col + 1);
	
				// Is Number Valid?
				const rowsToCheck = [row - 1, row, row + 1].filter(r => r >= 0 && r < countOfLines);
	
				const numbersFound: Array<Array<number>> = [];
	
				for (let rowToCheck = 0; rowToCheck < rowsToCheck.length; rowToCheck++) {
					const lineToCheck = lines[rowsToCheck[rowToCheck]];
					
					for (let colToCheck = startColumn; colToCheck <= endColumn; colToCheck++) {
						const characterToCheck = lineToCheck[colToCheck];
	
						// Explain to Luke about breaking out...
						// 1) Started to break always, so didn't find second numbers on same line (can't remember where I saw this present itself, but changed when you were here)
						// 2) Then I broke when current row != rowToCheck, then didn't find second ##*##
						// 3) FInally changed to move pointer because a * above first of two digits would find both and add multiple, so added same 'number' as two coordinates
						if (isNumber(characterToCheck)) {
							numbersFound.push([rowsToCheck[rowToCheck], colToCheck]);
							while(colToCheck < endColumn && isNumber(lineToCheck[colToCheck])) {
								colToCheck++;
							}			
						}
					}
				}
	
				if (numbersFound.length == 2) {
	
					const getGear = (coordiantes: Array<number>): number => {
						let gearLine = lines[coordiantes[0]];
						let gearColumn = coordiantes[1];
		
						while (gearColumn > 0 && isNumber(gearLine[gearColumn - 1])) {
							gearColumn--;
						}
		
						let numString = gearLine[gearColumn];
		
						while (gearColumn < gearLine.length - 1 && isNumber(gearLine[gearColumn + 1])) {
							gearColumn++;
							numString = numString + gearLine[gearColumn];
						}
						return Number(numString);
					};
	
					const gear1 = getGear(numbersFound[0]);
					const gear2 = getGear(numbersFound[1]);
					gears.push(gear1 * gear2);
					totalPart2 += gear1 * gear2;
				}
			}
		}
	}
	return totalPart2;
}

run({
	part1: {
		tests: [
			{
				input: `
					467..114..
					...*......
					..35..633.
					......#...
					617*......
					.....+.58.
					..592.....
					......755.
					...$.*....
					.664.598..
				`,
				expected: 4361,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					467..114..
					...*......
					..35..633.
					......#...
					617*......
					.....+.58.
					..592.....
					......755.
					...$.*....
					.664.598..
				`,
				expected: 467835,
			}
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: false,
});