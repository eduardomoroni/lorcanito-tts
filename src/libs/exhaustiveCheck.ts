// @ts-ignore
export function exhaustiveCheck(x: never): never {
  const data = JSON.stringify(x || "");

  if (process.env.NODE_ENV === "production") {
    console.error(`Exhaustive check failed: ${data}`);
  } else {
    throw new Error(`Exhaustive check failed: ${data}`);
  }
}
