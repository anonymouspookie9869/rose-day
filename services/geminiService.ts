
import { RoseColor } from "../types";

// The specific heartfelt message provided by the user for Vanshika
const USER_MESSAGE = "Chaahe hum baat karein ya na karein, tum aaj bhi mere liye wahi ho jo pehle thi My sweetheart .... Sending you this rose to remind you that no matter the distance or silence, you are always in my heart. Happy Rose Day";

const MESSAGES: Record<RoseColor, string> = {
  [RoseColor.RED]: USER_MESSAGE,
  [RoseColor.PINK]: USER_MESSAGE,
  [RoseColor.YELLOW]: USER_MESSAGE,
  [RoseColor.WHITE]: USER_MESSAGE,
  [RoseColor.BLUE]: USER_MESSAGE
};

export const getRoseDayWish = (recipient: string, color: RoseColor) => {
  return MESSAGES[color] || USER_MESSAGE;
};

export const getRoseImagePath = (color: RoseColor) => {
  // Mapping to asset files located in the 'assets/' folder
  const colorMap: Record<RoseColor, string> = {
    [RoseColor.RED]: 'assets/red.jpg',
    [RoseColor.PINK]: 'assets/pink.jpg',
    [RoseColor.YELLOW]: 'assets/yellow.jpg',
    [RoseColor.WHITE]: 'assets/white.jpg',
    [RoseColor.BLUE]: 'assets/blue.jpg'
  };
  return colorMap[color];
};
