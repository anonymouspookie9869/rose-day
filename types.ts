
export interface RoseWish {
  recipient: string;
  relation: string;
  vibe: 'Romantic' | 'Cute' | 'Poetic' | 'Friendly';
  message: string;
  imageUrl?: string;
  audioData?: string;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  currentWish: RoseWish | null;
}

export enum RoseColor {
  RED = 'Red',
  PINK = 'Pink',
  YELLOW = 'Yellow',
  WHITE = 'White',
  BLUE = 'Blue'
}
