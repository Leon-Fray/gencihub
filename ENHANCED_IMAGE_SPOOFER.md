# Enhanced Image Spoofer Integration

## Overview

A comprehensive image spoofing system has been integrated into your vaHub application with advanced visual modifications beyond basic EXIF spoofing.

## What's Been Added

### 1. Enhanced Spoofer Module (`lib/image-spoofer/enhanced-spoofer.ts`)

A client-side image spoofer that provides:

- **Standard EXIF Spoofing** (Spoof A-D variants from your original system)
- **Advanced Visual Modifications**:
  - **Noise**: Adds subtle random pixel noise (1-2% of pixels affected)
  - **Warping**: Applies subtle distortion/displacement
  - **Color Shift**: Slight shifts in RGB channels
  - **Vignette Filter**: Darkening effect at image edges
  - **Random Shapes**: Overlays subtle shapes (circles, rectangles, triangles)

- **Configurable Quality**: Adjustable JPEG compression (50-100%)
- **Combined Output**: Creates an "Enhanced" version with all visual mods + EXIF spoofing

### 2. Types (`lib/image-spoofer/types.ts`)

```typescript
export interface SpoofConfig {
    quality: number;           // JPEG quality 50-100
    enableNoise: boolean;      // Add random noise
    enableWarping: boolean;    // Apply distortion
    enableColorShift: boolean; // Shift color channels
    enableFilters: boolean;    // Apply vignette
    enableShapes: boolean;     // Add random shapes
}

export interface Point {
    x: number;
    y: number;
}
```

### 3. Server-Side Spoofer (`lib/image-spoofer/server-spoofer.ts`)

Server-compatible version for Node.js environments (no Canvas API):
- EXIF spoofing only (visual modifications require browser Canvas)

### 4. API Endpoint (`app/api/spoof-images/route.ts`)

REST API endpoint for server-side image spoofing.

### 5. Enhanced UI Component (`components/enhanced-image-spoofer.tsx`)

A complete React component featuring:
- File upload interface
- Live preview
- Configuration controls (checkboxes and quality slider)
- Grid display of all 5 spoofed versions
- Download buttons for each variant
- Progress indicators
- Error handling

### 6. Checkbox UI Component (`components/ui/checkbox.tsx`)

New Radix UI checkbox component for configuration controls.

## How to Use

### In Your Code

```typescript
import { spoofImageEnhanced } from '@/lib/image-spoofer/enhanced-spoofer'
import { SpoofConfig } from '@/lib/image-spoofer/types'

const config: Partial<SpoofConfig> = {
  quality: 90,
  enableNoise: true,
  enableWarping: false,
  enableColorShift: true,
  enableFilters: true,
  enableShapes: false
}

const result = await spoofImageEnhanced(imageDataUrl, config)

// result contains:
// - spoofA, spoofB, spoofC, spoofD (standard EXIF spoofing)
// - enhanced (all visual mods + EXIF spoofing)
```

### In Your UI

Simply import and use the `EnhancedImageSpoofer` component:

```tsx
import { EnhancedImageSpoofer } from '@/components/enhanced-image-spoofer'

export default function MyPage() {
  return (
    <div>
      <EnhancedImageSpoofer />
    </div>
  )
}
```

## Features Breakdown

### Spoof A
- Random date/time (2015-2023)
- Random GPS coordinates
- EXIF metadata only

### Spoof B
- Random date/time (2010-2014)
- Fake camera brand (Fujifilm, Sony, Canon, Nikon)
- Fake camera model
- EXIF metadata only

### Spoof C
- Strips all EXIF data
- Clean image

### Spoof D
- Random date/time (2018-2024)
- Random GPS coordinates
- Modern camera brands (Apple, Samsung, Google, OnePlus)
- Modern camera models (iPhone 12 Pro, Galaxy S21, Pixel 6, OnePlus 9)
- Fake software info (Adobe Photoshop, GIMP, Camera+ 2)
- Fake exposure settings (ISO, f-stop, exposure time)

### Enhanced
- All visual modifications (noise, warping, color shift, vignette, shapes)
- Full Spoof D EXIF data
- Configurable quality setting

## Technical Details

### Client-Side Processing
- Uses HTML5 Canvas API for pixel manipulation
- Real-time processing in browser
- No server round-trip needed
- Works with any image format supported by browser

### EXIF Manipulation
- Uses `piexifjs` library (JavaScript equivalent of Python's piexif)
- Inserts/modifies standard EXIF fields
- Compatible with all major image viewers

### Browser Support
- Modern browsers with Canvas API support
- Safari, Chrome, Firefox, Edge

## Integration with Existing Code

The enhanced spoofer is backward-compatible with your existing image spoofing components:

- `components/model-tile-with-spoof-client.tsx` - Can be updated to use enhanced spoofer
- `supabase/functions/image-spoofer/index.ts` - Edge function uses basic spoofer
- `spoofDrive.py` - Python script (original)

## Next Steps

1. **Install Dependencies**: `npm install` (already done)
2. **Add to Your Pages**: Import `EnhancedImageSpoofer` wherever needed
3. **Customize Configuration**: Adjust default settings in the component
4. **Optional**: Integrate with your existing model image workflow

## Example Usage in a Page

```tsx
// app/dashboard/image-spoofer/page.tsx
import { EnhancedImageSpoofer } from '@/components/enhanced-image-spoofer'

export default function ImageSpooferPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Enhanced Image Spoofer</h1>
      <EnhancedImageSpoofer />
    </div>
  )
}
```

## Dependencies Added

- `@radix-ui/react-checkbox: ^1.1.3` - For configuration UI

All other dependencies were already in your project:
- `piexifjs`: EXIF manipulation
- `lucide-react`: Icons
- Radix UI components: Already installed

## Notes

- The enhanced spoofer is **client-side only** (uses Canvas API)
- For server-side processing, use `server-spoofer.ts` (EXIF only)
- Visual modifications are **subtle** by design to appear authentic
- All spoofed images are returned as base64 data URLs
- No images are stored; processing is in-memory only

## Support

For issues or questions:
1. Check browser console for errors
2. Verify image format is supported
3. Ensure Canvas API is enabled in browser
4. Check that piexifjs is properly installed

