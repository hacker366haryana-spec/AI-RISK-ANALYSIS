'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, CameraOff, FlipHorizontal, Maximize2, Minimize2 } from 'lucide-react'

type CameraState = 'idle' | 'requesting' | 'active' | 'denied' | 'error'

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [mirrored, setMirrored] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [resolution, setResolution] = useState({ w: 0, h: 0 })

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const openCamera = async (facing: 'user' | 'environment' = facingMode) => {
    stopStream()
    setCameraState('requesting')
    setErrorMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setResolution({
            w: videoRef.current?.videoWidth ?? 0,
            h: videoRef.current?.videoHeight ?? 0,
          })
        }
      }
      setCameraState('active')
    } catch (err: unknown) {
      stopStream()
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraState('denied')
        setErrorMsg('Camera access was denied. Please allow camera permission in your browser and try again.')
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setCameraState('error')
        setErrorMsg('No camera device found on this system.')
      } else {
        setCameraState('error')
        setErrorMsg(err instanceof Error ? err.message : 'Unknown error opening camera.')
      }
    }
  }

  const closeCamera = () => {
    stopStream()
    setCameraState('idle')
    setResolution({ w: 0, h: 0 })
  }

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next)
    if (cameraState === 'active') openCamera(next)
  }

  // Cleanup on unmount
  useEffect(() => () => stopStream(), [])

  const isActive = cameraState === 'active'

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Status bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green pulse-glow' : 'bg-muted-foreground'}`} />
          <span className={`text-xs font-mono font-semibold tracking-widest uppercase ${isActive ? 'text-green' : 'text-muted-foreground'}`}>
            {cameraState === 'idle' && 'STANDBY'}
            {cameraState === 'requesting' && 'CONNECTING...'}
            {cameraState === 'active' && 'LIVE'}
            {cameraState === 'denied' && 'PERMISSION DENIED'}
            {cameraState === 'error' && 'ERROR'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isActive && resolution.w > 0 && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {resolution.w}x{resolution.h}
            </span>
          )}
          {isActive && (
            <>
              <button
                onClick={() => setMirrored(m => !m)}
                title="Mirror feed"
                aria-label="Mirror feed"
                className={`p-1.5 rounded border transition-colors ${mirrored ? 'bg-cyan/10 border-cyan/30 text-cyan' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={flipCamera}
                title="Flip camera (front/rear)"
                aria-label="Flip camera"
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFullscreen(f => !f)}
                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video frame */}
      <div
        className={`relative flex-1 rounded border overflow-hidden flex items-center justify-center bg-surface ${
          isActive ? 'border-green/30' : 'border-border'
        } ${fullscreen ? 'fixed inset-0 z-50 rounded-none border-0 bg-black' : ''}`}
      >
        {/* Scanline overlay when active */}
        {isActive && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
            }}
            aria-hidden="true"
          />
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform ${mirrored ? '-scale-x-100' : ''} ${isActive ? 'block' : 'hidden'}`}
          aria-label="Camera feed"
        />

        {/* Idle / requesting state */}
        {!isActive && (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-raised border border-border flex items-center justify-center">
              {cameraState === 'requesting' ? (
                <Camera className="w-6 h-6 text-cyan animate-pulse" />
              ) : (
                <CameraOff className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {(cameraState === 'denied' || cameraState === 'error') && (
              <p className="text-xs font-mono text-amber leading-relaxed max-w-xs">{errorMsg}</p>
            )}

            {cameraState === 'requesting' && (
              <p className="text-xs font-mono text-cyan">Requesting camera access...</p>
            )}

            {(cameraState === 'idle' || cameraState === 'denied' || cameraState === 'error') && (
              <button
                onClick={() => openCamera()}
                className="flex items-center gap-2 px-4 py-2 rounded bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-semibold hover:bg-cyan/20 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                {cameraState === 'idle' ? 'Open Camera' : 'Retry'}
              </button>
            )}
          </div>
        )}

        {/* Fullscreen close button */}
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            aria-label="Exit fullscreen"
            className="absolute top-4 right-4 z-20 p-2 rounded bg-background/70 border border-border text-foreground hover:bg-background transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Controls */}
      {isActive && (
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <span className="uppercase tracking-wider">Facing:</span>
            <span className="text-foreground">{facingMode === 'user' ? 'Front' : 'Rear'}</span>
          </div>
          <button
            onClick={closeCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red/30 bg-red/5 text-red text-xs font-mono font-semibold hover:bg-red/10 transition-colors"
          >
            <CameraOff className="w-3 h-3" />
            Close Camera
          </button>
        </div>
      )}
    </div>
  )
}
