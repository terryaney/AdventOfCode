# 🎄 Advent of Code 2023 - day 24 🎄

## Info

Task description: [link](https://adventofcode.com/2023/day/24)

No idea on how to solve part 2 :(  Almost all solutions/discussions on the web were Python using [sympy](https://www.sympy.org/en/index.html) library which I don't have access to.  I tried to use [nerdamer](https://nerdamer.com/) and [mathjs](https://mathjs.org/) after watching HyperNeutrino's [video](https://www.youtube.com/watch?v=guOyA7Ijqgk) but couldn't figure out how to translate nerdamer or mathjs to do same concepts he was using in sympy.

I then tried to translate a Python [solution](https://github.com/joshackland/advent_of_code/blob/master/2023/python/24.py) from Josh Ackland (who [admittedly](https://youtu.be/91qd9Uv2I9E?t=1089) copied a solution from somewhere for part 2) but that failed to return a result for the real data (sample data passed).  His solution is in this [commit](https://github.com/terryaney/advent-of-code/commit/a4073ebad9be4e5bdabefd1b215e344b9e4d6226).

I then tried to translate a Kotlin [solution](https://github.com/werner77/AdventOfCode/blob/master/src/main/kotlin/com/behindmedia/adventofcode/year2023/day24/Day24.kt) from Werner Altewischer after watching his [video](https://www.youtube.com/watch?v=nP2ahZs40U8&t=231s) but his failed to return a result even for the test data.  I've submitted an [issue](https://github.com/werner77/AdventOfCode/issues/2) asking if he wants to peek at code, so we'll see.  The code for this can be found at this [commit](https://github.com/terryaney/advent-of-code/commit/b0b3af4d817863b3b52bcc0afae4f5e8ea3d81df).

Finally solved by following ensce's [article](https://aoc.csokavar.hu/?day=24) and his [c# solution](https://github.com/encse/adventofcode/blob/master/2023/Day24/Solution.cs) to Typescript.  I had to use mathjs to have `BigNumber` and for some reason this runs SOOO slow in typescript (1 minute).  If I run his code in LINQPad (added the file to day24 folder), it runs in a matter of milliseconds.

Note: Having to convert to use BigNumber might have helped with the previous attempts, but not testing that theory at the moment.

A star is a star...man, I hope day 25 isn't this bad.

## Results

```
Time part 1: 5.768ms
Time part 2: -
Both parts: 5.768ms
```

## Notes

...