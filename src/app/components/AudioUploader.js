'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Mic, Upload, StopCircle, Play, Pause, FileAudio } from 'lucide-react'


export default function AudioUploader() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [backendOutput, setBackendOutput] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    audioChunks.current = []

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioURL(audioUrl)
    }

    mediaRecorder.current.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const audioUrl = URL.createObjectURL(file)
      setAudioURL(audioUrl)
    }
  }

  const handleSubmit = async () => {
    if (!audioURL) {
      setBackendOutput('No audio file selected or recorded.')
      return
    }

    setBackendOutput('Processing audio...')
    
    setTimeout(() => {
      setBackendOutput('Audio processed successfully! Duration: 30 seconds, Format: WAV')
    }, 2000)
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Audio Studio</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isRecording ? <StopCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            <div className="relative group">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center cursor-pointer transition-colors duration-300"
              >
                <FileAudio className="h-8 w-8 text-white" />
              </label>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Upload Audio
              </span>
            </div>
          </div>
          
          {audioURL && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Button onClick={togglePlayback} variant="outline" size="icon" className="w-10 h-10 rounded-full">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-grow">
                  <Progress value={(currentTime / duration) * 100} className="w-full" />
                </div>
                <span className="text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <audio
                ref={audioRef}
                src={audioURL}
                onTimeUpdate={updateTime}
                onLoadedMetadata={updateTime}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
          
          <Button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700">
            <Upload className="mr-2 h-4 w-4" />
            Process Audio
          </Button>
          
          {backendOutput && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Backend Output:</h3>
              <p className="text-sm text-gray-700">{backendOutput}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}