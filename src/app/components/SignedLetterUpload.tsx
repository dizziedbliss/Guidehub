import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const MAX_FILE_SIZE_KB = 150;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const PDF_MIME_TYPE = 'application/pdf';

export default function SignedLetterUpload() {
  const navigate = useNavigate();
  const { teamId, teamLeader } = useAppContext();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamLeader || !teamId) {
      navigate('/', { replace: true });
    }
  }, [teamLeader, teamId, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const leaderUsn = useMemo(() => teamLeader?.usn?.toUpperCase() ?? '', [teamLeader]);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    setUploadMessage(null);

    if (!file) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const fileTypeIsValid = ACCEPTED_TYPES.includes(file.type);
    if (!fileTypeIsValid) {
      setUploadError('Please upload PDF, JPG, PNG, or WEBP image only.');
      event.target.value = '';
      return;
    }

    const maxBytes = MAX_FILE_SIZE_KB * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File size should be under ${MAX_FILE_SIZE_KB}KB.`);
      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!teamId || !selectedFile || !teamLeader) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const safeFileName = selectedFile.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.\-_]/g, '');

      const filePath = `${teamId}/${Date.now()}-${safeFileName}`;
      const uploadUrl = `https://${projectId}.supabase.co/storage/v1/object/signed-letters/${filePath}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          apikey: publicAnonKey,
          'x-upsert': 'true',
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || 'Upload failed. Please try again.');
      }

      setUploadMessage('Signed letter uploaded successfully. Your application is now complete.');
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Upload failed. Please verify your login and try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isPdfFile = selectedFile?.type === PDF_MIME_TYPE;

  if (!teamLeader || !teamId) {
    return null;
  }

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen pb-12">
      <div className="relative w-full max-w-[420px] mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/application')}
              className="w-[30px] h-[42px] cursor-pointer flex items-center justify-center mr-2"
            >
              <ChevronLeft size={30} className="text-[#3b3b3b]" strokeWidth={2.5} />
            </button>
            <p className="font-['Cormorant',serif] font-bold leading-[64px] text-[#3b3b3b] text-[57px]">
              IP
            </p>
          </div>
        </div>

        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-6">
          Upload signed form
        </p>

        <div className="mt-6 rounded-[15px] border border-[#3b3b3b] bg-white p-5">
          <p className="font-['Inter',sans-serif] text-[13px] leading-[20px] text-[#171717]">
            <span className="font-semibold">Important:</span> Application is done only after uploading the signed form. Login with team leader USN (<span className="font-semibold">{leaderUsn}</span>) and upload a clear signed file (image or PDF).
          </p>
          <p className="font-['Inter',sans-serif] text-[12px] text-[#999999] mt-3">
            Team ID: {teamId}
          </p>
        </div>

        <div className="mt-6 rounded-[15px] border border-[#3b3b3b] bg-white p-5">
          <label className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717] block mb-3">
            Choose signed letter file
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf,.pdf"
            onChange={handleFileSelection}
            className="block w-full text-[12px] font-['Inter',sans-serif] text-[#171717] file:mr-3 file:rounded-[8px] file:border-0 file:bg-black file:px-3 file:py-2 file:text-[#e9e9e9] file:font-semibold"
          />
          <p className="font-['Inter',sans-serif] text-[11px] text-[#999999] mt-2">
            Accepted: PDF, JPG, PNG, WEBP • Max size: {MAX_FILE_SIZE_KB}KB
          </p>

          {previewUrl && (
            <div className="mt-4 rounded-[12px] border border-[#e0e0e0] p-3">
              <p className="font-['Inter',sans-serif] text-[12px] text-[#171717] mb-2 font-semibold">
                {isPdfFile ? 'Selected PDF' : 'Preview'}
              </p>
              {isPdfFile ? (
                <p className="font-['Inter',sans-serif] text-[12px] text-[#171717] break-all">
                  {selectedFile?.name}
                </p>
              ) : (
                <img
                  src={previewUrl}
                  alt="Signed letter preview"
                  className="w-full rounded-[10px] object-cover max-h-[360px]"
                />
              )}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="mt-5 w-full h-[38px] bg-black rounded-[10px] flex items-center justify-center font-['Inter',sans-serif] font-semibold text-[#e9e9e9] text-[13px] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Signed Letter'}
          </button>
        </div>

        {uploadMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-[10px]">
            <p className="text-green-700 text-[13px] font-['Inter',sans-serif]">{uploadMessage}</p>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-red-600 text-[13px] font-['Inter',sans-serif]">{uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
