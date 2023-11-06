const windows = process.platform === "win32";

/** @type {import('prettier').Config}*/
module.exports = {
  printWidth: 75,
  tabWidth: 2,
  semi: true,
  endOfLine: windows ? "crlf" : "lf",
  trailingComma: "es5",
  bracketSameLine: false,
};
