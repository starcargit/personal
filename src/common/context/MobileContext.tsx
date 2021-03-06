import { createContext, useContext } from 'react';
import { CProps } from 'src/common/types/client';
import useMobileScreen from 'src/common/hooks/useMobileScreen';

const context = createContext({ md: false, sm: false, mobile: false });
const useMobileContext = () => useContext(context);

export const MobileContextProvider = ({ children }: CProps) => {
  const mobile = useMobileScreen();
  return <context.Provider value={mobile}>{children}</context.Provider>;
};

export default useMobileContext;
