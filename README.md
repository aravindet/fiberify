# fiberify
Jank-less computation on the browser

Fiberify breaks up big recursive computations (like diffing or merging trees) into separate chunks and schedules them to run in the browser without dropping frames.

# Usage

```js
// Lets say you want to calculate 2^n in the dumbest possible way.

const pow = n => {
  let s = 1;
  for (let i = 0; i < n; i++) s += pow(i);
  return s;
}

// Fiberifying this just requires some well placed async/awaits:

const fibpow = fiberify(async n => {
  let s = 1;
  for (let i = 0; i < n; i++) s += await pow(i);
  return s;
});
```

# Performance

Fiberify focuses on maintaining responsiveness, and not completing the computation efficiently. The time required to complete a fiberified computation is usually several times higher than the direct recursive function.
