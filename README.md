# 🎄 Advent of Code 🎄

<!-- 
https://en.wikipedia.org/wiki/List_of_Unicode_characters 
https://badgen.net/help#generators
https://dev.to/this-is-learning/advent-of-code-automation-for-javascripttypescript-4111
-->

[![AoC](https://badgen.net/badge/AoC/2023/blue)](https://adventofcode.com/2023)
[![Node](https://badgen.net/badge/Node/v16.13.0+/blue)](https://nodejs.org/en/download/)
![Language](https://badgen.net/badge/Language/TypeScript/blue)
[![Template](https://badgen.net/badge/Template/aocrunner/blue)](https://github.com/caderek/aocrunner)

## My Runner To Do

1. index.ts at aocrunner root has a run() that takes a file name, need to figure out how to parse year

## Years

<!--SOLUTIONS-->

[![Year](https://badgen.net/badge/2023/✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨/green?icon=typescript&labelColor=blue&scale=1.3)](src/2023)  
[![Year](https://badgen.net/badge/2016/☆⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒/gray?icon=typescript&labelColor=blue&scale=1.3)](src/2016)  
[![Year](https://badgen.net/badge/2015/★★⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒⭒/gray?icon=typescript&labelColor=blue&scale=1.3)](src/2015)  

<!--/SOLUTIONS-->

_Click a badge to go to the specific year._

---

## Installation

```
npm i
```

### Create a launch.json file

To enable VS Code debugging, create a `launch.json` file in `.vscode` directory with the following content:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${file}",
            "preLaunchTask": "tsc: build - tsconfig.json"
        }
    ]
}
```

---

## Running in dev mode

```
npm start <year> <day>
```

Example:

```
npm start 2023 1
```

---

## Results

<!--RESULTS-->


```
Year 2023
Total stars: 50/50
Total time: 84913.436ms
```
Year 2016
Total stars: 1/50
Total time: 0.12ms
```
```
Year 2015
Total stars: 4/50
Total time: 1.55ms
```

<!--/RESULTS-->

---

✨🎄🎁🎄🎅🎄🎁🎄✨