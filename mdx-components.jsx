import { MDXComponents } from "./src/studio/components/MDXComponents";

export function useMDXComponents(components) {
  return {
    ...components,
    ...MDXComponents,
  };
}
