import { MDXComponents } from "./src/client/studio/components/MDXComponents";

export function useMDXComponents(components) {
  return {
    ...components,
    ...MDXComponents,
  };
}
