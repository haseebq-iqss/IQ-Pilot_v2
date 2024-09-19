const BigNumberFormatter = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }

  // Convert to thousands and format as `k`
  return `${(num / 1000).toFixed(1)}k`;
};

export default BigNumberFormatter;
