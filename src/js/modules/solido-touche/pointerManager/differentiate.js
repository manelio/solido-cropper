export default function(series, op) {

  let result = [];

  let n = series.length;
  if (n < 2) {
    return [[0, 0, 0]];
  }


  let previous = series[0];
  let current;

  let i = 1;
  while(i < n) {
    current = series[i];
    let v = [previous[0], current[0] - previous[0], op(current[2], previous[2])];
    result.push(v);
    previous = current;
    i++;
  }

  return result;
}

