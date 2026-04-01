import { supabase } from './supabase'

/**
 * Simple test to verify Supabase storage connection
 */
export const testStorageConnection = async () => {
    try {
        console.log('Testing Supabase storage connection...')
        
        // Test 1: Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
        if (bucketError) {
            console.error('Bucket list error:', bucketError)
            return { success: false, error: bucketError.message }
        }
        
        console.log('Available buckets:', buckets.map(b => b.name))
        const incidentBucket = buckets.find(b => b.name === 'incident-photos')
        if (!incidentBucket) {
            console.error('incident-photos bucket not found!')
            return { success: false, error: 'Bucket not found' }
        }
        
        console.log('✅ incident-photos bucket found')
        
        // Test 2: Try to list objects in bucket
        const { data: objects, error: listError } = await supabase.storage
            .from('incident-photos')
            .list()
            
        if (listError) {
            console.error('List objects error:', listError)
            return { success: false, error: listError.message }
        }
        
        console.log('✅ Can list objects:', objects.length, 'items')
        
        // Test 3: Try to upload a tiny test file
        const testFile = new Uint8Array([72, 101, 108, 108, 111]) // "Hello" in bytes
        const testFileName = `test-${Date.now()}.txt`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('incident-photos')
            .upload(testFileName, testFile, {
                contentType: 'text/plain',
                upsert: true
            })
            
        if (uploadError) {
            console.error('Upload test error:', uploadError)
            return { success: false, error: uploadError.message }
        }
        
        console.log('✅ Upload test successful:', uploadData)
        
        // Test 4: Clean up test file
        const { error: deleteError } = await supabase.storage
            .from('incident-photos')
            .remove([testFileName])
            
        if (deleteError) {
            console.error('Delete test error:', deleteError)
        } else {
            console.log('✅ Cleanup successful')
        }
        
        return { success: true, error: null }
        
    } catch (error) {
        console.error('Storage test exception:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Check Supabase client configuration
 */
export const checkSupabaseConfig = () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Supabase URL:', url ? '✅ Set' : '❌ Missing')
    console.log('Supabase Key:', key ? '✅ Set' : '❌ Missing')
    
    if (!url || !key) {
        return { valid: false, missing: !url ? 'URL' : 'Key' }
    }
    
    // Basic URL validation
    try {
        new URL(url)
        return { valid: true, url }
    } catch {
        return { valid: false, missing: 'Invalid URL format' }
    }
}
