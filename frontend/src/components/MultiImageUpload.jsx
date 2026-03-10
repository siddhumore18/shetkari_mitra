import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { mediaAPI } from '../services/api';

const MultiImageUpload = ({ images, setImages, label = "Upload Images" }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const newUrls = [...images];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                // Using the existing mediaAPI.uploadMedia will return the media object with .url
                const response = await mediaAPI.uploadMedia(file);
                if (response.data?.url) {
                    newUrls.push(response.data.url);
                }
            }
            setImages(newUrls);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Some images failed to upload');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        const nextImages = [...images];
        nextImages.splice(index, 1);
        setImages(nextImages);
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>

            <div className="grid grid-cols-4 gap-3">
                {images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        <img src={url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {uploading ? (
                    <div className="aspect-square rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="animate-spin mb-1" size={20} />
                        <span className="text-[10px] font-bold">Uploading...</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center text-gray-500 group"
                    >
                        <Upload size={20} className="group-hover:text-emerald-500 transition-colors mb-1" />
                        <span className="text-[10px] font-bold uppercase">Add Photo</span>
                    </button>
                )}
            </div>

            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <p className="text-[10px] text-gray-500 italic">Select multiple images from your device. Recommended: 800x600px.</p>
        </div>
    );
};

export default MultiImageUpload;
