import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error:
        'Server-side MP4 rendering requires @remotion/bundler, @remotion/renderer, and ffmpeg. ' +
        'Use the browser-based download instead, or install these packages for server rendering: ' +
        'npm install @remotion/bundler @remotion/renderer',
    },
    { status: 501 }
  )
}
