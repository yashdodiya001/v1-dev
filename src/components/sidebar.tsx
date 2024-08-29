"use client"
import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button } from "./ui";

export default function Sidebar({ subPrompts, setVersion, subid }: any) {
	const { isOpen, toggle } = useSidebar();
	const [status, setStatus] = useState(false);
	
	const handleToggle = () => {
		setStatus(true);
		toggle();
		setTimeout(() => setStatus(false), 500);
	};

	if (!subPrompts) return <div></div>
	
	return (
		<nav
			className={cn(
				`relative hidden h-screen border-r pt-10 md:block`,
				status && "duration-200",
				isOpen ? "w-44" : "w-[50px]"
			)}
		>
			<ArrowLeft
				size={22}
				className={cn(
					"absolute -right-3 top-0 cursor-pointer rounded-full border bg-background text-3xl text-foreground transition-transform duration-500",
					!isOpen && "rotate-180"
				)}
				onClick={handleToggle}
			/>
			<div className="px-3 py-2 flex justify-center h-[80vh] overflow-y-auto">
				<div className="flex flex-col space-y-4">
					{
						subPrompts.map((subPrompt: any, i: number) => (
							<Button 
								size={"icon"} 
								key={subPrompt[0].id} 
								onClick={() => setVersion(subPrompt[0].SUBId)} 
								variant={subid?.endsWith("0")?"outline":subid===subPrompt[0].SUBId?"outline":"secondary"} 
								className="text-xs font-bold text-gray-500"
								title={`Subid: ${subPrompt[0].id}`}
							>
								{
									i===0?(
										"V1"
									):(
										subPrompt[0].SUBId
									)
								}
							</Button>
						))
					}
					{
						subid === "1" && (
							<Button 
								size={"icon"} 
								onClick={() => setVersion("0")} 
								variant={"outline"} 
								className="text-xs font-bold text-gray-500"
							>
								<LoaderCircle className="h-4 w-4 ml-1 animate-spin" />
							</Button>
						)
					}
				</div>
			</div>
		</nav>
	);
}
