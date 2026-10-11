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
- **Multilingual by Design**: Full internationalization across multiple locales (**English**, **Español**, **Français**, and **Deutsch**) using Hugo's multilingual directory structure (`content/{lang}/`).
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
│   ├── es/                      # Spanish content
│   ├── fr/                      # French content
│   └── de/                      # German content
├── layouts/                     # Hugo template overrides & layouts
│   ├── _default/                # Base layouts (baseof.html, list.html, single.html)
│   ├── activities/              # Activity list & single templates
│   ├── content/                 # Content item multi-view templates (page/cards/slides)
│   ├── content-collections/     # Thematic collection layouts
│   ├── modules/                 # 4-stage workshop module layouts
│   ├── partials/                # Reusable partials (header.html, footer.html, head.html)
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
