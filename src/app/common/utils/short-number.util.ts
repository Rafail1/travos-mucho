const abbrev = ['k', 'm', 'b', 't'];

export function shortNumber(value: number, decPlaces: number = 2): string {
  const decPlacesPowed = Math.pow(10, decPlaces);

  for (let i = abbrev.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3);
    if (size <= value) {
      value = Math.floor((value * decPlacesPowed) / size) / decPlacesPowed;
      if (value == 1000 && i < abbrev.length - 1) {
        value = 1;
        i++;
      }
      return `${value}${abbrev[i]}`;
    }
  }

  return value.toFixed(decPlaces);
}
