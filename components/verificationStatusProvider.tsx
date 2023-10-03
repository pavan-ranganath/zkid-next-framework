"use client";

import React, { ReactNode, createContext, useContext } from "react";

const VerifyStatusContext = createContext(false);

export const useVerifyStatus = () => {
  return useContext(VerifyStatusContext);
};

type VerifyStatusProviderProps = {
  children: ReactNode;
  initialStatus: boolean;
};

export const VerifyStatusProvider = ({ children, initialStatus }: VerifyStatusProviderProps) => {
  return <VerifyStatusContext.Provider value={initialStatus}>{children}</VerifyStatusContext.Provider>;
};
