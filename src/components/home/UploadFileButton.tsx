'use client';
import { Button } from "../ui/Button";
import { UploadIcon } from "../icons/UploadIcon";
import { useState } from "react";
import { addFile } from "@/utils/indexedDb";
import { useCurrentUserContext } from "@/context/UserContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/Dialog";
import { Input } from "../ui/Input";
import React from 'react';

type Props = {};

export const UploadFileButton = (props: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [file, setFile] = useState<File>();

  const { getUserFiles, getSharedFiles, storageUser } = useCurrentUserContext();

  const onSubmit = async () => {
    if (!file) return;

    try {
      console.log({ file });
      await addFile({ creatorId: storageUser.id, fileName: file.name, fileSize: file.size, createdDate: new Date(), file: file, creatorName: storageUser.name, creatorLastName: storageUser.lastName, type: file.type });
      getUserFiles();
      getSharedFiles();
      setFile(undefined);
      setModalIsOpen(false);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleOpenModal = () => {
    if (modalIsOpen) setModalIsOpen(false);
    if (!modalIsOpen) setModalIsOpen(true);
  };
  return (
    <Dialog open={modalIsOpen} onOpenChange={handleOpenModal}>
      <DialogTrigger asChild>
        <Button className="ml-auto" variant="outline" onClick={handleOpenModal}>
          <UploadIcon className="h-6 w-6 mr-2" />
          Cargar Archivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecciona un archivo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input id="picture" type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        </div>
        <DialogFooter>
          <Button className="w-fit" onClick={onSubmit}>Subir archivo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};