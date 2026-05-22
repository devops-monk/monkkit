const NATO: Record<string, string> = {
  A:"Alpha",B:"Bravo",C:"Charlie",D:"Delta",E:"Echo",F:"Foxtrot",G:"Golf",H:"Hotel",I:"India",J:"Juliet",K:"Kilo",L:"Lima",M:"Mike",N:"November",O:"Oscar",P:"Papa",Q:"Quebec",R:"Romeo",S:"Sierra",T:"Tango",U:"Uniform",V:"Victor",W:"Whiskey",X:"X-ray",Y:"Yankee",Z:"Zulu",
  "0":"Zero","1":"One","2":"Two","3":"Three","4":"Four","5":"Five","6":"Six","7":"Seven","8":"Eight","9":"Nine",
};

export interface NatoInput {
  input: string;
  mode: "encode" | "decode";
}

export interface NatoOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): NatoOutput {
  const { input, mode } = params as NatoInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    if (mode === "encode") {
      const out = input.toUpperCase().split("").map((ch) => {
        if (ch === " ") return "(Space)";
        return NATO[ch] ?? ch;
      }).join(" ");
      return { success: true, output: out };
    } else {
      const natoReverse: Record<string, string> = {};
      for (const [k, v] of Object.entries(NATO)) natoReverse[v.toLowerCase()] = k;
      natoReverse["space"] = " ";
      const words = input.replace(/\(space\)/gi, " ").split(/\s+/);
      const out = words.map((w) => natoReverse[w.toLowerCase()] ?? w).join("");
      return { success: true, output: out };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
