const ADJECTIVES = [
  'BLUE', 'RED', 'SWIFT', 'BOLD', 'CALM', 'DARK', 'FAST',
  'GOLD', 'JADE', 'KEEN', 'LIME', 'MINT', 'NEON', 'OAK',
  'PINK', 'RUBY', 'SAGE', 'TEAL', 'WARM', 'ZINC', 'SILVER',
  'BRONZE', 'WILD', 'MYSTIC', 'VIBRANT', 'GLOWING', 'SILENT'
];

const NOUNS = [
  'DUCK', 'BEAR', 'WOLF', 'HAWK', 'DEER', 'FROG', 'CRAB',
  'FISH', 'LYNX', 'MOLE', 'NEWT', 'OWLS', 'PUMA', 'ROOK',
  'SEAL', 'TOAD', 'VOLE', 'WREN', 'YAKS', 'ZEBU', 'EAGLE',
  'TIGER', 'FOX', 'OTTER', 'BADGER', 'DOLPHIN', 'SHARK'
];

export function generateRoomCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}-${noun}-${num}`;
}

export function formatRoomCode(input: string): string {
  // Replace spaces/special chars with dashes and force uppercase
  return input.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
}

export function isValidRoomCode(input: string): boolean {
  const clean = formatRoomCode(input);
  return /^[A-Z]+-[A-Z]+-\d+$/.test(clean);
}
