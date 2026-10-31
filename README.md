# Citizens Track Toolkit

An open, participatory toolkit under development as part of the [Citizens Track on AI](https://www.citizens-track.org/)

The toolkit provides modular, interactive resources designed for community workshops, civic assemblies, and grassroots learning.

---

## 🌟 Key Features

- **Multi-Format Content Delivery**: Every content item automatically renders in three interactive formats:
  - 📄 **Page View**: Accessible, comprehensive document format for direct reading and self-paced study.
  - 🗂️ **Two-Sided Cards**: Interactive 3D flip cards with a dedicated print layout (`@media print`) that formats cards side-by-side with fold guides for physical workshop materials.
  - 🖥️ **Slide Deck**: Presentation mode with keyboard controls (`←`/`→`), progress tracking, and full-screen toggle for workshop facilitators.
- **4-Stage Workshop Modules**: End-to-end participatory learning structures arranged into four guided stages:
  1. 👋 **Welcome**: Icebreakers and group framing
  2. 💡 **Learning**: Concepts, stats, and exploration
  3. 💬 **Discussion**: Deliberation and collective dialogue
  4. ⚡ **Action**: Community empowerment and next steps
- **Practical Workshop Activities**: Timed, step-by-step participatory exercises with facilitator notes, creator attributions, license details, and downloadable materials.
- **Rich Pedagogical Elements**: Modular content items composed of quizzes, data points, perspectives, key takeaways, and adaptation guidance.
- **Multilingual & Context-Specific Localisation**: Internationalisation supporting standard 2-digit language codes (`en`, `es`, `fr`, `de`) and context-specific/regional codes (e.g., `es-uy`, `es-gb`). Features base-language fallbacks, regional variant callouts on activity cards, and a Wikipedia-style locale switcher.
- **Git-Based Sveltia CMS**: Integrated [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin/` featuring editorial workflow, live side-by-side previews, relation selectors, and visual shortcode insertion tools.

---

## 🏗️ Tech Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) (v0.167.0+ Extended)
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (Git-backed editorial workflow targeting GitHub)
- **Styling**: Vanilla CSS design system (`static/css/toolkit.css`) with CSS custom properties, responsive layout, print styles, and micro-animations
- **Hosting**: [Netlify](https://www.netlify.com/)

---

## 📁 Repository Structure

```text
toolkit/
├── content/                     # Localized Markdown content
│   ├── en/                      # English content (modules, activities, content, collections)
│   ├── es/                      # Base Spanish content
│   ├── es-uy/                   # Regional Spanish (Uruguay) adaptations
│   ├── es-gb/                   # Regional Spanish (UK context) adaptations
│   ├── fr/                      # French content
│   └── de/                      # German content
├── data/
│   └── locales.yaml             # Single source of truth for locale metadata & labels
├── i18n/                        # UI translation strings (en, es, fr, de, es-uy, es-gb)
├── layouts/                     # Hugo template overrides & layouts
│   ├── _default/                # Base layouts (baseof.html, list.html, single.html)
│   ├── activities/              # Activity list & single templates
│   ├── content/                 # Content item multi-view templates (page/cards/slides)
│   ├── content-collections/     # Thematic collection layouts
│   ├── modules/                 # 4-stage workshop module layouts
│   ├── partials/                # Reusable partials (locale-switcher.html, header.html, footer.html)
│   └── shortcodes/              # Shortcodes (activity, content_item, collection)
├── static/                      # Static assets
│   ├── admin/                   # Sveltia CMS configuration (config.yml, preview.js, index.html)
│   ├── css/                     # CSS stylesheets (toolkit.css)
│   └── images/                  # Media library uploads
├── config.yaml                  # Hugo configuration & multilingual definitions
└── netlify.toml                 # Build & deployment pipeline configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (`v0.167.0` or higher)
- [Git](https://git-scm.com/)

Verify your Hugo installation:
```bash
hugo version
```

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/citizens-track-ai/toolkit.git
   cd toolkit
   ```

2. **Start the local development server**:
   ```bash
   hugo server -D
   ```

3. **Open the site in your browser**:
   - Toolkit Hub: [http://localhost:1313/](http://localhost:1313/)
   - Sveltia CMS Admin: [http://localhost:1313/admin/](http://localhost:1313/admin/)

---

## ✍️ Content Authoring with CMS

The toolkit includes an in-browser CMS powered by [Sveltia CMS](https://github.com/sveltia/sveltia-cms).

### Accessing the CMS
- In production / staging: visit `https://<site-domain>/admin/` and authenticate with GitHub.
- In local development: visit `http://localhost:1313/admin/`.

### Embedding Shortcodes in Markdown
Facilitators and authors can embed linked activities, collections, or content items directly into rich text fields using either the CMS editor components or manual Hugo shortcodes:

```markdown
{{< activity "hands-on-history-exploring-the-evolution-of-ai" >}}
{{< content_item "history-of-ai-branches-and-timeline" >}}
{{< collection "history-of-ai" >}}
```

All embedded shortcodes gracefully fall back to the default language if a translation is pending, ensuring no broken links during localization.

---

## 🌍 Localisation & Regional Adaptation

The toolkit supports both general multilingual translations and context-specific regional adaptations.

### 1. Locale Codes & Conventions

Locales are defined in [`config.yaml`](file:///Users/admin/Documents/ConnectedByData/CitizensTrack/toolkit/config.yaml) and [`data/locales.yaml`](file:///Users/admin/Documents/ConnectedByData/CitizensTrack/toolkit/data/locales.yaml). They can be:
- **Standard 2-letter language codes**: e.g., `en` (English), `es` (Spanish), `fr` (French), `de` (German).
- **Context-specific / regional codes**: e.g., `es-uy` (Spanish adapted for Uruguay), `es-gb` (Spanish adapted for the UK context), or cohort identifiers. The first 2 characters define the base language, while subsequent characters specify the context or region.

> **Policy Note on Flags**: The toolkit intentionally **does not use country flags** to represent languages or localisations. Languages span across national borders, and localisations often represent specific civic communities or regional contexts. All switchers and badges use clear typography, native names, and context tags.

### 2. Single Source of Truth (`data/locales.yaml`)

All locale metadata (custom frontend/backend titles, native display names, base language inheritance, and context tags) is configured in [`data/locales.yaml`](file:///Users/admin/Documents/ConnectedByData/CitizensTrack/toolkit/data/locales.yaml):

```yaml
es:
  label: "Spanish"
  native_name: "Español"
  base_lang: "es"
  is_context_locale: false

es-uy:
  label: "Spanish (Uruguay)"
  native_name: "Español (Uruguay)"
  base_lang: "es"
  is_context_locale: true

es-gb:
  label: "Spanish (UK Context)"
  native_name: "Español (Reino Unido)"
  base_lang: "es"
  context: "United Kingdom Localisation"
  is_context_locale: true
```

### 3. Wikipedia-Style Locale Switcher

Each page includes an interactive dropdown button in the header displaying `🌐 N localisations ▾`:
- **Current Page Translations**: Lists all available translations for the exact page being viewed with native language names and context pills (e.g. `Español (Uruguay)`).
- **Other Site Localisations**: Direct links to the homepages of other supported locales where this specific page is not yet translated.
- **Preference Persistence**: The user's chosen locale preference is stored in `localStorage` (`ct_preferred_locale`).

### 4. Partial Localisation, Link Fallbacks & Server Redirects

Because community adaptations are created iteratively, content items and activities may exist in only a subset of locales. The toolkit handles this gracefully:
- **Smart Navigation Fallbacks (`nav-url.html`)**: All main header and footer links use the `nav-url.html` partial. If a section or page does not exist in the active 4-digit locale (e.g. `es-uy`), the link dynamically resolves to the 2-digit base language (`es`) or default English (`en`), preventing broken 404 links.
- **Server-Side Safety Net (`.htaccess` & `_redirects`)**: For direct URL requests or external bookmarks to unlocalised regional pages, server rewrite rules issue an HTTP 302 (Temporary Redirect) to the base language version if it exists, or to the default English version. HTTP 302 is used to protect SEO and allow search engines to index regional pages as soon as they are published.
- **Hierarchical Content Fallbacks**: When browsing a regional context such as `es-uy`, embedded activities, content items, and UI labels fall back to base Spanish (`es`) rather than jumping straight to English (`en`).
- **Regional Variant Indicators**: When viewing a module or activity in a base language (e.g. English or Spanish), activity cards automatically detect if a context-specific adaptation exists (e.g. `es-uy`) and render a direct callout button:
  `📍 Localised version available: Español (Uruguay) →`
- If the user has a saved regional preference in `localStorage`, the matching regional badge is dynamically highlighted.

### 5. Authoring Localisations in Sveltia CMS

In the CMS admin (`/admin/`):
- Translation tabs display friendly names configured in `data/locales.yaml` instead of raw language codes.
- `initial_locales: default` is configured in `static/admin/config.yml` so that creating a new entry does not generate empty stub files across all locales. Translations can be added independently when ready.

---

## 🚢 Deployment

The site is continuously built and deployed on Netlify:
- **Build command**: `hugo`
- **Publish directory**: `public`
- **Environment**: Hugo v0.167.0

Pushing changes to the configured branch (`staging` or `main`) triggers an automated build and deploy preview on Netlify.

---

## 📄 License & Attribution

- **Code & Layouts**: Released under the [MIT License](LICENSE).
- **Educational Materials**: Content developed by multiple parties published under open licenses to support public education and grassroots community participation.
