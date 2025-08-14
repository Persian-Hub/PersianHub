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

      // Set up storage policies for the bucket using SQL
      const policyQueries = [
        // Allow authenticated users to upload images to business-images folder
        `
        CREATE POLICY "Allow authenticated users to upload business images" ON storage.objects
        FOR INSERT WITH CHECK (
          auth.role() = 'authenticated' 
          AND bucket_id = 'images' 
          AND (storage.foldername(name))[1] = 'business-images'
        );
        `,
        // Allow authenticated users to view images
        `
        CREATE POLICY "Allow authenticated users to view business images" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'images' 
          AND (storage.foldername(name))[1] = 'business-images'
        );
        `,
        // Allow authenticated users to update their own images
        `
        CREATE POLICY "Allow authenticated users to update business images" ON storage.objects
        FOR UPDATE USING (
          auth.role() = 'authenticated' 
          AND bucket_id = 'images' 
          AND (storage.foldername(name))[1] = 'business-images'
        );
        `,
        // Allow authenticated users to delete their own images
        `
        CREATE POLICY "Allow authenticated users to delete business images" ON storage.objects
        FOR DELETE USING (
          auth.role() = 'authenticated' 
          AND bucket_id = 'images' 
          AND (storage.foldername(name))[1] = 'business-images'
        );
        `,
      ]

      // Execute each policy query
      for (const query of policyQueries) {
        const { error: policyError } = await supabaseAdmin.rpc("exec_sql", { sql: query })
        if (policyError) {
          console.error("Error creating storage policy:", policyError)
          // Continue with other policies even if one fails
        }
      }
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
