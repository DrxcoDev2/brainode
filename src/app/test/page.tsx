// pages/test.tsx
import { notFound } from "next/navigation";
import globalNotFound from "../global-not-found";
import { Button } from "@/components/ui/button";
import Link  from "next/link";

export default async function Test() {
  const res = await fetch("http://localhost:2000/users", { cache: "no-store" });
  const users = await res.json();

  // Si hay más de 1 usuario, mostramos notFound
  let found = false;
  if (users.length > 1) {
    globalNotFound();
    found = true;
  } else {
    found = false;
  }

  return (
    found ? (
      <div>
        <h1>Usuarios</h1>
        <ul>
          {users.map((u: any) => (
            <li key={u.id}>
            {u.name} - {u.email} - {u.password}
          </li>
        ))}
      </ul>
    </div>
  ) : (
              <div className="flex items-center justify-center h-screen">
                  <div className="">
                      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                      <p className="text-lg">This page does not exist.</p>
                      <Button className="mt-4">
                        <Link href="/">Go back to home</Link></Button>
                  </div>

              </div>
  )
)
}
