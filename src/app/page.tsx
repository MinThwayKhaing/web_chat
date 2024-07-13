"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import QueryProvider from "./providers/QueryProvider";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("cupidcash_token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (


    <QueryProvider>
    <div className="flex justify-center items-center h-screen">
      <h1 style={{ fontSize: "4rem" }}>Welcome from Web Chat</h1>
    </div>
    </QueryProvider>
 

  );
}
