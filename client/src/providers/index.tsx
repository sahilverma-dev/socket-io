import { FC, ReactNode } from "react";
import { SocketProvider } from "./SocketProvider";

interface Props {
  children: ReactNode;
}

const Providers: FC<Props> = ({ children }) => {
  return <SocketProvider>{children}</SocketProvider>;
};

export default Providers;
