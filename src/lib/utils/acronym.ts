export function deriveAcronym(name: string): string {
  if (!name.trim()) return ''
  const vowels = name.toUpperCase().replace(/[^AEIOU]/g, '')
  if (vowels.length >= 3) return vowels.slice(0, 3)
  // pad with first consonants if fewer than 3 vowels
  const consonants = name.toUpperCase().replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, '')
  return (vowels + consonants).slice(0, 3).padEnd(3, 'X')
}
