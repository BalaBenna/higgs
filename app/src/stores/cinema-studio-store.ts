import { create } from 'zustand'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9' | '4:3' | '3:4'
export type Duration = 5 | 10 | 15 | 20 | 30
export type GenerationMode = 'image' | 'video'

export interface CameraMovement {
  id: string
  name: string
  description: string
}

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  { id: 'static', name: 'Static', description: 'No movement' },
  { id: 'pan-left', name: 'Pan Left', description: 'Camera sweeps left' },
  { id: 'pan-right', name: 'Pan Right', description: 'Camera sweeps right' },
  { id: 'tilt-up', name: 'Tilt Up', description: 'Camera tilts upward' },
  { id: 'tilt-down', name: 'Tilt Down', description: 'Camera tilts downward' },
  { id: 'dolly-in', name: 'Dolly In', description: 'Camera moves closer' },
  { id: 'dolly-out', name: 'Dolly Out', description: 'Camera moves away' },
  { id: 'zoom-in', name: 'Zoom In', description: 'Lens zooms in' },
  { id: 'zoom-out', name: 'Zoom Out', description: 'Lens zooms out' },
  { id: 'crane-up', name: 'Crane Up', description: 'Camera rises up' },
  { id: 'crane-down', name: 'Crane Down', description: 'Camera lowers down' },
  { id: 'orbit', name: 'Orbit', description: 'Camera orbits around subject' },
  { id: 'tracking', name: 'Tracking', description: 'Camera follows subject' },
  { id: 'handheld', name: 'Handheld', description: 'Shaky handheld movement' },
  { id: 'rack-focus', name: 'Rack Focus', description: 'Focus shifts between subjects' },
]

export interface CameraPreset {
  id: string
  name: string
  lens: string
  focalLength: string
  description: string
}

export const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'arri-alexa-35', name: 'Arri Alexa 35', lens: '35mm', focalLength: '1/4', description: 'Hollywood standard' },
  { id: 'red-v-raptor', name: 'RED V-Raptor', lens: '50mm', focalLength: '1/8', description: 'High resolution' },
  { id: 'sony-venice-2', name: 'Sony Venice 2', lens: '24mm', focalLength: '1/2', description: 'Cinematic look' },
  { id: 'blackmagic-ursa', name: 'Blackmagic URSA', lens: '85mm', focalLength: '1/4', description: 'Broadcast quality' },
  { id: 'canon-c500', name: 'Canon C500 Mark II', lens: '35mm', focalLength: '1/6', description: 'Versatile' },
  { id: 'red-monstro', name: 'RED Monstro', lens: '65mm', focalLength: 'T1.4', description: 'Ultimate detail' },
  { id: 'arri-mini', name: 'Arri Alexa Mini', lens: '28mm', focalLength: 'T2.0', description: 'Compact powerhouse' },
  { id: 'panasonic-s1h', name: 'Panasonic S1H', lens: '50mm', focalLength: 'T1.5', description: 'Mirrorless cinema' },
  { id: 'sony-fx9', name: 'Sony FX9', lens: '35mm', focalLength: 'T2.0', description: 'Full-frame cinema' },
  { id: 'canon-r5', name: 'Canon EOS R5', lens: '24mm', focalLength: 'T2.0', description: 'Hybrid shooter' },
  { id: 'bmpcc-6k', name: 'BMPCC 6K Pro', lens: '50mm', focalLength: 'T1.5', description: 'Compact cinema' },
  { id: 'phantom-flex', name: 'Phantom Flex', lens: '28mm', focalLength: 'T2.0', description: 'Super slow-mo' },
  { id: 'sony-a7s', name: 'Sony A7S III', lens: '35mm', focalLength: 'T1.4', description: 'Low light king' },
  { id: 'red-komodo', name: 'RED Komodo', lens: '50mm', focalLength: 'T1.5', description: 'Compact cinema' },
  { id: 'arri-amira', name: 'Arri Amira', lens: '35mm', focalLength: 'T2.0', description: 'Documentary style' },
]

export interface Project {
  id: string
  name: string
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
  prompt: string
  aspectRatio: AspectRatio
  duration: Duration
  cameraId: string
  movementId: string
  audioEnabled: boolean
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

  // Advanced settings
  negativePrompt: string
  setNegativePrompt: (prompt: string) => void
  cfgScale: number
  setCfgScale: (scale: number) => void
  motionStrength: number
  setMotionStrength: (strength: number) => void

  // Camera & Movement
  camera: CameraPreset
  setCamera: (camera: CameraPreset) => void
  movement: CameraMovement
  setMovement: (movement: CameraMovement) => void
  movementVisible: boolean
  setMovementVisible: (visible: boolean) => void

  // Frames
  startFrame: File | null
  setStartFrame: (file: File | null) => void
  endFrame: File | null
  setEndFrame: (file: File | null) => void

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
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  loadProject: (project: Project) => void

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
  clearGeneratedContent: () => void

  // Reset
  reset: () => void
}

const initialState = {
  mode: 'video' as GenerationMode,
  aspectRatio: '16:9' as AspectRatio,
  duration: 5 as Duration,
  audioEnabled: true,
  frameCount: 4,
  negativePrompt: '',
  cfgScale: 7,
  motionStrength: 7,
  startFrame: null,
  endFrame: null,
  camera: CAMERA_PRESETS[0],
  movement: CAMERA_MOVEMENTS[0],
  movementVisible: false,
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
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setCfgScale: (cfgScale) => set({ cfgScale }),
  setMotionStrength: (motionStrength) => set({ motionStrength }),
  setStartFrame: (startFrame) => set({ startFrame }),
  setEndFrame: (endFrame) => set({ endFrame }),
  setCamera: (camera) => set({ camera }),
  setMovement: (movement) => set({ movement }),
  setMovementVisible: (movementVisible) => set({ movementVisible }),
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

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    })),

  loadProject: (project) =>
    set({
      prompt: project.prompt,
      aspectRatio: project.aspectRatio,
      duration: project.duration,
      audioEnabled: project.audioEnabled,
      activeProjectId: project.id,
      camera: CAMERA_PRESETS.find((c) => c.id === project.cameraId) || CAMERA_PRESETS[0],
      movement: CAMERA_MOVEMENTS.find((m) => m.id === project.movementId) || CAMERA_MOVEMENTS[0],
    }),

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

  clearGeneratedContent: () => set({ generatedContent: [] }),

  reset: () => set(initialState),
}))
