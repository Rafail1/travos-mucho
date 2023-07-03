import { DEFAULT_SHORT_NUMBER } from '../../config/constants';

export function shortNumber(
  value: number,
  { decPlaces, abbrev } = DEFAULT_SHORT_NUMBER
): { value: number; abbrev?: string } {
  decPlaces = Math.pow(10, decPlaces);

  for (let i = abbrev.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3);
    if (size <= value) {
      value = Math.floor((value * decPlaces) / size) / decPlaces;
      if (value == 1000 && i < abbrev.length - 1) {
        value = 1;
        i++;
      }

      return { value, abbrev: abbrev[i] };
    }
  }

  return { value };
}
