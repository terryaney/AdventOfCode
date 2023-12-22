# 🎄 Advent of Code 2023 - day 20 🎄

## Info

Task description: [link](https://adventofcode.com/2023/day/20)

## Results

```
Time part 1: 11.71ms
Time part 2: 17.082ms
Both parts: 28.791ms
```

## Notes

HyperNeutrino [video](https://youtu.be/lxm6i21O83k?t=1095) helps with assumption/algorithm.

1. Looking at input, `rx` only has one input.
1. Lets say, `&tca -> rx`.  So, `tca` is a conjunction that outputs a low pulse to `rx` if/only if all `tca` inputs are high.
1. Using the assumption that every input into `tca` will create a low pulse on every single button press, but will only create a high pulse on regular intervals.
1. So if we can find that interval when they generate a high pulse, we can find the lowest common multiple of all of them to figure out when all will be high at the same time.