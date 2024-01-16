import { UserFile } from "@/types/files";
import { User } from "@/types/user";
import { ReactElement } from "react";

export type ProviderProps = {
  children: ReactElement[] | ReactElement;
};

export type CurrentUserContextData = {
  userFiles: UserFile[];
  setUserFiles: React.Dispatch<React.SetStateAction<UserFile[]>>;
  sharedFiles: UserFile[];
  setSharedFiles: React.Dispatch<React.SetStateAction<UserFile[]>>;
  getUserFiles: () => void;
  getSharedFiles: () => void;
  storageUser: User | null;
  setStorageUser: (newValue: User) => void;
};