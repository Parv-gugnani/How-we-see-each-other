import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function GET() {
  try {
    const { files } = await utapi.listFiles();
    const images = files.map(file => {
      // Extract category from key (format: category_originalkey)
      const [category] = file.key.split('_');
      return {
        url: `https://uploadthing.com/f/${file.key}`,
        key: file.key,
        category
      };
    });
    
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
} 