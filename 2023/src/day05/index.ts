import run from "aocrunner";
import * as util from '../utils/index.js';

class Map {
	public fromStart: number;
	public toStart: number;
	public range: number;

	constructor(from: number, to: number, length: number) {
		this.fromStart = from;
		this.toStart = to;
		this.range = length;
	}

	public fromEnd(): number {
		return this.fromStart + this.range - 1;
	}
	public toEnd(): number {
		return this.toStart + this.range - 1;
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

const parseMaps = (rawMaps: string): Array<Map> => {
	return rawMaps.split("\n").slice(1).map(l => l.split(" ").map(Number)).map(mapInfo => new Map(mapInfo[1], mapInfo[0], mapInfo[2]));
};

const parseInput = (rawInput: string): ParsedInput => {
	const info = rawInput.split("\n\n");

	return {
		seeds: info[0].substring(7).split(" ").map(Number),
		seedToSoilMappings: parseMaps(info[1]),
		soilToFertilizerMappings: parseMaps(info[2]),
		fertilizerToWaterMappings: parseMaps(info[3]),
		waterToLightMappings: parseMaps(info[4]),
		lightToTemperatureMappings: parseMaps(info[5]),
		temperatureHumidityMappings: parseMaps(info[6]),
		humidityToLocationMappings: parseMaps(info[7])
	} as ParsedInput;
};

function findMapTo(mappings: Array<Map>, fromNumber: number): number {
	// Mappings: - length = 2
	// 50 98 2 - mappings[0], index = 0
	// 52 50 48 - mappings[1], index = 1
	// index = 2
	// fromNumber (seed first round): 79
	for (let index = 0; index < mappings.length; index++) {
		const desintationMap = mappings[index];
		if (desintationMap.fromStart <= fromNumber && fromNumber <= desintationMap.fromEnd()) {
			// 52 + (79 - 50) -> 52 + 29 -> 81
			// Search for 51
			// 52 + 51 - 50 -> 52 + 1 -> 53
			return desintationMap.toStart + (fromNumber - desintationMap.fromStart);
		}
	}

	return fromNumber;
}

function findLocation(parsedInput: ParsedInput, seedNumber: number): number {
	const soilNumber = findMapTo(parsedInput.seedToSoilMappings, seedNumber);
	const fertilizerNumber = findMapTo(parsedInput.soilToFertilizerMappings, soilNumber);
	const waterNumber = findMapTo(parsedInput.fertilizerToWaterMappings, fertilizerNumber);
	const lightNumber = findMapTo(parsedInput.waterToLightMappings, waterNumber);
	const temperatureNumber = findMapTo(parsedInput.lightToTemperatureMappings, lightNumber);
	const humidityNumber = findMapTo(parsedInput.temperatureHumidityMappings, temperatureNumber);
	const locationNumber = findMapTo(parsedInput.humidityToLocationMappings, humidityNumber);
	return locationNumber;
}

function findLowestLocation(parsedInput: ParsedInput, seeds: Array<{from: number, to: number}>): number {
	let lowestLocation = Number.MAX_SAFE_INTEGER;

	for (let index = 0; index < seeds.length; index ++) {
		const seedInfo = seeds[index];
		// console.log(`Search ${seedInfo.from} to ${seedInfo.to} (${seedInfo.to - seedInfo.from + 1} items)...`);
		for (let seed = seedInfo.from; seed <= seedInfo.to; seed++) {
			const locationNumber = findLocation(parsedInput, seed);
			if ( locationNumber < lowestLocation) {
				lowestLocation = locationNumber;
				// console.log(`Seed ${seed} -> Location ${lowestLocation} is new lowest...`);
			}
		}
	}
	
	return lowestLocation;
}

const part1 = (rawInput: string) => {
	const parsedInput = parseInput(rawInput);
	return findLowestLocation(parsedInput, parsedInput.seeds.map(seedNumber => { return { from: seedNumber, to: seedNumber }; }));
};

const part2 = (rawInput: string) => {
	const parsedInput = parseInput(rawInput);

	let seedRanges: Array<{from: number, to: number}> = [];
	for (let index = 0; index < parsedInput.seeds.length; index += 2) {
		const from = parsedInput.seeds[index];
		seedRanges.push({ from: from, to: from + parsedInput.seeds[index + 1] - 1 });
	}

	return findLowestLocation(parsedInput, seedRanges);
}

run({
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
			}
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
			}
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: false,
});