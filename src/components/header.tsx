"use client";
import { Button } from "./ui";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useBugReportModal } from "@/hooks/useBugReportModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserButton from "./user-button";
import { BugReportModal } from "./bug-report-modal";
import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { toggle: toggleAuth } = useAuthModal();
  const { toggle: toggleBugReport } = useBugReportModal();
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <div className="w-full bg-white flex justify-between items-center p-4">
        <h1 className="text-xl font-bold ml-4">v1.dev</h1>
        <div className="flex space-x-2 items-center">
          {status === "authenticated" && (
            <Button onClick={toggleBugReport} variant="secondary">
              Bug Report / Feature Request
            </Button>
          )}
          {status === "authenticated" && (
            <Button
              onClick={() => window.open("https://dub.sh/windai-discord")}
              className="bg-[#6570fd]"
            >
              Discord
            </Button>
          )}
          {status === "unauthenticated" && (
            <Button onClick={toggleAuth} variant="default">
              Sign In
            </Button>
          )}
          {status === "authenticated" && session.user && (
            <UserButton user={session.user} />
          )}
        </div>
      </div>
      <BugReportModal />
    </>
  );
};

export default Header;
