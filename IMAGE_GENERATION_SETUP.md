# Image Generation Setup Guide

## Problem

Gemini models (gemini-2.0-flash-exp) **cannot generate images**. They can only analyze/understand images. The original code was trying to use Gemini for image generation, which causes the error:

```
Error: Failed to generate image: Model response did not contain image data
```

## Solutions

### Solution 1: Replicate API (Recommended - Currently Implemented)

**Pros:**

- Free tier available
- Fast (Flux Schnell model)
- High quality images
- Easy to implement

**Setup:**

1. Sign up at https://replicate.com
2. Get your API token from https://replicate.com/account/api-tokens

**Cost:** Free tier includes credits, then ~$0.003 per generation

---

### Solution 2: OpenAI DALL-E 3

**Pros:**

- Excellent quality
- Good prompt understanding
- Reliable service

**Setup:**

1. Get API key from https://platform.openai.com/api-keys
2. Install package: `npm install openai`
3. Add to `.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Replace the `generateImageFromPrompt` method in `image-generator.util.ts`:

```typescript
async generateImageFromPrompt(prompt: string): Promise<string> {
  try {
    console.log('Generating image with prompt:', prompt);

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64String = `data:image/png;base64,${response.data[0].b64_json}`;
    console.log('Image generated successfully');
    return base64String;
  } catch (error: unknown) {
    console.error('Error generating image', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('Failed to generate image');
  }
}
```

**Cost:** ~$0.04 per image (1024x1024)

---

### Solution 3: Stability AI (Stable Diffusion)

**Setup:**

1. Get API key from https://platform.stability.ai
2. Add to `.env`:
   ```
   STABILITY_API_KEY=your_key_here
   ```
3. Use their REST API similar to Replicate implementation

**Cost:** Credits-based, ~$0.002 per generation

---

### Solution 4: Google Imagen (via Vertex AI)

**Pros:**

- Google's official image generation
- High quality

**Cons:**

- More complex setup (requires GCP project)
- Requires authentication setup
- More expensive

---

## Current Implementation

The code has been updated to use **Replicate API with Flux Schnell model**.

### What was changed:

1. Replaced Gemini image generation call with Replicate API
2. Added polling mechanism to wait for image generation
3. Added proper error handling
4. Downloads generated image and converts to base64

### Testing:

Once you add your `REPLICATE_API_TOKEN` to `.env`, restart your server and test the endpoint.

## Notes

- Gemini should still be used for **image analysis** (the `analyzeImageWithVision` method)
- Only the **image generation** part needed to be changed
- The `cartoonizeCharacter` method also needs to be updated if it's used for generation (currently it seems to be for analysis)
