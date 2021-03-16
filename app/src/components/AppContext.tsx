import {
  createContext,
  DispatchWithoutAction,
  ReactNode,
  useReducer,
} from "react";

export const AppContext = createContext({ setIsReady: () => {} } as {
  isReady: boolean;
  setIsReady: DispatchWithoutAction;
});

const Provider = ({ children }: { children?: ReactNode }) => {
  const [isReady, setIsReady] = useReducer(() => true, false);
  return (
    <AppContext.Provider value={{ isReady, setIsReady }}>
      {children}
    </AppContext.Provider>
  );
};

export default Provider;
