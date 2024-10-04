import { LogOut, Settings } from "lucide-react";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOutGithub } from "@/actions/auth/sign-out";

interface UserButtonProps {
  user: User;
}

export default function UserButton({ user }: UserButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutGithub();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="flex-none rounded-full">
          <Image
            src={user.imageUrl || ""}
            alt="User profile picture"
            width={50}
            height={50}
            className="aspect-square rounded-full bg-background object-cover"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 mr-2 bg-[#09090b] mt-2 bottom-3 border-gray-400">
        <DropdownMenuLabel className="text-[#D8D8D9]">
          @{user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="bg-[#09090b]">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="hover:cursor-pointer hover:bg-[#3f3f42] focus:bg-[#3f3f42]"
          >
            <LogOut className="mr-2 h-4 w-4 text-[#D8D8D9]" />
            <span className="text-[#D8D8D9]">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
