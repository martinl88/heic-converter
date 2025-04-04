import React, { useState } from 'react';
import { Upload, Image, X, Check, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeicConverter = () => {
  const [convertedImages, setConvertedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState("original");

  const convertHeicToJpg = async (files) => {
    try {
      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: files.length });
      setConvertedImages([]);
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load converter'));
        document.body.appendChild(script);
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          if (!file.name.toLowerCase().endsWith('.heic')) {
            throw new Error(`${file.name} is not a HEIC file - skipping`);
          }

          let jpgBlob = await window.heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: quality
          });

          // Handle image resizing if needed
          if (maxWidth !== "original") {
            const maxWidthValue = parseInt(maxWidth);
            const img = new Image();
            const imgUrl = URL.createObjectURL(jpgBlob);
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imgUrl;
            });

            if (img.width > maxWidthValue) {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const ratio = maxWidthValue / img.width;
              canvas.width = maxWidthValue;
              canvas.height = img.height * ratio;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              jpgBlob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', quality);
              });
            }
            URL.revokeObjectURL(imgUrl);
          }

          const url = URL.createObjectURL(jpgBlob);
          setConvertedImages(prev => [...prev, {
            originalName: file.name,
            url,
            status: 'success',
            size: (jpgBlob.size / 1024 / 1024).toFixed(2) // Size in MB
          }]);
        } catch (err) {
          setConvertedImages(prev => [...prev, {
            originalName: file.name,
            error: err.message,
            status: 'error'
          }]);
        }
        
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    convertHeicToJpg(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      convertHeicToJpg(files);
    }
  };

  const downloadAllJpgs = () => {
    convertedImages.forEach((img, index) => {
      if (img.status === 'success') {
        const link = document.createElement('a');
        link.href = img.url;
        const fileName = img.originalName.replace('.heic', '.jpg');
        link.download = fileName;
        link.click();
      }
    });
  };

  const downloadSingleJpg = (img) => {
    const link = document.createElement('a');
    link.href = img.url;
    const fileName = img.originalName.replace('.heic', '.jpg');
    link.download = fileName;
    link.click();
  };

  const clearImages = () => {
    convertedImages.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
    setConvertedImages([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const progressPercentage = progress.total ? (progress.current / progress.total) * 100 : 0;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>HEIC to JPG Batch Converter</CardTitle>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Conversion Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quality ({Math.round(quality * 100)}%)
              </label>
              <Slider
                value={[quality * 100]}
                onValueChange={(value) => setQuality(value[0] / 100)}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher quality results in larger file sizes
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Width</label>
              <Select value={maxWidth} onValueChange={setMaxWidth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Size</SelectItem>
                  <SelectItem value="3840">4K (3840px)</SelectItem>
                  <SelectItem value="1920">Full HD (1920px)</SelectItem>
                  <SelectItem value="1280">HD (1280px)</SelectItem>
                  <SelectItem value="800">Web Optimized (800px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer relative mb-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {loading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <Progress value={progressPercentage} className="w-full" />
              <p>Converting {progress.current} of {progress.total} files...</p>
            </div>
          ) : convertedImages.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {convertedImages.map((img, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {img.status === 'success' ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{img.originalName}</span>
                        {img.status === 'success' && (
                          <span className="text-sm text-gray-500">
                            Size: {img.size} MB
                          </span>
                        )}
                      </div>
                    </div>
                    {img.status === 'success' ? (
                      <button
                        onClick={() => downloadSingleJpg(img)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-sm text-red-500">{img.error}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={downloadAllJpgs}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download All
                </button>
                <button
                  onClick={clearImages}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Drop your HEIC images here</p>
                <p className="text-sm text-gray-500">or</p>
                <label className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  Select Files
                  <input
                    type="file"
                    accept=".heic"
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeicConverter;
