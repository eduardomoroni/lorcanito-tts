import { MDXComponents } from "./src/spaces/studio/components/MDXComponents";

export function useMDXComponents(components) {
  return {
    ...components,
    ...MDXComponents,
  };
}
