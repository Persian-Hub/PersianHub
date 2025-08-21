"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface KeywordsInputProps {
  value: string[]
  onChange: (keywords: string[]) => void
  label?: string
  placeholder?: string
  maxKeywords?: number
  maxKeywordLength?: number
  className?: string
}

export function KeywordsInput({
  value = [],
  onChange,
  label = "Keywords",
  placeholder = "Type a keyword and press Enter",
  maxKeywords = 20,
  maxKeywordLength = 50,
  className = "",
}: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState("")

  const validateKeyword = (keyword: string): string | null => {
    if (!keyword.trim()) {
      return "Keyword cannot be empty"
    }

    if (keyword.length > maxKeywordLength) {
      return `Keyword must be ${maxKeywordLength} characters or less`
    }

    // Check for reasonable characters (letters, numbers, spaces, Persian characters, hyphens, underscores)
    if (!/^[\p{L}\p{N}\s\-_]+$/u.test(keyword)) {
      return "Keyword contains invalid characters"
    }

    if (value.includes(keyword.trim())) {
      return "Keyword already exists"
    }

    if (value.length >= maxKeywords) {
      return `Maximum ${maxKeywords} keywords allowed`
    }

    return null
  }

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim()
    const validationError = validateKeyword(trimmedKeyword)

    if (validationError) {
      setError(validationError)
      return
    }

    onChange([...value, trimmedKeyword])
    setInputValue("")
    setError("")
  }

  const removeKeyword = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
    setError("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputValue.trim()) {
        addKeyword(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last keyword if input is empty and backspace is pressed
      removeKeyword(value.length - 1)
    }
  }

  const handleAddClick = () => {
    if (inputValue.trim()) {
      addKeyword(inputValue)
    }
  }

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium text-gray-700 mb-2 block">{label}</Label>}

      {/* Keywords Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-md border">
          {value.map((keyword, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              <span className="text-sm">{keyword}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-blue-300 rounded-full"
                onClick={() => removeKeyword(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError("")
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          maxLength={maxKeywordLength}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddClick}
          disabled={!inputValue.trim() || value.length >= maxKeywords}
          className="px-4"
        >
          Add
        </Button>
      </div>

      {/* Counter and Error */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">
          {value.length}/{maxKeywords} keywords
          {inputValue && (
            <span className="ml-2">
              ({inputValue.length}/{maxKeywordLength} characters)
            </span>
          )}
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 mt-1">
        Press Enter or click Add to add keywords. Use Backspace to remove the last keyword.
      </div>
    </div>
  )
}
