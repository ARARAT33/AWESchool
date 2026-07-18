import React, { useEffect, useRef, useState } from 'react';
import { Camera, Sun, Moon, Sparkles, Sliders, Play, Square, Eye } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../lib/translations';

interface ThemeLightSensorProps {
  currentTheme: 'dark' | 'light' | 'auto';
  setSystemThemeOverride: (theme: 'dark' | 'light') => void;
  language: AppLanguage;
}

export default function ThemeLightSensor({ currentTheme, setSystemThemeOverride, language }: ThemeLightSensorProps) {
  const t = TRANSLATIONS[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [brightness, setBrightness] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Stop video stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsMeasuring(false);
  };

  // Start video stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 40, height: 40, facingMode: 'user' } 
      });
      setStream(mediaStream);
      setIsMeasuring(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera illumination permission denied or unavailable:", err);
      setCameraError(err.message || "Permission Denied");
      setIsMeasuring(false);
    }
  };

  // Periodic frame calculation
  useEffect(() => {
    let intervalId: any;

    if (isMeasuring && stream && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      intervalId = setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          ctx.drawImage(video, 0, 0, 10, 10);
          try {
            const imageData = ctx.getImageData(0, 0, 10, 10);
            const data = imageData.data;
            let totalLuminance = 0;
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // Standard relative luminance formula
              const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              totalLuminance += luminance;
            }
            
            const avgBrightness = totalLuminance / (data.length / 4);
            const normalVal = Math.round(avgBrightness);
            setBrightness(normalVal);

            // Auto-adjust system theme override
            if (currentTheme === 'auto') {
              if (normalVal < 80) {
                setSystemThemeOverride('dark');
              } else {
                setSystemThemeOverride('light');
              }
            }
          } catch (e) {
            // cross-origin protection or empty image
          }
        }
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMeasuring, stream, currentTheme, setSystemThemeOverride]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Time-of-day check fallback when camera is not actively processing
  useEffect(() => {
    if (currentTheme === 'auto' && !isMeasuring) {
      const hour = new Date().getHours();
      const isNight = hour < 7 || hour > 19;
      setSystemThemeOverride(isNight ? 'dark' : 'light');
    }
  }, [currentTheme, isMeasuring, setSystemThemeOverride]);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 font-sans shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black text-slate-200 tracking-wide uppercase">
            {t.cameraLightDetector}
          </span>
        </div>
        <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/30">
          OFFLINE SENSOR
        </span>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed">
        {t.lightThresholdDesc}
      </p>

      {/* Sensor feedback gauge */}
      <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-850">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" 
          />
          <canvas ref={canvasRef} width="10" height="10" className="hidden" />
          {brightness !== null ? (
            brightness < 80 ? (
              <Moon className="w-5 h-5 text-indigo-400 relative z-10 animate-pulse" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 relative z-10 animate-bounce" />
            )
          ) : (
            <Eye className="w-5 h-5 text-slate-600 relative z-10" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.lightLevel}:</span>
            <span className="text-xs font-black font-mono text-cyan-400">
              {brightness !== null ? `${brightness} lx` : '---'}
            </span>
          </div>
          
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-amber-400 h-full transition-all duration-500"
              style={{ width: `${brightness !== null ? Math.min(100, (brightness / 255) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trigger Buttons */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={isMeasuring ? stopCamera : startCamera}
          className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isMeasuring 
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' 
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
          }`}
        >
          {isMeasuring ? (
            <>
              <Square className="w-3.5 h-3.5 fill-red-400/20" />
              Stop Sensor
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-cyan-400/20" />
              Activate Sensor
            </>
          )}
        </button>

        {cameraError && (
          <span className="text-[9px] text-red-400 font-mono italic max-w-[120px] truncate" title={cameraError}>
            {cameraError}
          </span>
        )}
      </div>
    </div>
  );
}
