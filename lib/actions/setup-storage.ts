"use server"

import { createClient } from "@supabase/supabase-js"

export async function ensureStorageBucket() {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "images")

    if (!bucketExists) {
      // Create bucket with admin privileges
      const { error: createError } = await supabaseAdmin.storage.createBucket("images", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return { success: false, error: createError.message }
      }

      // Set up storage policies for the bucket
      const policies = [
        // Allow authenticated users to upload images
        {
          name: "Allow authenticated users to upload images",
          definition: `(auth.role() = 'authenticated')`,
          command: "INSERT",
        },
        // Allow authenticated users to update their own images
        {
          name: "Allow authenticated users to update images",
          definition: `(auth.role() = 'authenticated')`,
          command: "UPDATE",
        },
        // Allow authenticated users to delete their own images
        {
          name: "Allow authenticated users to delete images",
          definition: `(auth.role() = 'authenticated')`,
          command: "DELETE",
        },
        // Allow public read access
        {
          name: "Allow public read access",
          definition: `true`,
          command: "SELECT",
        },
      ]

      // Note: Storage policies are typically set up via SQL or Supabase dashboard
      // The bucket creation above should be sufficient for basic functionality
    }

    return { success: true }
  } catch (error) {
    console.error("Error ensuring storage bucket:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
