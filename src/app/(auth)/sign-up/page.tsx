'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { addUser, isEmailTaken } from '@/utils/indexedDb';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useCurrentUserContext } from '@/context/UserContext';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().refine(data => data.trim() !== '', {
    message: "Este campo es requerido",
  }),
  lastName: z.string().refine(data => data.trim() !== '', {
    message: "Este campo es requerido",
  }),
  email: z.string().email(),
  password: z.string().refine(data => data.trim() !== '', {
    message: "Este campo es requerido",
  })
});

export default function SignIn() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: ""
    },
  });

  async function onSignUp(values: z.infer<typeof formSchema>) {
    const newUser = { ...values };
    try {
      const emailTaken = await isEmailTaken(newUser.email);

      if (emailTaken) {
        console.log('El correo electrónico ya está en uso');
        return;
      }
      const userId = await addUser(newUser);
      console.log('Usuario registrado con éxito. ID:', userId, { newUser });
      router.push("/login");

    } catch (error) {
      console.error('Error al registrar el usuario:', error);
    }
  }

  return (
    <div className='flex flex-col gap-4 '>
      <section className="relative flex flex-wrap lg:justify-end lg:h-screen lg:items-center">
        <div className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:w-1/2 lg:px-8 lg:py-24 max-w-[720px]">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-4 sm:text-3xl">Registrarse</h1>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSignUp)} className="space-y-4 ">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Perez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='w-full ml-auto mr-0 block' type="submit">Continuar</Button>
            </form>
          </Form>
        </div>

        <div className="relative h-64 w-full sm:h-96 lg:h-full lg:w-1/2">
          <Image
            fill
            alt="Welcome"
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}
