import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useUserSubmissions
 *
 * Manages all data operations for the user photo submissions feature.
 *
 * RESPONSIBILITIES:
 * - Fetch pending/all submissions for the admin review queue
 * - Submit a new photo from the public YouModal form
 * - Approve a submission (move to gallery_images with admin-provided metadata)
 * - Reject a submission (delete from storage, update status + reason)
 * - Block an email address (insert into blocked_emails, silent on public side)
 * - Check if an email is blocked before allowing submission
 * - Clear reviewed submissions from default view (sets is_cleared: true)
 * - Retrieve cleared submissions by reviewed_at date range
 *
 * CUSTOMIZATION:
 * - SUBMISSIONS_BUCKET: Supabase Storage bucket name for raw submissions
 * - GALLERY_BUCKET: Supabase Storage bucket name for approved gallery images
 * - MAX_FILE_SIZE_MB: Client-side file size limit before compression
 */

const SUBMISSIONS_BUCKET = 'user-submissions';
const GALLERY_BUCKET = 'gallery';
const MAX_FILE_SIZE_MB = 20;

// ---------------------------------------------------------------------------
// Compression utility
// ---------------------------------------------------------------------------
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const MAX_DIMENSION = 1920;
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error('Compression failed'));
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
              type: 'image/webp',
            })
          );
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useUserSubmissions({ adminMode = true } = {}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_submissions')
        .select('*')
        .eq('is_cleared', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSubmissions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminMode) fetchSubmissions();
  }, [adminMode, fetchSubmissions]);

  const isEmailBlocked = useCallback(async (email) => {
    try {
      const { data, error: checkError } = await supabase
        .from('blocked_emails')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (checkError) throw checkError;
      return !!data;
    } catch {
      return false;
    }
  }, []);

  const submitPhoto = useCallback(
    async ({ file, email, name, date, location }) => {
      try {
        if (!file) throw new Error('No file provided');
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          throw new Error(`File must be under ${MAX_FILE_SIZE_MB}MB`);
        }

        const blocked = await isEmailBlocked(email);
        if (blocked) return { success: true };

        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const storagePath = `submissions/${fileName}`;

        const uploadResult = await supabase.storage
          .from(SUBMISSIONS_BUCKET)
          .upload(storagePath, compressed, { contentType: 'image/webp', upsert: false });

        if (uploadResult.error) throw uploadResult.error;

        const { data: urlData } = supabase.storage
          .from(SUBMISSIONS_BUCKET)
          .getPublicUrl(storagePath);

        const { error: insertError } = await supabase
          .from('user_submissions')
          .insert({
            image_url: urlData.publicUrl,
            storage_path: storagePath,
            email: email.toLowerCase().trim(),
            submitted_by: name || null,
            date: date || null,
            location: location || null,
            status: 'pending',
          });

        if (insertError) throw insertError;
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [isEmailBlocked]
  );

  // -------------------------------------------------------------------------
  // Approve a submission
  // metadata: { alt, date, location, display_order, is_visible }
  // All fields are provided by the admin via the approval edit form.
  // -------------------------------------------------------------------------
  const approveSubmission = useCallback(
    async (submission, metadata = {}) => {
      setLoading(true);
      try {
        const galleryPath = `approved/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

        // Download from submissions bucket
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(SUBMISSIONS_BUCKET)
          .download(submission.storage_path);

        if (downloadError) throw downloadError;

        // Re-upload to gallery bucket
        const { error: uploadError } = await supabase.storage
          .from(GALLERY_BUCKET)
          .upload(galleryPath, fileData, { contentType: 'image/webp', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(GALLERY_BUCKET)
          .getPublicUrl(galleryPath);

        // Use display_order from metadata if provided, otherwise slot before existing images
        let displayOrder = metadata.display_order;
        if (displayOrder === undefined || displayOrder === null || displayOrder === '') {
          const { data: orderData } = await supabase
            .from('gallery_images')
            .select('display_order')
            .order('display_order', { ascending: true })
            .limit(1)
            .maybeSingle();
          displayOrder = orderData ? orderData.display_order - 1 : 0;
        }

        // Insert into gallery_images with admin-provided metadata
        const { error: galleryError } = await supabase
          .from('gallery_images')
          .insert({
            url: urlData.publicUrl,
            storage_path: galleryPath,
            alt: metadata.alt || submission.submitted_by || 'Fan photo',
            date: metadata.date || null,
            location: metadata.location || null,
            display_order: Number(displayOrder),
            is_visible: metadata.is_visible ?? true,
          });

        if (galleryError) throw galleryError;

        // Update submission status and gallery URL
        const { error: updateError } = await supabase
          .from('user_submissions')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            image_url: urlData.publicUrl,
          })
          .eq('id', submission.id);

        if (updateError) throw updateError;

        // Delete original from submissions bucket
        await supabase.storage
          .from(SUBMISSIONS_BUCKET)
          .remove([submission.storage_path]);

        await fetchSubmissions();
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchSubmissions]
  );

  const rejectSubmission = useCallback(
    async (submission, rejectionReason = null) => {
      setLoading(true);
      try {
        const { error: deleteError } = await supabase.storage
          .from(SUBMISSIONS_BUCKET)
          .remove([submission.storage_path]);

        if (deleteError) throw deleteError;

        const { error: updateError } = await supabase
          .from('user_submissions')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
          })
          .eq('id', submission.id);

        if (updateError) throw updateError;

        await fetchSubmissions();
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchSubmissions]
  );

  const blockEmail = useCallback(
    async ({ email, reason, submissionId }) => {
      setLoading(true);
      try {
        const { error: blockError } = await supabase
          .from('blocked_emails')
          .upsert(
            { email: email.toLowerCase().trim(), reason: reason || null },
            { onConflict: 'email' }
          );

        if (blockError) throw blockError;

        if (submissionId) {
          const submission = submissions.find((s) => s.id === submissionId);
          if (submission) await rejectSubmission(submission, reason || null);
        }

        await fetchSubmissions();
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [submissions, fetchSubmissions, rejectSubmission]
  );

  const clearSubmissions = useCallback(
    async (ids) => {
      setLoading(true);
      try {
        const { error: clearError } = await supabase
          .from('user_submissions')
          .update({ is_cleared: true })
          .in('id', ids)
          .neq('status', 'pending');

        if (clearError) throw clearError;

        await fetchSubmissions();
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchSubmissions]
  );

  const retrieveCleared = useCallback(async ({ from, to }) => {
    try {
      const { data, error: retrieveError } = await supabase
        .from('user_submissions')
        .select('*')
        .eq('is_cleared', true)
        .gte('reviewed_at', new Date(from).toISOString())
        .lte('reviewed_at', new Date(to + 'T23:59:59').toISOString())
        .order('reviewed_at', { ascending: false });

      if (retrieveError) throw retrieveError;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, message: err.message, data: [] };
    }
  }, []);

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    submitPhoto,
    approveSubmission,
    rejectSubmission,
    blockEmail,
    clearSubmissions,
    retrieveCleared,
  };
}
