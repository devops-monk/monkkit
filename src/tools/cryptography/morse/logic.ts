const MORSE: Record<string, string> = {
  A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
  ".":".-.-.-",",":"--..--","?":"..--..","!":"-.-.--","/":"-..-.","-":"-....-","(":"-.--.",")":"-.--.-","&":".-...",":":"---...",";":"-.-.-.","=":"-...-","+":".-.-.","_":"..--.-",'"':".-..-.","\$":"...-..-","@":".--.-.","'":".----.",
};
const MORSE_REVERSE: Record<string, string> = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

export interface MorseInput {
  input: string;
  mode: "encode" | "decode";
  separator?: string;
}

export interface MorseOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): MorseOutput {
  const { input, mode, separator = "/" } = params as MorseInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    if (mode === "encode") {
      const out = input.toUpperCase().split("").map((ch) => {
        if (ch === " ") return separator;
        return MORSE[ch] ?? "?";
      }).join(" ");
      return { success: true, output: out };
    } else {
      const words = input.split(new RegExp(`\\s*${separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`));
      const decoded = words.map((word) => {
        return word.trim().split(/\s+/).map((code) => {
          if (!code) return "";
          return MORSE_REVERSE[code] ?? "?";
        }).join("");
      }).join(" ");
      return { success: true, output: decoded };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
