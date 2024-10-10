import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // Path to the component file
    const filePath = path.join(
      process.cwd(),
      "src",
      "components",
      "MyComponent.vue"
    );

    // Overwrite the file with the new code
    fs.writeFileSync(filePath, code, "utf-8");

    return NextResponse.json(
      { message: "File updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update the file" },
      { status: 500 }
    );
  }
}
