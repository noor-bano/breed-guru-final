"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { TestTube2, Upload, Languages, Loader2, AlertTriangle, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { classifyImageAction, getBreedDescriptionAction, translateDescriptionAction, saveCorrectionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const COMMON_BREEDS = [
  'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Kankrej', 'Ongole', 'Hariana', 'Deoni', 'Rathi', 
  'Murrah', 'Nili-Ravi', 'Jaffarabadi', 'Bhadawari'
];

type Prediction = {
  breed: string;
  confidence: number;
};

export default function BreedGuruClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageQualityWarning, setImageQualityWarning] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [isCorrection, setIsCorrection] = useState(false);
  
  const [description, setDescription] = useState<string | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'original' | 'hi'>('original');

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageQualityWarning(null);
    setIsLoading(false);
    setPredictions(null);
    setSelectedBreed(null);
    setIsCorrection(false);
    setDescription(null);
    setTranslatedDescription(null);
    setCurrentLanguage('original');
  };

  const checkImageQuality = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const desiredWidth = 100;
        canvas.width = desiredWidth;
        canvas.height = img.height * (desiredWidth / img.width);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          brightness += (r * 299 + g * 587 + b * 114) / 1000;
        }
        
        brightness = brightness / (canvas.width * canvas.height);
        
        if (brightness < 70) {
          setImageQualityWarning('Image seems dark. Results may be less accurate.');
        } else {
          setImageQualityWarning(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      checkImageQuality(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setPredictions(null);
    setSelectedBreed(null);
    setDescription(null);
    setTranslatedDescription(null);
    setCurrentLanguage('original');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const result = await classifyImageAction(formData);
      setPredictions(result.predictions);
      if(result.predictions.length > 0) {
        setSelectedBreed(result.predictions[0].breed);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBreed) {
      const fetchDescription = async () => {
        setIsDescriptionLoading(true);
        setDescription(null);
        setTranslatedDescription(null);
        setCurrentLanguage('original');
        try {
          const result = await getBreedDescriptionAction(selectedBreed);
          setDescription(result.description);
          if (isCorrection) {
            await saveCorrectionAction(predictions?.[0]?.breed || 'unknown', selectedBreed);
            toast({
              title: "Correction Saved",
              description: `Thank you for improving Breed Guru!`,
            });
            setIsCorrection(false);
          }
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Description Error",
            description: "Failed to fetch breed description.",
          });
        } finally {
          setIsDescriptionLoading(false);
        }
      };
      fetchDescription();
    }
  }, [selectedBreed, isCorrection, predictions, toast]);
  
  const handleTranslate = async (language: 'original' | 'hi') => {
    if (!description || language === currentLanguage) return;
  
    if (language === 'original') {
      setTranslatedDescription(null);
      setCurrentLanguage('original');
      return;
    }
  
    setIsTranslationLoading(true);
    try {
      const result = await translateDescriptionAction(description, 'hi');
      setTranslatedDescription(result.translatedText);
      setCurrentLanguage('hi');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description: "Could not translate the description.",
      });
    } finally {
      setIsTranslationLoading(false);
    }
  };

  const handleCorrection = (breed: string) => {
    setIsCorrection(true);
    setSelectedBreed(breed);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Image
          </CardTitle>
          <CardDescription>Upload a picture of a cow or buffalo to identify its breed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreview ? (
            <div className="relative group w-full max-w-md mx-auto">
              <Image
                src={imagePreview}
                alt="Uploaded preview"
                width={600}
                height={400}
                className="rounded-lg object-cover aspect-video w-full"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={resetState}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ) : (
            <div
              className="flex justify-center items-center w-full h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-accent/20 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center text-muted-foreground">
                <Upload className="mx-auto h-12 w-12" />
                <p className="mt-2">Click to upload or drag and drop</p>
                <p className="text-xs">PNG, JPG, or JPEG</p>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageChange} />
          
          {imageQualityWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Image Quality Warning</AlertTitle>
              <AlertDescription>{imageQualityWarning}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSubmit} disabled={!imageFile || isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
            Analyze Breed
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
        </Card>
      )}

      {predictions && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.map((p, index) => (
                <div key={p.breed} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className={index === 0 ? 'text-lg text-primary font-bold' : ''}>{p.breed}</span>
                    <span>{Math.round(p.confidence * 100)}%</span>
                  </div>
                  <Progress value={p.confidence * 100} className={index === 0 ? '[&>div]:bg-accent' : '[&>div]:bg-primary'} />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap justify-between items-center gap-2">
                <span>Breed Information: {selectedBreed}</span>
                <div className="flex items-center gap-2">
                  {(isTranslationLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-5 w-5" />}
                  <Button variant={currentLanguage === 'original' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTranslate('original')}>English</Button>
                  <Button variant={currentLanguage === 'hi' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTranslate('hi')}>हिंदी</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDescriptionLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">{translatedDescription ?? description}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Is the prediction incorrect?</CardTitle>
              <CardDescription>
                Help us improve our AI by selecting the correct breed. We will fetch the information for the corrected breed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleCorrection} value={selectedBreed || ''}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select correct breed" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_BREEDS.map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
