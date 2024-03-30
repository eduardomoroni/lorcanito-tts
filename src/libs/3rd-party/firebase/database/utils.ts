export function recursivelyNullifyUndefinedValues<T>(obj: unknown = {}) {
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (!!value && typeof value === "object") {
      if (key === "rootStore") {
        console.log("rootStore", key);
        return;
      }

      recursivelyNullifyUndefinedValues(value);
    } else if (value === undefined) {
      // @ts-ignore
      obj[key] = null;
    }
  });

  return obj as T;
}
