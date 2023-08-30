// @ts-ignore
export function exhaustiveCheck(x: never): never {
  if (process.env.NODE_ENV === "production") {
    console.error("Exhaustive check failed");
  } else {
    throw new Error("Exhaustive check failed");
  }
}
