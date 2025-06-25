'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Image, Info, X, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import styles from './PackagePhoto.module.css';
import { updateShipmentPhotos } from '@/lib/shipments';

interface PhotoItem {
  url: string;
  type: 'camera' | 'gallery';
  timestamp: number;
  file?: File;
}

export default function PackagePhoto({ handleNextStep, handlePreviousStep }: { handleNextStep: () => void, handlePreviousStep: () => void }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  const handleTakePhoto = async () => {
    if (photos.length >= 4) {
      alert('You can only upload up to 4 photos.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        const newPhoto: PhotoItem = {
          url: imageUrl,
          type: 'camera',
          timestamp: Date.now(),
        };
        setPhotos(prev => [...prev, newPhoto]);
      }

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      alert('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const handleChoosePhoto = () => {
    if (photos.length >= 4) {
      alert('You can only upload up to 4 photos.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: PhotoItem[] = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: 'gallery',
      timestamp: Date.now(),
      file
    }));

    setPhotos(prev => [...prev, ...newPhotos].slice(0, 4));
  };

  const handleRemovePhoto = (timestamp: number) => {
    setPhotos(prev => prev.filter(photo => photo.timestamp !== timestamp));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      alert('Please add at least one photo of your package');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      const packageInfo = localStorage.getItem('packageInfo');
      const packageInfoData = JSON.parse(packageInfo || '{}');
      
      formData.append('packageId', packageInfoData.id);

      photos.forEach((photo, index) => {
        if (photo.file) {
          formData.append('file', photo.file);
        } else {
          // Convert data URL to blob for camera photos
          fetch(photo.url)
            .then(res => res.blob())
            .then(blob => {
              formData.append('file', blob, `package-photo-${index + 1}.jpg`);
            });
        }
      });

      
      // Upload photos using the API
      const response = await updateShipmentPhotos(packageInfoData.id, formData, token);

      if (response.success) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data));
        localStorage.setItem('currentStep', '5')
        handleNextStep();
      } else {
        throw new Error(response.message || 'Failed to update package photos');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex flex-row items-center gap-4">
          <button 
            className={styles.backButton}
            onClick={handlePreviousStep}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1>Package Photos</h1>
        </div>
        {photos.length > 0 && (
          <button 
            className={styles.clearButton}
            onClick={() => setPhotos([])}
          >
            Clear All
          </button>
        )}
      </header>
      
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Photo Upload Section */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Package Photos</h2>
            <p className={styles.cardSubtitle}>Add up to 4 photos of your package</p>
            
            <div className={styles.photosGrid}>
              {photos.map((photo) => (
                <div key={photo.timestamp} className={styles.photoContainer}>
                  <img 
                    src={photo.url}
                    alt="Package"
                    className={styles.photo}
                  />
                  <div className={styles.photoType}>
                    {photo.type === 'camera' ? <Camera size={12} /> : <Image size={12} />}
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemovePhoto(photo.timestamp)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              {/* <>
              {photos.length < 4 && (
                <button
                  className={styles.addPhotoButton}
                  onClick={handleTakePhoto}
                >
                  <div className={styles.addPhotoIcon}>
                    <Camera size={24} />
                  </div>
                  <span>Take Photo</span>
                </button>
              )}
              </> */}
            </div>

            {photos.length < 4 && (
              <button
                className={styles.galleryButton}
                onClick={handleChoosePhoto}
              >
                <Image size={20} />
                Choose from Gallery
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
          </div>

          {/* Guidelines Card */}
          <div className={styles.card}>
            <div className={styles.guidelinesHeader}>
              <div className={styles.infoIcon}>
                <Info size={20} />
              </div>
              <div>
                <h3 className={styles.guidelinesTitle}>Photo Guidelines</h3>
                <ul className={styles.guidelinesList}>
                  <li>Take clear, well-lit photos</li>
                  <li>Show all sides of the package</li>
                  <li>Include any damage or special markings</li>
                  <li>Ensure package labels are visible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.footerButtons}>
          <button
            className={styles.backButton}
            onClick={handlePreviousStep}
          >
            <div className='flex flex-row items-center gap-2'>
              <ArrowLeft size={20} />
              <span>Back</span>
            </div>
          </button>
          <button
            className={styles.continueButton}
            onClick={handleSubmit}
            disabled={photos.length === 0 || isUploading}
          >
            {isUploading ? (
              <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={20} />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className='flex flex-row items-center gap-2'>
                <span>Continue</span>
                {photos.length > 0 && <ChevronRight size={20} />}
              </div>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
