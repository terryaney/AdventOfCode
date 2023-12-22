import run from "aocrunner";
import * as util from '../utils/index.js';
import { mod, re } from "mathjs";
import { stat } from "fs";

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
	public inputs?: Array<{ name: string, state: number }> = [];

	constructor(name: string, type: ModuleType, destinations: string[]) {
		this.name = name;
		this.type = type;
		this.destinations = destinations;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const modules: ModuleDictionary = {};
	const flipFlops: Module[] = [];
	const conjunctions: Module[] = [];
	const inputs: { [destination: string]: Array<string> } = {};
	
	lines.forEach(line => {
		const [name, dest] = line.split(' -> ');
		
		const type: ModuleType = 
			name == "broadcaster" ? "Broadcaster" :
				name.startsWith('&') ? "Conjunction" :
					name.startsWith('%') ? "FlipFlop" :
						"None";
				
		const destinations = dest.split(",").map(d => d.trim());

		const module = new Module(
			type == "Conjunction" || type == "FlipFlop" ? name.substring(1) : name,
			type,
			destinations
		);

		destinations.forEach(destination => {
			if (inputs[destination] == undefined) {
				inputs[destination] = [];
			}
			inputs[destination].push(module.name);
		});
	
		if (type == "Conjunction") {
			conjunctions.push(module);
		}
		else if (type == "FlipFlop") {
			flipFlops.push(module);
		}
		modules[module.name] = module;
	});

	conjunctions.forEach(conjunction => {
		conjunction.inputs = inputs[conjunction.name].map( name => ({ name: name, state: 0 }));
	});

	return { modules, flipFlops, conjunctions };
};

const solve = (rawInput: string, isPart2: boolean, buttonPresses: number) => {
	const input = parseInput(rawInput);
	const modules = input.modules;	

	let lowPulses = 0;
	let highPulses = 0;
	const pressCache: Array<{ low: number, high: number }> = [];
	
	for (let i = 0; i < buttonPresses; i++) {
		const pulses = [new Pulse(0, "button", "broadcaster")];
		let rxPulses = 0;
		
		while (pulses.length > 0) {
			const pulse = pulses.shift()!;
			const module = modules[pulse.destination];
			// console.log(`${pulse.source} -${pulse.type == 1 ? "high" : "low"}-> ${pulse.destination}`);
			
			rxPulses += pulse.destination == "rx" && pulse.type == 0 ? 1 : 0;

			if (pulse.type == 1) {
				highPulses++;
			}
			else {
				lowPulses++;
			}

			if (module != undefined) {
				if (module.type == "FlipFlop" && pulse.type == 0) {
					module.state = (module.state + 1) % 2;
				}
				else if (module.type == "Conjunction") {
					module.inputs!.find(i => i.name == pulse.source)!.state = pulse.type;
				}

				const pulseToSend =
					module.type == "FlipFlop" ? module.state :
					module.type == "Conjunction" ? module.inputs!.every(i => i.state == 1) ? 0 : 1 :
					pulse.type;

				module.destinations.forEach(destination => {
					if (module.type == "Broadcaster") {
						pulses.push(new Pulse(pulseToSend, module.name, destination));
					}
					else if (module.type == "FlipFlop" && pulse.type == 0) {
						pulses.push(new Pulse(pulseToSend, module.name, destination));
					}
					else if (module.type == "Conjunction") {
						pulses.push(new Pulse(pulseToSend, module.name, destination));
					}
					else {
						// console.log(`Unknown module type ${module.type}`);
					}
				});
			}
		}

		pressCache.push({ low: lowPulses, high: highPulses });

		if (!isPart2 && input.flipFlops.every(flipFlop => flipFlop.state == 0) && input.conjunctions.every(conjunction => conjunction.inputs!.every(i => i.state == 0))) {
			break;
		}
		else if (isPart2 && rxPulses == 1) {
			break;
		}
	}

	if (!isPart2) {
		const factor = buttonPresses / pressCache.length;
		const remainder = buttonPresses % pressCache.length;
		return (factor * highPulses * factor * lowPulses) + ( remainder != 0 ? pressCache[remainder - 1].high * pressCache[remainder - 1].low : 0);
	}
	else {
		return buttonPresses;
	}

	// console.log(modules);
};

const part1 = (rawInput: string) => solve(rawInput, false, 1000);
const part2 = (rawInput: string) => solve(rawInput, true, 1000);

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
		tests: [
			{
				input: `
				broadcaster -> a, b, c
				%a -> b
				%b -> c
				%c -> inv
				&inv -> a
				`,
				expected: 1
			}
		],
		solution: part2
	},
	trimTestInputs: true
});