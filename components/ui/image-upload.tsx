"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { Upload, X, Star, StarOff, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: string[]
  defaultImage?: string
  onImagesChange: (images: string[], defaultImage?: string) => void
  maxImages?: number
}

export function ImageUpload({ images, defaultImage, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `business-images/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("images").upload(filePath, file)

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath)

      // Add to images array
      const newImages = [...images, publicUrl]
      const newDefaultImage = images.length === 0 ? publicUrl : defaultImage

      onImagesChange(newImages, newDefaultImage)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") && images.length < maxImages) {
        uploadImage(file)
      }
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (imageUrl: string) => {
    const newImages = images.filter((img) => img !== imageUrl)
    let newDefaultImage = defaultImage

    // If removing the default image, set first remaining image as default
    if (imageUrl === defaultImage && newImages.length > 0) {
      newDefaultImage = newImages[0]
    } else if (newImages.length === 0) {
      newDefaultImage = undefined
    }

    onImagesChange(newImages, newDefaultImage)
  }

  const setAsDefault = (imageUrl: string) => {
    onImagesChange(images, imageUrl)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-sans font-medium">Business Images</Label>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Add Images"}
        </Button>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={imageUrl} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Business image ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Default Image Badge */}
                  {imageUrl === defaultImage && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Default
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={imageUrl === defaultImage ? "default" : "secondary"}
                      onClick={() => setAsDefault(imageUrl)}
                      className="h-8 w-8 p-0"
                    >
                      {imageUrl === defaultImage ? (
                        <Star className="h-3 w-3 fill-current" />
                      ) : (
                        <StarOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(imageUrl)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              No images uploaded yet. Add some photos to showcase your business!
            </p>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-gray-500">
        Upload up to {maxImages} images. The first image will be set as default, or click the star to choose a different
        default image.
      </p>
    </div>
  )
}
