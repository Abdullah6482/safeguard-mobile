import { supabase } from './supabase'

/**
 * Direct bucket access test - bypasses listBuckets()
 */
export const testDirectBucketAccess = async () => {
    try {
        console.log('Testing direct bucket access...')
        
        // Test 1: Try to list files directly in the bucket
        const { data: files, error: listError } = await supabase.storage
            .from('incident-photos')
            .list()
            
        if (listError) {
            console.error('Direct list error:', listError)
            return { success: false, error: listError.message }
        }
        
        console.log('✅ Direct bucket access successful:', files.length, 'files')
        
        // Test 2: Try to upload a tiny test image
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        const binaryString = atob(testImageBase64)
        const testFile = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            testFile[i] = binaryString.charCodeAt(i)
        }
        const testFileName = `direct-test-${Date.now()}.png`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('incident-photos')
            .upload(testFileName, testFile, {
                contentType: 'image/png',
                upsert: true
            })
            
        if (uploadError) {
            console.error('Direct upload error:', uploadError)
            return { success: false, error: uploadError.message }
        }
        
        console.log('✅ Direct upload successful:', uploadData.path)
        
        // Test 3: Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('incident-photos')
            .getPublicUrl(testFileName)
            
        console.log('✅ Public URL generated:', publicUrl)
        
        // Test 4: Clean up
        const { error: deleteError } = await supabase.storage
            .from('incident-photos')
            .remove([testFileName])
            
        if (deleteError) {
            console.error('Cleanup error:', deleteError)
        } else {
            console.log('✅ Cleanup successful')
        }
        
        return { success: true, error: null }
        
    } catch (error) {
        console.error('Direct access exception:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Test with a real image (base64)
 */
export const testRealImageUpload = async (userId) => {
    try {
        console.log('Testing real image upload...')
        
        // Small 1x1 PNG in base64
        const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Image)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        
        const fileName = `test-${userId}-${Date.now()}.png`
        
        const { data, error } = await supabase.storage
            .from('incident-photos')
            .upload(fileName, bytes, {
                contentType: 'image/png',
                upsert: true
            })
            
        if (error) {
            console.error('Real image upload error:', error)
            return { success: false, error: error.message }
        }
        
        console.log('✅ Real image upload successful:', data.path)
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('incident-photos')
            .getPublicUrl(fileName)
            
        console.log('✅ Public URL:', publicUrl)
        
        return { success: true, url: publicUrl, error: null }
        
    } catch (error) {
        console.error('Real image test exception:', error)
        return { success: false, error: error.message }
    }
}
