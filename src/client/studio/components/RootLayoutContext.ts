import { createContext, useContext } from "react";

export const RootLayoutContext = createContext({
  setSubTitle: (subtitle: string) => {},
  subTitle: "",
  logoHovered: false,
  setLogoHovered: () => {},
});

export const useRootLayoutContext = () => {
  return useContext(RootLayoutContext);
};
