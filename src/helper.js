export function reverseWords(str) {
  return str.split(' ').map(word => word.split('').reverse().join('')).join(' ');
}

export function sumUpTo(n) {
  if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) return 0;
  return n * (n + 1) / 2;
}

export function filterAndSort(arr, threshold) {
  return arr.filter(num => num > threshold).sort((a, b) => a - b);
}

export function isPrime(n) {
  if (n <= 1 || !Number.isInteger(n)) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export function flattenObject(obj, prefix = '', result = {}) {
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Invalid Date';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
