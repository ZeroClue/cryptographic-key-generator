# Social Preview Image Design Brief

## Specifications

**Dimensions:** 1200x630 pixels
**Format:** PNG
**Purpose:** OpenGraph/social sharing preview for cryptographic-key-generator.app

## Design Requirements

### Content Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🔐 Cryptographic                         │
│                    Key Generator                             │
│                                                             │
│              Secure. Client-Side. Open Source.                │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │    🔑    │  │    ⚡    │  │    🛡️    │                     │
│  │    RSA   │  │    ECC   │  │    PGP   │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                             │
│              cryptokeygen.com                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Elements

**Background:** Deep dark blue/charcoal (#222831 or similar)

**Title Text:**
- Text: "Cryptographic Key Generator"
- Style: Large, bold, sans-serif font
- Color: Bright cyan/teal (#00ADB5) for emphasis
- Size: Approximately 48-60px
- Position: Top center, with padding

**Tagline:**
- Text: "Secure. Client-Side. Open Source."
- Style: Medium weight, sans-serif
- Color: Light gray (#A0A0A0 or similar)
- Size: Approximately 24-30px
- Position: Below title, with spacing

**Key Icons:**
- Icons: 🔐 (lock), 🔑 (key), ⚡ (lightning)
- Style: Large emoji or icon illustrations
- Arrangement: Horizontal row, centered
- Purpose: Represent security, cryptography, and speed

**Alternative Visual Options:**
1. **Icon Row:** Three large icons as shown above
2. **Code Preview:** Stylized code snippet showing key generation
3. **Split Design:** Left side text/icons, right side app preview

**URL/Footer:**
- Text: "cryptokeygen.com"
- Style: Small, sans-serif
- Color: Medium gray (#808080)
- Size: Approximately 16-18px
- Position: Bottom center, with padding

### Color Palette

**Brand Colors:**
- Primary: #00ADB5 (cyan/teal)
- Dark: #222831 (dark blue/charcoal)
- Secondary: #393E46 (medium gray)
- Light: #EEEEEE (off-white)

**Text Colors:**
- Title: #00ADB5 (brand primary)
- Tagline: #A0A0A0 (light gray)
- URL: #808080 (medium gray)

### Typography

**Font Families (in order of preference):**
1. System sans-serif (SF Pro, Inter, Roboto, Segoe UI)
2. Arial
3. Helvetica

**Font Weights:**
- Title: Bold (700)
- Tagline: Medium (500)
- URL: Regular (400)

### Layout Guidelines

**Spacing:**
- Top padding: 80-100px
- Bottom padding: 60-80px
- Side padding: 60-80px
- Element spacing: 30-40px between sections

**Alignment:**
- All elements center-aligned
- Balanced composition with visual weight distributed evenly

### Design Tools

**Recommended Tools:**
- **Figma** (free tier available)
- **Canva** (free templates available)
- **Photoshop/GIMP**
- **Sketch**

**Figma Instructions:**
1. Create new artboard: 1200x630px
2. Add rectangle for background (#222831)
3. Add text elements as specified
4. Use Emojis (🔐, 🔑, ⚡) or create simple icon shapes
5. Export as PNG at 100% scale

**Canva Instructions:**
1. Search "Social Media" templates (1200x630)
2. Customize colors to match brand palette
3. Replace content with specified text and icons
4. Download as PNG

### Accessibility

**Considerations:**
- High contrast for readability
- Clear, large text for small screens
- Avoid clutter (keep it simple and focused)

### Export Settings

**Format:** PNG
**Quality:** 100% (highest quality)
**Color Profile:** sRGB
**Transparency:** No (solid background)

### File Naming

**Primary:** `social-preview.png`
**Location:** `images/social-preview.png`

### Testing Preview

After creation, test the image at:
- https://www.facebook.com/sharer/sharer.php?u=https://cryptographic-key-generator-b6czr3q1h-zeroclues-projects.vercel.app
- https://cards-dev.twitter.com/validator
- https://developers.facebook.com/tools/debug/

## Quick Implementation

**Option 1: Use an Online Tool**
- Visit: https://www.canva.com/templates/s/social-media/
- Search for "technology" or "security" templates
- Customize with brand colors and text

**Option 2: Simple Code-Based Generation**
- Use HTML/CSS to generate, then screenshot
- Use Node.js with sharp/puppeteer for automated generation

**Option 3: Professional Design**
- Use the design brief above with a designer
- Ensures brand consistency and high quality

## Notes

- The current placeholder at `images/social-preview.txt` should be replaced
- Update OpenGraph tags in `index.html` if URL changes after deployment
- Test image on multiple social platforms before finalizing
