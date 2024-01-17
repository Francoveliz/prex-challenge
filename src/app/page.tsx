'use client';
import { FileCard } from "@/components/home/FileCard";
import { useCurrentUserContext } from "@/context/UserContext";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const { userFiles, getUserFiles, sharedFiles, getSharedFiles, storageUser } = useCurrentUserContext();
  const router = useRouter();

  useEffect(() => {
    if (storageUser) return;
    router.push("/login");
    return;
  }, [router, storageUser]);

  useEffect(() => {
    getUserFiles();
    getSharedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!storageUser) return <Spinner className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />;

  return (
    <main className="container py-8 gap-8 flex flex-col">
      <div>
        <h2 className="mb-4 font-bold text-2xl">Mis archivos</h2>
        <div className="flex flex-col gap-2">
          {userFiles.length === 0 && <p>Aún no tienes archivos propios</p>}
          {userFiles && userFiles.map((file: any) => <FileCard key={file.id} {...file} />)}
        </div>
      </div>
      <div>
        <h2 className="mb-4 font-bold text-2xl">Archivos que me compartieron</h2>
        <div className="flex flex-col gap-2">
          {sharedFiles.length === 0 && <p>Aún no te compartieron archivos</p>}
          {sharedFiles && sharedFiles.map((file: any) => <FileCard key={file.id} {...file} />)}
        </div>
      </div>
    </main>
  );
}
