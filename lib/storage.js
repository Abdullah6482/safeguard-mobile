import { supabase } from './supabase'
import * as FileSystem from 'expo-file-system/legacy'

/**
 * Upload a photo to Supabase Storage
 * @param {string} fileUri - Local URI of the photo
 * @param {string} userId - User ID for file naming
 * @returns {Promise<{url: string, error: any}>}
 */
export const uploadPhoto = async (fileUri, userId) => {
    try {
        console.log('Starting photo upload for:', fileUri)
        
        // Generate unique filename
        const timestamp = Date.now()
        let ext = 'jpg' // default extension
        
        // Extract extension from file URI
        if (fileUri.includes('.')) {
            const parts = fileUri.split('.')
            const lastPart = parts[parts.length - 1]
            // Remove any query parameters or data URI parts
            ext = lastPart.split('?')[0].split(',')[0] || 'jpg'
        }
        
        const fileName = `${userId}-${timestamp}.${ext}`
        
        console.log('Generated filename:', fileName)
        
        // Read file as base64
        let base64;
        
        // Handle different URI formats
        if (fileUri.startsWith('data:')) {
            // Data URI format - extract base64 part
            const base64Match = fileUri.match(/base64,(.*)/);
            if (base64Match) {
                base64 = base64Match[1];
            } else {
                throw new Error('Invalid data URI format');
            }
        } else {
    // File URI format - read from file system
    base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
    });
}
        
        if (!base64) {
            throw new Error('Failed to read file as base64');
        }
        
        console.log('File read successfully, base64 length:', base64.length);
        
        // Convert base64 to ArrayBuffer
        const arrayBuffer = base64ToArrayBuffer(base64);
        console.log('ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('incident-photos')
            .upload(fileName, arrayBuffer, {
                contentType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
                cacheControl: '3600',
                upsert: false,
            })
        
        if (error) {
            console.error('Upload error:', error)
            return { url: null, error }
        }
        
        console.log('Upload successful:', data)
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('incident-photos')
            .getPublicUrl(fileName)
        
        console.log('Public URL:', publicUrl)
        
        return { url: publicUrl, error: null }
        
    } catch (error) {
        console.error('Photo upload exception:', error)
        return { url: null, error }
    }
}

/**
 * Convert base64 string to ArrayBuffer
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
function base64ToArrayBuffer(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    const len = base64.length
    let bufferLength = len * 0.75
    let p = 0, encoded1, encoded2, encoded3, encoded4

    if (base64[len - 1] === '=') {
        bufferLength--
        if (base64[len - 2] === '=') bufferLength--
    }

    const arrayBuffer = new ArrayBuffer(bufferLength)
    const bytes = new Uint8Array(arrayBuffer)

    for (let i = 0; i < len; i += 4) {
        encoded1 = chars.indexOf(base64[i])
        encoded2 = chars.indexOf(base64[i + 1])
        encoded3 = chars.indexOf(base64[i + 2])
        encoded4 = chars.indexOf(base64[i + 3])

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4)
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2)
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63)
    }

    return arrayBuffer
}

/**
 * Delete a photo from Supabase Storage
 * @param {string} url - Public URL of the photo
 * @returns {Promise<{error: any}>}
 */
export const deletePhoto = async (url) => {
    try {
        // Extract filename from URL
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        const { error } = await supabase.storage
            .from('incident-photos')
            .remove([fileName])
        
        return { error }
    } catch (error) {
        console.error('Photo deletion exception:', error)
        return { error }
    }
}

/**
 * Test if the storage bucket is accessible
 * @returns {Promise<{accessible: boolean, error: any}>}
 */
export const testStorageAccess = async () => {
    try {
        const { data, error } = await supabase.storage
            .from('incident-photos')
            .list()
        
        return { 
            accessible: !error, 
            error,
            buckets: data 
        }
    } catch (error) {
        return { accessible: false, error }
    }
}
