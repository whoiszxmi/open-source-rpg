import React, { useEffect } from "react";
import { useRouter } from "next/router";
import MasterSidebar from "./MasterSidebar";
import MasterTopbar from "./MasterTopbar";

export default function LayoutMaster({ title, children }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (router.asPath?.startsWith("/dashboard")) {
      localStorage.setItem("rpg:master:lastTab", router.asPath);
    }
  }, [router.asPath]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <MasterSidebar />

        <div className="flex flex-1 flex-col">
          <MasterTopbar title={title} />

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
