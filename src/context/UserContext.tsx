'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { CurrentUserContextData, ProviderProps } from './UserContext.types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getFilesCreatedByUser, getSharedFilesToUser } from '@/utils/indexedDb';
import { UserFile } from '@/types/files';

const defaultCurrentUserContextData: CurrentUserContextData = {
  userFiles: [],
  setUserFiles: () => { },
  sharedFiles: [],
  setSharedFiles: () => { },
  getUserFiles: () => { },
  getSharedFiles: () => { },
  storageUser: null,
  setStorageUser: () => { }
};

const CurrentUserContext = createContext<CurrentUserContextData>(defaultCurrentUserContextData);

export const useCurrentUserContext = () => useContext(CurrentUserContext);

export const CurrentUserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [sharedFiles, setSharedFiles] = useState<UserFile[]>([]);
  const [storageUser, setStorageUser] = useLocalStorage("user", null);


  const getUserFiles = async () => {
    if (!storageUser) return;
    console.log("getUserFiles");
    console.log({ storageUser });
    const dbUserFiles = await getFilesCreatedByUser(storageUser.id);
    console.log({ dbUserFiles });
    setUserFiles(dbUserFiles);
  };

  const getSharedFiles = async () => {
    if (!storageUser) return;
    console.log("getSharedFiles");
    console.log({ storageUser });
    const dbSharedFiles = await getSharedFilesToUser(storageUser.id);
    console.log({ dbSharedFiles });
    setSharedFiles(dbSharedFiles);
  };

  useEffect(() => {
    getUserFiles();
    getSharedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageUser?.id, storageUser]);

  return (
    <CurrentUserContext.Provider value={{ userFiles, setUserFiles, getUserFiles, sharedFiles, getSharedFiles, setSharedFiles, storageUser, setStorageUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};