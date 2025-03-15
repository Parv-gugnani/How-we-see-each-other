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
  const [selectedGender, setSelectedGender] = useState<'him' | 'her' | null>(null);
  const [showGenderSelection, setShowGenderSelection] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        const imageMap = data.reduce((acc: Record<string, ImageData>, img: ImageData) => {
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

  const allImagesUploaded = categories.every(category => images[category.name]);

  useEffect(() => {
    if (allImagesUploaded) {
      setShowCollage(true);
    }
  }, [allImagesUploaded]);

  const handleGenderSelect = (gender: 'him' | 'her') => {
    setSelectedGender(gender);
    setShowGenderSelection(false);
  };

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
    } catch (error) {
      toast.error("Failed to delete image");
      console.error("Error deleting image:", error);
    }
  };

  const downloadCollage = async () => {
    if (!allImagesUploaded || !selectedGender) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const imageSize = 300;
      const padding = 40;
      const textHeight = 60;
      const headerHeight = 80; // Height for the main heading
      canvas.width = imageSize * 3 + padding * 4;
      canvas.height = headerHeight + (imageSize + textHeight) * 3 + padding * 4;

      // Fill background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw main heading
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      ctx.fillText(`How You See ${selectedGender === 'him' ? 'Him' : 'Her'}`, canvas.width / 2, headerHeight / 2);

      // Function to draw text with shadow/outline for better visibility
      const drawText = (text: string, x: number, y: number) => {
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw outline
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.strokeText(text, x, y);

        // Draw main text
        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y);
      };

      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };
      
      await Promise.all(categories.map(async (category, index) => {
        const image = images[category.name];
        if (!image) return;

        const row = Math.floor(index / 3);
        const col = index % 3;
        
        const cellX = padding + col * (imageSize + padding);
        const cellY = headerHeight + padding + row * (imageSize + textHeight + padding);
        
        drawText(
          category.name.toUpperCase(),
          cellX + imageSize / 2,
          cellY + textHeight / 2
        );

        try {
          const img = await loadImage(image.url);
          ctx.drawImage(img, cellX, cellY + textHeight, imageSize, imageSize);
        } catch (error) {
          console.error(`Failed to load image for ${category.name}:`, error);
        }
      }));

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `how-you-see-${selectedGender}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Collage downloaded successfully!');
        toast.loading('Cleaning up uploaded images...', { id: 'cleanup' });

        // Delete all images after successful download
        try {
          await Promise.all(
            Object.values(images).map((image) =>
              fetch("/api/uploadthing/delete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: image.key }),
              }).then(response => {
                if (!response.ok) throw new Error(`Failed to delete image ${image.key}`);
              })
            )
          );

          // Clear images from state and return to gender selection
          setImages({});
          setShowCollage(false);
          setShowGenderSelection(true);
          toast.success('All uploaded images have been cleaned up for privacy!', { id: 'cleanup' });
        } catch (error) {
          console.error("Error cleaning up images:", error);
          toast.error('Failed to clean up some images. Please try again.', { id: 'cleanup' });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error creating collage:', error);
      toast.error('Failed to create collage');
    } finally {
      setIsDownloading(false);
    }
  };

  if (showGenderSelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px]">
          <Image
            src="/sample.png"
            alt="Background"
            fill
            className="object-contain blur-[2px] opacity-20"
            priority
          />
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 relative z-10">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">How You See...</h1>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleGenderSelect('him')}
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              How You See Him
            </button>
            <button
              onClick={() => handleGenderSelect('her')}
              className="w-full py-4 px-6 bg-pink-600 text-white rounded-xl font-semibold text-lg hover:bg-pink-700 transition-colors cursor-pointer"
            >
              How You See Her
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCollage) {
    return (
      <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
        <div className="max-w-4xl mx-auto px-1 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setShowGenderSelection(true);
                setShowCollage(false);
                setImages({});
              }}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Change Selection
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
              How You See {selectedGender === 'him' ? 'Him' : 'Her'}
            </h1>
            <div className="w-24"></div>
          </div>
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-white p-0.5 sm:p-2 rounded-lg shadow-lg">
            {categories.map((category) => {
              const image = images[category.name];
              return (
                <div key={category.id} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`${category.name} image`}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-0.5 sm:p-1">
                    <p className="text-white text-[10px] sm:text-sm md:text-base font-bold uppercase tracking-wider text-center">{category.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 sm:mt-4 flex justify-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowCollage(false)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              Back to Grid
            </button>
            <button
              onClick={downloadCollage}
              disabled={isDownloading}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 ${
                selectedGender === 'him' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'
              } rounded-lg text-white transition-colors text-xs sm:text-sm ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDownloading ? 'Creating...' : 'Download Collage'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
      <div className="w-full max-w-lg sm:max-w-2xl mx-auto px-1 sm:px-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setShowGenderSelection(true);
              setImages({});
            }}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Change Selection
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
            How You See {selectedGender === 'him' ? 'Him' : 'Her'}
          </h1>
          <div className="w-24"></div>
        </div>
        <div className="grid grid-cols-3 gap-0.5 sm:gap-3">
          {categories.map((category) => {
            const image = images[category.name];
            return (
              <div key={category.id} className="aspect-square relative rounded-sm sm:rounded-lg bg-white border border-gray-200 hover:border-blue-500 transition-colors shadow-sm">
                {image ? (
                  <div className="relative group w-full h-full">
                    <Image
                      src={image.url}
                      alt={`${category.name} image`}
                      fill
                      sizes="33vw"
                      className="object-cover rounded-sm sm:rounded-lg"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-0.5 sm:p-2 rounded-b-sm sm:rounded-b-lg">
                      <p className="text-white text-[8px] sm:text-sm font-medium uppercase tracking-wide text-center">{category.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(image.key, category.name)}
                      className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-red-500 text-white p-1 sm:p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1 sm:p-2">
                    <p className="text-gray-900 font-medium text-[8px] sm:text-xs mb-0.5">{category.name}</p>
                    <p className="text-gray-500 text-[6px] sm:text-[10px] mb-1 sm:mb-2 text-center">{category.description}</p>
                    <div className="relative">
                      <UploadButton<OurFileRouter, "imageUploader">
                        endpoint="imageUploader"
                        onUploadProgress={(progress) => {
                          toast.loading(`Uploading: ${progress}%`, {
                            id: `upload-${category.name}`,
                          });
                        }}
                        onClientUploadComplete={(res) => {
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
                            toast.success(`${category.name} image uploaded successfully!`, {
                              id: `upload-${category.name}`,
                            });
                          }
                        }}
                        onUploadError={(error) => {
                          toast.error(`Failed to upload ${category.name} image: ${error.message}`, {
                            id: `upload-${category.name}`,
                          });
                        }}
                        appearance={{
                          button: "w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors touch-manipulation active:bg-gray-300 shadow-sm opacity-0",
                          allowedContent: "hidden",
                          container: "!mt-0"
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2">
          <button
            onClick={() => setShowCollage(true)}
            disabled={!allImagesUploaded}
            className={`block px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-white text-sm sm:text-base font-medium transition-all ${
              selectedGender === 'him' 
                ? 'bg-blue-600 enabled:hover:bg-blue-700' 
                : 'bg-pink-600 enabled:hover:bg-pink-700'
            } ${
              !allImagesUploaded 
                ? 'opacity-50 cursor-not-allowed' 
                : 'transform enabled:hover:scale-105'
            }`}
          >
            {allImagesUploaded 
              ? 'View Collage' 
              : `Upload ${categories.length - Object.keys(images).length} More Image${
                  categories.length - Object.keys(images).length === 1 ? '' : 's'
                }`
            }
          </button>
          <p className="text-gray-500 text-xs sm:text-sm">
            {allImagesUploaded 
              ? 'All images uploaded! You can now view your collage.' 
              : `Upload all ${categories.length} images to create your collage`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
