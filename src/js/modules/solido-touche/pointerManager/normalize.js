export default function(series, op) {

  let n = series.length;
  if (n < 1) {
    return [0, 0];
  }

  let current;
  let i = 0;
  let t = 0;
  let v = 0;

  while(i < n) {
    current = series[i];
    t += current[1];
    v += current[2];
    i++;
  }

  return [t, v];
}

