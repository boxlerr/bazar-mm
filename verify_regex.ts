const text = "Producto A - Test   2      100.50    201.00";
const regexString = "^(.+?)\\s+(\\d+)\\s+([\\d.,]+)\\s+([\\d.,]+)$";
const regex = new RegExp(regexString);

console.log("Testing Line:", text);
console.log("Regex:", regexString);

const match = text.match(regex);
if (match) {
    console.log("MATCH FOUND!");
    console.log("1 (Desc):", match[1]);
    console.log("2 (Qty):", match[2]);
    console.log("3 (Price):", match[3]);
    console.log("4 (Total):", match[4]);
} else {
    console.log("NO MATCH.");
}

// Test with simple text
const text2 = "A   2   100.50   201.00";
console.log("\nTesting Line 2:", text2);
const match2 = text2.match(regex);
console.log("Match 2:", match2 ? "YES" : "NO");
