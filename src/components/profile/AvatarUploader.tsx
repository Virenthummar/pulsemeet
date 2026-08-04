import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, Image as ImageIcon, X, UploadCloud, Check } from 'lucide-react';
import getCroppedImg from '../../utils/imageUtils';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface AvatarUploaderProps {
  onSuccess: (url: string) => void;
  onCancel: () => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useApp();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      setError(null);

      // 1. Crop and compress locally
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error('Failed to process image');

      // Check if Supabase keys exist (Mock/Fail gracefully if missing)
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Fallback for demo purposes if no Supabase configured
        console.warn('No Supabase credentials provided, falling back to base64 demo upload');
        
        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob); 
        reader.onloadend = () => {
          onSuccess(reader.result as string);
        }
        return;
      }

      // 2. Upload to Supabase Storage
      const fileName = `${currentUser.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 3. Get Public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        onSuccess(urlData.publicUrl);
      } else {
        throw new Error('Failed to retrieve public URL');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading photo');
      setIsUploading(false);
    }
  };

  if (imageSrc) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md animate-fade-in">
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <button onClick={() => setImageSrc(null)} disabled={isUploading} className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
          <h3 className="font-bold text-white text-lg">Crop Photo</h3>
          <button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-bold transition-all disabled:opacity-50"
          >
            {isUploading ? 'Saving...' : (
              <>
                <Check className="h-4 w-4" /> Save
              </>
            )}
          </button>
        </div>
        
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center gap-4">
          <span className="text-slate-400 text-xs">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border-4 border-indigo-500/10">
            <UploadCloud className="h-8 w-8 text-indigo-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Update Photo</h3>
            <p className="text-sm text-slate-400">Choose a new profile picture</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Take Photo - Opens Camera on mobile */}
            <label className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors border border-slate-700/50 cursor-pointer">
              <Camera className="h-5 w-5 text-indigo-400" />
              Take Photo
              <input 
                type="file" 
                accept="image/*" 
                capture="user"
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>

            {/* Choose from Gallery - Opens file picker */}
            <label className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors border border-slate-700/50 cursor-pointer">
              <ImageIcon className="h-5 w-5 text-pink-400" />
              Choose from Gallery
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
