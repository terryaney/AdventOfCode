# 🎄 Advent of Code 2023 - Day 25 - Snowverload 🎄

## Info

Task description: [link](https://adventofcode.com/2023/day/25)

## Results

```
Time part 1: 33627.221ms
Time part 2: 0ms
Both parts: 33627.221ms
```

## Notes

I have no Graph Theory experience, and just looked around until I found a pure solution (not using libraries that do not exist in TypeScript) that I could translate into TypeScript.  Thanks to [Paul Wild's Solution](https://github.com/PaulWild/advent-of-code-2023/blob/main/AdventOfCode/Days/Day25.cs) I was able to get this done.

> I implemented [karger's algorithm](https://en.wikipedia.org/wiki/Karger%27s_algorithm) which is a randomized algorithm to find the minimum number of cuts to split a graph in two. Obviously we already have that information (3) but a small tweak to the algorithm to track which nodes have been contracted together gives you the two numbers needed to get the solution

I might go back and look at [encse writeup](https://aoc.csokavar.hu/?day=25) as I like his style, but I found it after I finished and will have to wait :)