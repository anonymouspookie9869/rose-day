
import { RoseColor } from "../types";

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
  // Using direct GitHub Raw URLs for reliability
  const baseUrl = "https://raw.githubusercontent.com/anonymouspookie9869/rose-day/main/assets";
  const colorMap: Record<RoseColor, string> = {
    [RoseColor.RED]: `${baseUrl}/red.jpg`,
    [RoseColor.PINK]: `${baseUrl}/pink.jpg`,
    [RoseColor.YELLOW]: `${baseUrl}/yellow.jpg`,
    [RoseColor.WHITE]: `${baseUrl}/white.jpg`,
    [RoseColor.BLUE]: `${baseUrl}/blue.jpg`
  };
  return colorMap[color];
};
