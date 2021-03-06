const minus = (num1: number, num2: number): number => {
  return +((num1 * 1e8 - num2 * 1e8) / 1e8).toFixed(8);
};

export default minus;
