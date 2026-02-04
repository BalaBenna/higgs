import { create } from 'zustand'

export type AspectRatio = '16:9' | '9:16' | '1:1'
export type Duration = 5 | 10
export type GenerationMode = 'image' | 'video'

export interface CameraPreset {
  id: string
  name: string
  lens: string
  focalLength: string
}

export const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'arri-alexa-35', name: 'Arri Alexa 35', lens: '35mm', focalLength: '1/4' },
  { id: 'red-v-raptor', name: 'RED V-Raptor', lens: '50mm', focalLength: '1/8' },
  { id: 'sony-venice', name: 'Sony Venice 2', lens: '24mm', focalLength: '1/2' },
  { id: 'blackmagic-ursa', name: 'Blackmagic URSA', lens: '85mm', focalLength: '1/4' },
  { id: 'canon-c500', name: 'Canon C500 Mark II', lens: '35mm', focalLength: '1/6' },
]

export interface Project {
  id: string
  name: string
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
}

interface CinemaStudioState {
  // Mode
  mode: GenerationMode
  setMode: (mode: GenerationMode) => void

  // Generation settings
  aspectRatio: AspectRatio
  setAspectRatio: (ratio: AspectRatio) => void
  duration: Duration
  setDuration: (duration: Duration) => void
  audioEnabled: boolean
  setAudioEnabled: (enabled: boolean) => void
  frameCount: number
  setFrameCount: (count: number) => void

  // Frames
  startFrame: File | null
  setStartFrame: (file: File | null) => void
  endFrame: File | null
  setEndFrame: (file: File | null) => void

  // Camera
  camera: CameraPreset
  setCamera: (camera: CameraPreset) => void

  // Prompt
  prompt: string
  setPrompt: (prompt: string) => void

  // Generation state
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  generationProgress: number
  setGenerationProgress: (progress: number) => void

  // Projects
  projects: Project[]
  activeProjectId: string | null
  setActiveProject: (id: string | null) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void

  // Sidebar
  sidebarVisible: boolean
  setSidebarVisible: (visible: boolean) => void

  // Generated content
  generatedContent: Array<{
    id: string
    type: 'image' | 'video'
    url: string
    prompt: string
    createdAt: Date
  }>
  addGeneratedContent: (content: {
    type: 'image' | 'video'
    url: string
    prompt: string
  }) => void

  // Reset
  reset: () => void
}

const initialState = {
  mode: 'video' as GenerationMode,
  aspectRatio: '16:9' as AspectRatio,
  duration: 5 as Duration,
  audioEnabled: true,
  frameCount: 4,
  startFrame: null,
  endFrame: null,
  camera: CAMERA_PRESETS[0],
  prompt: '',
  isGenerating: false,
  generationProgress: 0,
  projects: [] as Project[],
  activeProjectId: null,
  sidebarVisible: true,
  generatedContent: [] as CinemaStudioState['generatedContent'],
}

export const useCinemaStudioStore = create<CinemaStudioState>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setDuration: (duration) => set({ duration }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setFrameCount: (frameCount) => set({ frameCount }),
  setStartFrame: (startFrame) => set({ startFrame }),
  setEndFrame: (endFrame) => set({ endFrame }),
  setCamera: (camera) => set({ camera }),
  setPrompt: (prompt) => set({ prompt }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationProgress: (generationProgress) => set({ generationProgress }),
  setSidebarVisible: (sidebarVisible) => set({ sidebarVisible }),

  setActiveProject: (activeProjectId) => set({ activeProjectId }),

  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  addGeneratedContent: (content) =>
    set((state) => ({
      generatedContent: [
        {
          ...content,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        },
        ...state.generatedContent,
      ],
    })),

  reset: () => set(initialState),
}))
