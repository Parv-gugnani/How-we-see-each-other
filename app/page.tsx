"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "./api/uploadthing/core";

interface ImageData {
  url: string;
  key: string;
  category: string;
}

const categories = [
  { id: 0, name: "Animal", description: "Your favorite animal" },
  { id: 1, name: "Place", description: "A special place" },
  { id: 2, name: "Plant", description: "A beautiful plant" },
  { id: 3, name: "Character", description: "Your favorite character" },
  { id: 4, name: "Season", description: "Your favorite season" },
  { id: 5, name: "Hobby", description: "What you love doing" },
  { id: 6, name: "Color", description: "Your favorite color" },
  { id: 7, name: "Drink", description: "Your favorite drink" },
  { id: 8, name: "Food", description: "Your favorite food" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<Record<string, ImageData>>({});
  const [showCollage, setShowCollage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        // Convert array to object with category as key
        const imageMap = data.reduce((acc: Record<string, ImageData>, img: ImageData) => {
          // Find the first empty category slot
          const emptyCategory = categories.find(cat => !acc[cat.name]);
          if (emptyCategory) {
            acc[emptyCategory.name] = { ...img, category: emptyCategory.name };
          }
          return acc;
        }, {});
        setImages(imageMap);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      }
    };

    fetchImages();
  }, []);

  // Check if all categories have images
  const allImagesUploaded = categories.every(category => images[category.name]);

  useEffect(() => {
    if (allImagesUploaded) {
      setShowCollage(true);
    }
  }, [allImagesUploaded]);

  const handleDelete = async (imageKey: string, category: string) => {
    try {
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: imageKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setImages(prev => {
        const newImages = { ...prev };
        delete newImages[category];
        return newImages;
      });
      setShowCollage(false);
      toast.success("Image deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete image");
      console.error("Error deleting image:", error);
    }
  };

  const downloadCollage = async () => {
    if (!allImagesUploaded) return;
    setIsDownloading(true);

    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size (3x3 grid with some padding)
      const imageSize = 300; // Size of each image
      const padding = 20; // Padding between images
      const textHeight = 40; // Height for text
      canvas.width = imageSize * 3 + padding * 4; // 3 columns with padding
      canvas.height = (imageSize * 3 + padding * 4) + textHeight; // 3 rows with padding + text height

      // Fill background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load all images first
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      // Draw text for each category
      ctx.fillStyle = 'black';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      
      // Draw images in grid
      await Promise.all(categories.map(async (category, index) => {
        const image = images[category.name];
        if (!image) return;

        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = padding + col * (imageSize + padding);
        const y = textHeight + padding + row * (imageSize + padding);

        // Draw category text
        ctx.fillText(
          category.name,
          x + imageSize / 2,
          y - padding / 2
        );

        try {
          const img = await loadImage(image.url);
          ctx.drawImage(img, x, y, imageSize, imageSize);
        } catch (error) {
          console.error(`Failed to load image for ${category.name}:`, error);
        }
      }));

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-collage.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');

      toast.success('Collage downloaded successfully!');
    } catch (error) {
      console.error('Error creating collage:', error);
      toast.error('Failed to create collage');
    } finally {
      setIsDownloading(false);
    }
  };

  if (showCollage) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-lg shadow-lg">
            {categories.map((category) => {
              const image = images[category.name];
              return (
                <div key={category.id} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`${category.name} image`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <p className="text-white text-2xl font-bold uppercase tracking-wider">{category.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setShowCollage(false)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back to Grid
            </button>
            <button
              onClick={downloadCollage}
              disabled={isDownloading}
              className={`px-4 py-2 bg-blue-600 rounded-lg text-white transition-colors ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isDownloading ? 'Creating Collage...' : 'Download Collage'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => {
            const image = images[category.name];
            return (
              <div key={category.id} className="aspect-square relative rounded-lg bg-white border border-gray-200 hover:border-blue-500 transition-colors shadow-sm">
                {image ? (
                  <div className="relative group w-full h-full">
                    <Image
                      src={image.url}
                      alt={`${category.name} image`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
                      <p className="text-white text-lg font-medium uppercase tracking-wide">{category.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(image.key, category.name)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <p className="text-gray-900 font-medium text-sm mb-1">{category.name}</p>
                    <p className="text-gray-500 text-xs mb-3 text-center">{category.description}</p>
                    <div className="relative">
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
                            const newImage = {
                              url: res[0].url,
                              key: res[0].key,
                              category: category.name
                            };
                            setImages(prev => ({
                              ...prev,
                              [category.name]: newImage
                            }));
                            toast.success('Image uploaded successfully!');
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.dismiss('upload-toast');
                          toast.error(`Upload failed: ${error.message}`);
                        }}
                        appearance={{
                          button: "w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors",
                          allowedContent: "hidden"
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {allImagesUploaded && !showCollage && (
          <button
            onClick={() => setShowCollage(true)}
            className="mt-6 mx-auto block px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            View Collage
          </button>
        )}
      </div>
    </div>
  );
}
