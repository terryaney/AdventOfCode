# 🎄 Advent of Code 2024 - Day 9 - Disk Fragmenter 🎄

## Info

Task description: [link](https://adventofcode.com/2024/day/9)

## Results

```
Time part 1: 10.775ms
Time part 2: 60.81ms
Both parts: 71.585ms
```

## Notes

For Part 2, I kind of overdid it here given problem.  Could have done a simpler structure and not kept the file map intact since an entire file moves from right to left, I didn't have to try and maintain a newly created empty gap, but I did.  Run time of 60ms seems a bit extreme, but I don't have a reference to any other competitors to know where it stands.

I'm happy with the readability of the solution even given the performance.