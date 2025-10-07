"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { Upload, X, Star, StarOff, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  images: string[]
  defaultImage?: string
  onImagesChange: (images: string[], defaultImage?: string) => void
  maxImages?: number
}

export function ImageUpload({ images, defaultImage, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`

    try {
      console.log("[v0] Starting upload for file:", file.name, "Size:", file.size, "Type:", file.type)

      setUploadingFiles((prev) => new Set([...prev, fileId]))
      setUploading(true)
      setUploadErrors([])

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`)
      }

      if (!file.type.startsWith("image/")) {
        throw new Error(`File ${file.name} is not a valid image.`)
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      console.log("[v0] Uploading to path:", filePath)

      const { data, error } = await supabase.storage.from("business-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("[v0] Upload error:", error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log("[v0] Upload successful:", data)

      const {
        data: { publicUrl },
      } = supabase.storage.from("business-images").getPublicUrl(filePath)

      console.log("[v0] Public URL generated:", publicUrl)

      const newImages = [...images, publicUrl]
      const newDefaultImage = images.length === 0 ? publicUrl : defaultImage

      onImagesChange(newImages, newDefaultImage)
      console.log("[v0] Image successfully added to gallery")
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      setUploadErrors((prev) => [...prev, `${file.name}: ${errorMessage}`])
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(fileId)
        return newSet
      })

      setUploadingFiles((prev) => {
        if (prev.size === 0) {
          setUploading(false)
        }
        return prev
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    console.log("[v0] Files selected:", files.length)
    setUploadErrors([])

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/") && images.length + index < maxImages) {
        setTimeout(() => uploadImage(file), index * 100)
      } else if (!file.type.startsWith("image/")) {
        setUploadErrors((prev) => [...prev, `${file.name}: Not a valid image file`])
      } else if (images.length + index >= maxImages) {
        setUploadErrors((prev) => [...prev, `${file.name}: Maximum ${maxImages} images allowed`])
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (imageUrl: string) => {
    const newImages = images.filter((img) => img !== imageUrl)
    let newDefaultImage = defaultImage

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
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading... ({uploadingFiles.size} files)
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Add Images
            </>
          )}
        </Button>
      </div>

      {uploadErrors.length > 0 && (
        <div className="space-y-1">
          {uploadErrors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading {uploadingFiles.size} file(s)... Please wait.
          </div>
        </div>
      )}

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

                  {imageUrl === defaultImage && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Default
                    </div>
                  )}

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
