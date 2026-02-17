export const ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'] as const

export const MONSTER_RACES = [
  'Aqua',
  'Beast',
  'Beast-Warrior',
  'Cyberse',
  'Dinosaur',
  'Divine-Beast',
  'Dragon',
  'Fairy',
  'Fiend',
  'Fish',
  'Insect',
  'Machine',
  'Plant',
  'Psychic',
  'Pyro',
  'Reptile',
  'Rock',
  'Sea Serpent',
  'Spellcaster',
  'Thunder',
  'Warrior',
  'Winged Beast',
  'Wyrm',
  'Zombie',
] as const

export const SPELL_TRAP_RACES = [
  'Normal',
  'Continuous',
  'Counter',
  'Equip',
  'Field',
  'Quick-Play',
  'Ritual',
] as const

export const ALL_RACES = [...MONSTER_RACES, ...SPELL_TRAP_RACES] as const

export const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1) as number[]

export const FRAME_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'effect', label: 'Effect' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'synchro', label: 'Synchro' },
  { value: 'xyz', label: 'XYZ' },
  { value: 'link', label: 'Link' },
  { value: 'spell', label: 'Spell' },
  { value: 'trap', label: 'Trap' },
  { value: 'token', label: 'Token' },
] as const
