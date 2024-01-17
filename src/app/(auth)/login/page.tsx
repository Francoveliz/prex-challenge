'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { loginUser } from '@/utils/indexedDb';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useCurrentUserContext } from '@/context/UserContext';
import Link from 'next/link';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().refine(data => data.trim() !== '', {
    message: "Este campo es requerido",
  })
});

export default function Login() {
  const router = useRouter();
  const { setStorageUser } = useCurrentUserContext();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    try {
      const user = await loginUser(email, password);

      if (!user) {
        setError("Usuario no encontrado o contraseña incorrecta");
        return;
      }

      setStorageUser(user);
      router.push("/");
    } catch (error) {
      setError("Ha ocurrido un error");
      console.error('Error al iniciar sesion:', error);
    }
  }

  return (
    <main className='container py-8 flex flex-col gap-4'>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Inicia sesión en tu cuenta
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="juan@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className='text-red-500'>{error}</p>
              <Button className='w-full mt-4' type="submit">Iniciar sesión</Button>
            </form>
          </Form>

          <p className="mt-10 text-center text-sm text-gray-500">
            ¿Todavia no tienes una cuenta?{` `}
            <Link href="/sign-up" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
