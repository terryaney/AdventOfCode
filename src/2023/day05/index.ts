import run from "aoc-automation";
import * as util from "../../utils/index.js";

class Map {
	public fromStart: number;
	public fromEnd: number;
	public toStart: number;

	constructor(from: number, to: number, length: number) {
		this.fromStart = from;
		this.fromEnd = from + length - 1;
		this.toStart = to;
	}
}

class ParsedInput {
	public seeds: Array<number> = [];
	public seedToSoilMappings: Array<Map> = [];
	public soilToFertilizerMappings: Array<Map> = [];
	public fertilizerToWaterMappings: Array<Map> = [];
	public waterToLightMappings: Array<Map> = [];
	public lightToTemperatureMappings: Array<Map> = [];
	public temperatureHumidityMappings: Array<Map> = [];
	public humidityToLocationMappings: Array<Map> = [];
}

const parseInput = (rawInput: string): ParsedInput => {
	const parseMaps = (rawMaps: string): Array<Map> => {
		return rawMaps
			.split("\n")
			.slice(1)
			.map(l => l.split(" ").map(Number))
			.map(mapInfo => new Map(mapInfo[1], mapInfo[0], mapInfo[2]));
	};

	const info = rawInput.split("\n\n");

	return {
		seeds: info[0].substring(7).split(" ").map(Number),
		seedToSoilMappings: parseMaps(info[1]),
		soilToFertilizerMappings: parseMaps(info[2]),
		fertilizerToWaterMappings: parseMaps(info[3]),
		waterToLightMappings: parseMaps(info[4]),
		lightToTemperatureMappings: parseMaps(info[5]),
		temperatureHumidityMappings: parseMaps(info[6]),
		humidityToLocationMappings: parseMaps(info[7]),
	} as ParsedInput;
};

function findLocation(parsedInput: ParsedInput, seedNumber: number): number {
	const translateMapping = (mappings: Array<Map>, from: number): number => {
		// Mappings: - length = 2
		// 50 98 2 - mappings[0], index = 0
		// 52 50 48 - mappings[1], index = 1
		// index = 2
		// fromNumber (seed first round): 79
		for (let index = 0; index < mappings.length; index++) {
			const desintationMap = mappings[index];
			if (
				desintationMap.fromStart <= from &&
				from <= desintationMap.fromEnd
			) {
				// 52 + (79 - 50) -> 52 + 29 -> 81
				// Search for 51
				// 52 + 51 - 50 -> 52 + 1 -> 53
				// return desintationMap.toStart + (fromNumber - desintationMap.fromStart);
				return from + desintationMap.toStart - desintationMap.fromStart;
			}
		}

		return from;
	};

	const soilNumber = translateMapping(
		parsedInput.seedToSoilMappings,
		seedNumber,
	);
	const fertilizerNumber = translateMapping(
		parsedInput.soilToFertilizerMappings,
		soilNumber,
	);
	const waterNumber = translateMapping(
		parsedInput.fertilizerToWaterMappings,
		fertilizerNumber,
	);
	const lightNumber = translateMapping(
		parsedInput.waterToLightMappings,
		waterNumber,
	);
	const temperatureNumber = translateMapping(
		parsedInput.lightToTemperatureMappings,
		lightNumber,
	);
	const humidityNumber = translateMapping(
		parsedInput.temperatureHumidityMappings,
		temperatureNumber,
	);
	const locationNumber = translateMapping(
		parsedInput.humidityToLocationMappings,
		humidityNumber,
	);
	return locationNumber;
}

function findLowestLocation(
	parsedInput: ParsedInput,
	seeds: Array<{ from: number; to: number }>,
): number {
	const locations = seeds.flatMap(seedInfo =>
		new Array(seedInfo.to - seedInfo.from + 1)
			.fill(0)
			.map((_, index) =>
				findLocation(parsedInput, seedInfo.from + index),
			),
	);

	return Math.min(...locations);
}

const part1 = (rawInput: string) => {
	const parsedInput = parseInput(rawInput);
	return Math.min(
		...parsedInput.seeds.map(seedNumber =>
			findLocation(parsedInput, seedNumber),
		),
	);
};

const part2 = (rawInput: string) => {
	const parsedInput = parseInput(rawInput);

	let values: Array<{ from: number; to: number }> = [];

	for (let index = 0; index < parsedInput.seeds.length; index += 2) {
		const from = parsedInput.seeds[index];
		values.push({
			from: from,
			to: from + parsedInput.seeds[index + 1] - 1,
		});
	}

	const mappings = [
		parsedInput.seedToSoilMappings,
		parsedInput.soilToFertilizerMappings,
		parsedInput.fertilizerToWaterMappings,
		parsedInput.waterToLightMappings,
		parsedInput.lightToTemperatureMappings,
		parsedInput.temperatureHumidityMappings,
		parsedInput.humidityToLocationMappings,
	];

	mappings.forEach(ranges => {
		const newValues: Array<{ from: number; to: number }> = [];

		while (values.length > 0) {
			const seed = values.pop()!;
			let foundRange = false;

			ranges.forEach(range => {
				/*
				[111111111111]					[22222222222222]
						[SSSSSSSSSSSSSSSSSSSSSSSSSSS]

				1's and 2's are mappings, S's are seeds
				Mapping 1: overlapStart = left of seeds, overlapEnd = right of 1's - these seeds will be mapped to 1's
				Mapping 2: overlapStart = left of 2's, overlapEnd = right of seeds - these seeds will be mapped to 2's
				Seeds without overlap will simply return the same value as passed in.
				*/
				const overlapStart = Math.max(seed.from, range.fromStart);
				const overlapEnd = Math.min(seed.to, range.fromEnd);

				// If mappings and values overlap...
				if (overlapStart < overlapEnd) {
					// Add new translated values into the values array
					newValues.push({
						from: overlapStart + range.toStart - range.fromStart,
						to: overlapEnd + range.toStart - range.fromStart,
					});

					// If some values are less than current mapping start, add back to values to be processed by next mapping range
					if (seed.from < overlapStart) {
						values.push({
							from: seed.from,
							to: overlapStart - 1,
						});
					}

					// If some values are greater than current mapping end, add back to values to be processed by next mapping range
					if (overlapEnd < seed.to) {
						values.push({
							from: overlapEnd + 1,
							to: seed.to,
						});
					}
					foundRange = true;
					return;
				}
			});

			// No mappings, so just append the entire range as is back to newValues to be processed
			if (!foundRange) {
				newValues.push(seed);
			}
		}

		values = newValues;
	});

	const locations = values.map(v => v.from);
	let minLocation = Number.MAX_SAFE_INTEGER;
	locations.forEach(location => {
		if (location < minLocation) {
			minLocation = location;
		}
	});
	// const minLocation = Math.min(...values.map(v => v.from));
	return minLocation;
};

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
					seeds: 79 14 55 13

					seed-to-soil map:
					50 98 2
					52 50 48
					
					soil-to-fertilizer map:
					0 15 37
					37 52 2
					39 0 15
					
					fertilizer-to-water map:
					49 53 8
					0 11 42
					42 0 7
					57 7 4
					
					water-to-light map:
					88 18 7
					18 25 70
					
					light-to-temperature map:
					45 77 23
					81 45 19
					68 64 13
					
					temperature-to-humidity map:
					0 69 1
					1 0 69
					
					humidity-to-location map:
					60 56 37
					56 93 4
				`,
				expected: 35,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					seeds: 79 14 55 13

					seed-to-soil map:
					50 98 2
					52 50 48
					
					soil-to-fertilizer map:
					0 15 37
					37 52 2
					39 0 15
					
					fertilizer-to-water map:
					49 53 8
					0 11 42
					42 0 7
					57 7 4
					
					water-to-light map:
					88 18 7
					18 25 70
					
					light-to-temperature map:
					45 77 23
					81 45 19
					68 64 13
					
					temperature-to-humidity map:
					0 69 1
					1 0 69
					
					humidity-to-location map:
					60 56 37
					56 93 4
				`,
				expected: 46,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
