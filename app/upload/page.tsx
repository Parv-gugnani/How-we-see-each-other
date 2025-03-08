"use client";

import { UploadButton } from "@uploadthing/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OurFileRouter } from "../api/uploadthing/core";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Upload Image</h1>
          <p className="mt-2 text-gray-600">Share your images with the world</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onUploadProgress={() => {
              toast.loading('Uploading image...', {
                id: 'upload-toast'
              });
            }}
            onClientUploadComplete={(res) => {
              toast.dismiss('upload-toast');
              if (res && res[0]) {
                toast.success('Image uploaded successfully!');
                console.log("File uploaded:", res[0]);
                router.push('/');
                router.refresh();
              }
            }}
            onUploadError={(error: Error) => {
              toast.dismiss('upload-toast');
              toast.error(`Upload failed: ${error.message}`);
            }}
            appearance={{
              button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
              allowedContent: "text-gray-600 text-sm mt-2"
            }}
          />
        </div>
      </div>
    </div>
  );
} 