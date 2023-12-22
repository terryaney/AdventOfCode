import run from "aocrunner";
import * as util from '../utils/index.js';
import { lcm } from "mathjs";
import { assert } from "console";

class Pulse {
	public type: number;
	public source: string;
	public destination: string;

	constructor(type: number, source: string, destination: string) {
		this.type = type;
		this.source = source;
		this.destination = destination;
	}
}

type ModuleDictionary = { [name: string]: Module };
type ModuleType = "None" | "FlipFlop" | "Conjunction" | "Broadcaster";

class Module {
	public name: string;
	public destinations: string[];
	public type: ModuleType;
	public state = 0;
	public memory: Array<{ name: string, state: number }> = [];

	constructor(name: string, type: ModuleType, destinations: string[]) {
		this.name = name;
		this.type = type;
		this.destinations = destinations;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const modules: ModuleDictionary = {};
	
	lines.forEach(line => {
		const [left, right] = line.split(' -> ');
		
		const type: ModuleType = 
			left == "broadcaster" ? "Broadcaster" :
				left.startsWith('&') ? "Conjunction" :
					left.startsWith('%') ? "FlipFlop" :
						"None";
				
		const destinations = right.split(",").map(d => d.trim());

		const module = new Module(
			type == "Conjunction" || type == "FlipFlop" ? left.substring(1) : left,
			type,
			destinations
		);

		modules[module.name] = module;
	});

	const rxInputs: Array<Module> = [];

	// Find rx input module (part 2) and initialize all conjunction module memories
	for (const name in modules) {
		const module = modules[name];

		module.destinations.forEach(destination => {
			if (destination == "rx") {
				rxInputs.push(module);
			}

			if (modules[destination] != undefined && modules[destination].type == "Conjunction") {
				modules[destination].memory?.push({ name: name, state: 0 });
			}
		});
	}
	
	// console.log(rxInputs);
	// assert(rxInputs.length <= 1, "There should be exactly one rx input");

	const lcmModules: { [name: string]: { cylclesToHigh: number, seen: number } } = {};
	const rxInput = rxInputs.length == 1 ? rxInputs[0] : undefined;

	// My input, &rs -> rx.  Outputs lo to rx if/only if all rs inputs are high.
	// See readme for the reason for LCM modules (the modules that feed into the module that feeds into rx)
	if (rxInput != undefined) {
		for (const name in modules) {
			const module = modules[name];
			if (module.destinations.includes(rxInput.name)) {
				lcmModules[name] = { cylclesToHigh: 0, seen: 0 };
			}
		}
	}

	return { modules, rxInput: rxInput, lcmModules: lcmModules };
};

const solve = (rawInput: string, isPart2: boolean, buttonPresses: number) => {
	const input = parseInput(rawInput);
	const modules = input.modules;
	
	let lowPulses = 0;
	let highPulses = 0;
	let i = 0;

	while (i < buttonPresses) {
		const pulses = [new Pulse(0, "button", "broadcaster")];
		
		while (pulses.length > 0) {
			const pulse = pulses.shift()!;
			// console.log(`${pulse.source} -${pulse.type == 1 ? "high" : "low"}-> ${pulse.destination}`);
			
			if (pulse.type == 1) {
				highPulses++;

				if (pulse.destination == input.rxInput?.name) {
					input.lcmModules[pulse.source].cylclesToHigh = i + 1;
					input.lcmModules[pulse.source].seen++;

					if ( isPart2 && Object.values(input.lcmModules).every(m => m.seen > 0)) {
						return Object.values(input.lcmModules).reduce((acc, m) => lcm(acc, (m.cylclesToHigh / m.seen)), 1);
					}
				}
			}
			else {
				lowPulses++;
			}

			const module = modules[pulse.destination];
			if (module != undefined) {
				if (module.type == "FlipFlop" && pulse.type == 0) {
					module.state = (module.state + 1) % 2;
				}
				else if (module.type == "Conjunction") {
					module.memory.find(i => i.name == pulse.source)!.state = pulse.type;
				}

				const pulseToSend =
					module.type == "FlipFlop" ? module.state :
					module.type == "Conjunction" ? module.memory.every(i => i.state == 1) ? 0 : 1 :
					pulse.type;

				module.destinations.forEach(destination => {
					if (module.type == "FlipFlop" && pulse.type == 0) {
						pulses.push(new Pulse(pulseToSend, module.name, destination));
					}
					else if (module.type != "FlipFlop") {
						pulses.push(new Pulse(pulseToSend, module.name, destination));
					}
				});
			}
		}

		i++;
	};

	// Part 1
	return highPulses * lowPulses;

	// console.log(modules);
};

const part1 = (rawInput: string) => solve(rawInput, false, 1000);
const part2 = (rawInput: string) => solve(rawInput, true, Math.pow(10, 7));

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				broadcaster -> a, b, c
				%a -> b
				%b -> c
				%c -> inv
				&inv -> a
				`,
				expected: 32000000
			},
			{
				input: `
				broadcaster -> a
				%a -> inv, con
				&inv -> b
				%b -> con
				&con -> output
				`,
				expected: 11687500
			}
		],
		solution: part1
	},
	part2: {
		solution: part2
	},
	trimTestInputs: true
});