'use client';
import Link from "next/link";
import { Button } from "../ui/Button";
import { HomeIcon } from "../icons/HomeIcon";
import { UploadFileButton } from "../home/UploadFileButton";
import { useCurrentUserContext } from "@/context/UserContext";
import { usePathname, useRouter } from 'next/navigation';



export const Header = () => {
  const { storageUser, setStorageUser } = useCurrentUserContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    setStorageUser(null);
    router.push("/login");
  };

  if (pathname.includes("login") || pathname.includes("sign-up") || !storageUser) return <></>;

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 container">
      <Link className="mr-6" href="/">
        <HomeIcon className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Link>

      <UploadFileButton />
      <div className="ml-auto flex gap-2">
        <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
      </div>
    </header>
  );
}



