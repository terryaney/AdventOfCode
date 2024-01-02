import run from "aocrunner";
import * as util from '../../utils/index.js';

function getArrangements(cache: { [key: string]: number }, conditionInfo: string, conditionPosition: number, sizes: Array<number>, sizePosition: number, damagedSprings: number ) : number {
	const cacheKey = `${conditionPosition}-${sizePosition}-${damagedSprings}`;

	if (cache[cacheKey] != undefined) {
		return cache[cacheKey];
	}
	
	// Done processing conditionInfo...
	if ( conditionPosition == conditionInfo.length ) {
		if ( sizePosition == sizes.length && damagedSprings == 0 )
		{
			// Done with all blocks and don't have a current running total...
			return 1;
		}
		else if ( sizePosition == sizes.length - 1 && sizes[ sizePosition ] == damagedSprings )
		{
			// On last size group and our run of damanagedSprings is correct size...
			return 1;
		}
		
		return 0;
	}
	else
	{
		var arrangements = 0;

		['.', '#'].forEach(condition => {
			// Try to put each possible item in there and test...if condition is already filled in, have to
			// put the right one in, otherwise, 'try' both if condition at conditionPosition is ?
			if (conditionInfo[conditionPosition] == condition || conditionInfo[conditionPosition] == '?') {
				if (condition == '.' && damagedSprings == 0) {
					arrangements += getArrangements(
						cache,
						conditionInfo,
						conditionPosition + 1,
						sizes,
						sizePosition,
						0
					);
				}
				else if (condition == '.' && damagedSprings > 0 && sizePosition < sizes.length && sizes[sizePosition] == damagedSprings) {
					arrangements += getArrangements(
						cache,
						conditionInfo,
						conditionPosition + 1,
						sizes,
						sizePosition + 1,
						0
					);
				}
				else if (condition == '#') {
					arrangements += getArrangements(
						cache,
						conditionInfo,
						conditionPosition + 1,
						sizes,
						sizePosition,
						damagedSprings + 1
					);
				}
			}
		});
		
		return cache[cacheKey] = arrangements;
	}
}

const parseInput = (rawInput: string, isPart2: boolean) => {
	const lines = util.parseLines(rawInput);

	const folds = 5;
	return lines.map(line => {
		const [springs, sizes] = line.split(" ");
		const foldsEnumerable = Array.from({ length: folds }, (_, index) => index)
	
		return !isPart2
			? getArrangements({}, springs, 0, sizes.split(",").map(Number), 0, 0)
			: getArrangements({}, foldsEnumerable.map(f => springs).join("?"), 0, foldsEnumerable.map(f => sizes).join(",").split(",").map(Number), 0, 0);
	});
};

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput, isPart2);

	return input.reduce((sum, current) => sum + current, 0);
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				???.### 1,1,3
				.??..??...?##. 1,1,3
				?#?#?#?#?#?#?#? 1,3,1,6
				????.#...#... 4,1,1
				????.######..#####. 1,6,5
				?###???????? 3,2,1
				`,
				expected: 21
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				???.### 1,1,3
				.??..??...?##. 1,1,3
				?#?#?#?#?#?#?#? 1,3,1,6
				????.#...#... 4,1,1
				????.######..#####. 1,6,5
				?###???????? 3,2,1
				`,
				expected: 525152
			}
		],
		solution: part2,
	},
	trimTestInputs: true
});