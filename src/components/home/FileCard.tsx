import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { deleteFileById, getAllUsers, shareFile } from '@/utils/indexedDb';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useCurrentUserContext } from '@/context/UserContext';
import { TrashIcon, DownloadIcon, Share1Icon } from '@radix-ui/react-icons';

type Props = {
  fileName: string,
  creatorName: string,
  creatorLastName: string,
  fileSize: number,
  id: number;
  creatorId: number;
  file: File;
  type: string;
};

export const FileCard = ({ fileName, creatorName, creatorLastName, fileSize, id, creatorId, file, type }: Props) => {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const { getUserFiles, getSharedFiles, storageUser } = useCurrentUserContext();

  const getAllUsersToShare = async () => {
    const allUsersDB = await getAllUsers(storageUser.id);
    setAllUsers(allUsersDB);
  };

  useEffect(() => {
    if (!storageUser) return;
    getAllUsersToShare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageUser]);

  const handleDelete = async () => {
    try {
      await deleteFileById(id);
      getUserFiles();
      getSharedFiles();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (userId: string) => {
    setSelectedUserId(Number(userId));
  };

  const handleOpenShareModal = () => {
    if (shareModalIsOpen) setShareModalIsOpen(false);
    if (!shareModalIsOpen) setShareModalIsOpen(true);
  };

  const handleOpenDeleteModal = () => {
    if (deleteModalIsOpen) setDeleteModalIsOpen(false);
    if (!deleteModalIsOpen) setDeleteModalIsOpen(true);
  };

  const handleShare = async () => {
    try {
      await shareFile({ fileId: id, userIdToAdd: selectedUserId, currentUserId: storageUser.id });
      setShareModalIsOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([file], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow rounded-lg dark:bg-gray-950">
      <div className="flex-1 grid gap-2">
        <h3 className="font-semibold">{fileName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Size: {Number(fileSize / 1024 / 1024).toFixed(2)} MB | Creator:{`${creatorName} ${creatorLastName}`}</p>
      </div>
      <div className="flex items-center space-x-2">
        {/* DOWNLOAD */}
        <Button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-50 flex items-center gap-2"
          onClick={handleDownload} variant="outline"
        > <DownloadIcon className="w-4 h-4" /></Button>
        {/* SHARE */}
        <Dialog open={shareModalIsOpen} onOpenChange={handleOpenShareModal}>
          <DialogTrigger asChild>
            {creatorId === storageUser?.id && (
              <Button
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-50 flex items-center gap-2"
                variant="outline"
                onClick={handleOpenShareModal}
              >
                <Share1Icon className="w-4 h-4" /> Compartir
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Compartir el archivo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select onValueChange={(userId: string) => handleSelect(userId)}>
                <SelectTrigger >
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allUsers.map((user: any) => <SelectItem key={user.id} value={user.id}>{`${user.name} ${user.lastName}`}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => handleShare()}> Compartir archivo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* DELETE */}
        <Dialog open={deleteModalIsOpen} onOpenChange={handleOpenDeleteModal}>
          <DialogTrigger asChild>
            {creatorId === storageUser.id && (
              <Button
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-50 flex items-center gap-2"
                variant="outline"
                onClick={handleOpenDeleteModal}
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Eliminar archivo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>¿Seguro desea eliminar el archivo?</p>
            </div>
            <DialogFooter>
              <Button type="submit" variant="outline" onClick={handleOpenDeleteModal}> cancelar</Button>
              <Button className='bg-red-600 hover:bg-red-800 text-white flex items-center gap-2' type="submit" onClick={handleDelete}> Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};