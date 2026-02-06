
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
  // Mapping to local asset files provided by the user in the root directory
  const colorMap: Record<RoseColor, string> = {
    [RoseColor.RED]: 'red.jpg',
    [RoseColor.PINK]: 'pink.jpg',
    [RoseColor.YELLOW]: 'yellow.jpg',
    [RoseColor.WHITE]: 'white.jpg',
    [RoseColor.BLUE]: 'blue.jpg'
  };
  return colorMap[color];
};
