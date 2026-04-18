# AI Image Generation Prompt for Social Preview Image

## AI Image Generator Prompts

### Option 1: Midjourney Prompt (Recommended)

```
A professional social media preview image for a cryptographic key generator website. 
Dimensions: 1200x630 pixels (landscape). 
Modern, clean tech aesthetic with dark blue/charcoal background (#222831). 

Center-aligned composition featuring:
- Large bold title at top: "Cryptographic Key Generator" in bright cyan/teal color (#00ADB5)
- Tagline below title: "Secure. Client-Side. Open Source." in light gray (#A0A0A0)
- Three centered icons representing security, keys, and speed: 🔐 🔑 ⚡ (lock, key, lightning)
- Footer URL at bottom: "crypto-gen.kern.web.za" in medium gray (#808080)

Tech-focused, minimal design, modern cybersecurity aesthetic. 
Flat design with subtle gradients. 
High contrast for readability. 
Professional quality suitable for Twitter, LinkedIn, Facebook sharing.
--ar 1200:630 --v 6.0
```

### Option 2: DALL-E 3 Prompt

```
Create a social media preview image (1200x630px) for a cryptographic key generator app.

Style: Modern tech/cybersecurity aesthetic with dark blue/charcoal background.

Layout (top to bottom, centered):
1. Large bold title: "Cryptographic Key Generator" in cyan/teal color (#00ADB5)
2. Tagline: "Secure. Client-Side. Open Source." in light gray
3. Three emoji icons in a row: 🔐 🔑 ⚡
4. Footer text: "crypto-gen.kern.web.za" in medium gray

Design requirements:
- Clean, minimal, professional
- High contrast for readability
- Modern cybersecurity aesthetic
- Suitable for social media sharing
- Flat design with subtle depth
```

### Option 3: Stable Diffusion XL Prompt

```
Social media preview image, 1200x630px, landscape orientation.

Content:
- Title: "Cryptographic Key Generator" (large, bold, cyan color #00ADB5)
- Subtitle: "Secure. Client-Side. Open Source." (medium size, light gray)
- Icons: 🔐 🔑 ⚡ (centered row)
- Footer: "crypto-gen.kern.web.za" (small, gray)

Style: Modern tech, cybersecurity, dark theme. Background: dark blue/charcoal (#222831). Minimal design, high contrast, professional.

Negative prompt: text, low quality, blurry, distorted, watermark, signature, ugly, messy, cluttered
```

### Option 4: Leonardo AI / Ideogram Prompt

```
A professional social preview image for a cryptographic key generator website, 1200x630px.

Visual hierarchy (top to bottom, centered):
1. Bold title: "Cryptographic Key Generator" in cyan (#00ADB5)
2. Tagline: "Secure. Client-Side. Open Source." in light gray
3. Security icons: 🔐 🔑 ⚡ (horizontal arrangement)
4. Domain: "crypto-gen.kern.web.za" (footer, small gray)

Design style: Modern cybersecurity, dark tech aesthetic, clean and minimal. Dark blue background (#222831), bright cyan accents (#00ADB5). Professional, trustworthy, secure appearance.

Aspect ratio: 1.9:1 (landscape)
Use: Social sharing preview (Twitter, LinkedIn, Facebook)
```

### Option 5: Adobe Firefly / Generic AI Prompt

```
Professional website social preview image, 1200x630 pixels, landscape.

Subject: Cryptographic Key Generator - secure client-side key generation tool.

Design elements:
- Dark cybersecurity aesthetic with blue/charcoal background (#222831)
- Title: "Cryptographic Key Generator" in bright cyan/teal (#00ADB5)
- Tagline: "Secure. Client-Side. Open Source."
- Security symbols: lock (🔐), key (🔑), lightning (⚡)
- Website URL: "crypto-gen.kern.web.za"

Style: Modern tech, minimalist, high contrast, professional quality. Clean typography, centered layout, balanced composition.
```

---

## Detailed Style Guide for AI Generators

### Color Specifications
- **Primary accent:** #00ADB5 (cyan/teal)
- **Background:** #222831 (dark blue/charcoal)  
- **Secondary:** #393E46 (medium gray)
- **Text (title):** #00ADB5 (bright cyan)
- **Text (tagline):** #A0A0A0 (light gray)
- **Text (footer):** #808080 (medium gray)

### Typography
- **Title:** Sans-serif, bold, 48-60px
- **Tagline:** Sans-serif, medium weight, 24-30px  
- **Footer:** Sans-serif, regular, 16-18px

### Layout
- All elements center-aligned
- Even vertical distribution
- Generous padding (top: 80-100px, bottom: 60-80px, sides: 60-80px)
- Balanced visual weight

### Mood/Keywords
- Modern, professional, trustworthy, secure
- Cybersecurity, cryptography, technology
- Clean, minimalist, high-tech
- Developer tools, security-focused

### Technical Requirements
- **Format:** PNG
- **Dimensions:** Exactly 1200x630 pixels
- **DPI:** 72 (standard web)
- **Color space:** sRGB

### Testing After Generation
After generating, test at:
- https://cards-dev.twitter.com/validator
- https://www.facebook.com/sharer/sharer.php?u=https://crypto-gen.kern.web.za

---

## Quick Alternative: Text-to-Image Tools

**Tools to try:**
1. **Midjourney** (best for tech aesthetics) - discord.com/invite/midjourney
2. **DALL-E 3** (via ChatGPT Plus) - integrated, easy to use
3. **Leonardo AI** - leonardo.ai (has cybersecurity models)
4. **Ideogram** - ideogram.ai (good for text in images)
5. **Stable Diffusion XL** - via various interfaces

**Recommended workflow:**
1. Start with Midjourney (best results for tech)
2. If not satisfied, try DALL-E 3
3. Use the generated image as base, fine-tune in Canva if needed

---

## Post-Generation Checklist

After generating the image:
- [ ] Verify dimensions are exactly 1200x630
- [ ] Check text is readable and centered
- [ ] Ensure colors match brand (#00ADB5, #222831)
- [ ] Test on Twitter Card Validator
- [ ] Test on Facebook Sharing Debugger
- [ ] Rename to `social-preview.png`
- [ ] Place in `images/` directory
- [ ] Deploy to Vercel to test live