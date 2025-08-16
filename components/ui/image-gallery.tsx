"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: string[]
  businessName: string
}

export function ImageGallery({ images, businessName }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="aspect-[4/3] relative bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
            <p>No images available</p>
          </div>
        </div>
      </div>
    )
  }

  const mainImage = images[selectedImageIndex] || "/placeholder.svg?height=400&width=600"

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        {/* Main Image */}
        <div className="aspect-[4/3] relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={`${businessName} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />

          {/* Navigation arrows for main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="p-4 flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 relative rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedImageIndex
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${businessName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Main modal image */}
            <div className="relative w-full h-full max-w-3xl max-h-[80vh]">
              <Image
                src={mainImage || "/placeholder.svg"}
                alt={`${businessName} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Image counter in modal */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                {selectedImageIndex + 1} of {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
