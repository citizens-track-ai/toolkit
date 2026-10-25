// Sveltia CMS Custom Live Preview Template for Content Items
// Supports Live Page View, Interactive 3D Two-Sided Cards, and Slide Deck Presentation

if (typeof CMS !== 'undefined') {
  const { useState } = CMS.React;

  CMS.registerPreviewStyle('/css/toolkit.css');

  // Deep normalization of Immutable Maps/Lists to standard JS Objects/Arrays
  function normalize(val) {
    if (!val) return val;
    if (typeof val.toJS === 'function') return val.toJS();
    if (typeof val.get === 'function') {
      const entries = val.entries ? Array.from(val.entries()) : [];
      if (entries.length > 0) {
        const obj = {};
        entries.forEach(([k, v]) => { obj[k] = normalize(v); });
        return obj;
      }
    }
    if (Array.isArray(val)) return val.map(normalize);
    if (typeof val === 'object') {
      const obj = {};
      Object.keys(val).forEach(k => { obj[k] = normalize(val[k]); });
      return obj;
    }
    return val;
  }

  function processShortcodesForPreview(text) {
    if (!text) return '';
    let str = String(text);
    // Replace {{< activity "slug" >}} or {{< activity slug="slug" >}}
    str = str.replace(/{{<\s*activity\s+(?:slug=)?["']?([^"'\s>]+)["']?\s*>}}/g, (match, slug) => {
      return `\n\n<div class="toolkit-embed-card activity-embed-card"><div class="embed-card-header"><div class="embed-badges"><span class="element-pill" style="background: #e0f2fe; color: #0369a1; font-weight:700;">Activity</span><span class="element-pill" style="background:#f1f5f9;">⏱️ 15-45m</span></div></div><h4 class="embed-card-title"><a href="/activities/${slug}">📌 Activity: ${slug}</a></h4><p class="embed-card-summary" style="font-size:0.85rem;color:#64748b;">(Embedded activity reference)</p><div class="embed-card-footer"><span class="action-btn-link">View Activity Instructions &rarr;</span></div></div>\n\n`;
    });
    // Replace {{< content-item "slug" >}} or {{< content_item "slug" >}}
    str = str.replace(/{{<\s*content[-_]item\s+(?:slug=)?["']?([^"'\s>]+)["']?\s*>}}/g, (match, slug) => {
      return `\n\n<div class="toolkit-embed-card content-embed-card"><div class="embed-card-header"><div class="embed-badges"><span class="element-pill" style="background: #ccfbf1; color: #134e4a; font-weight:700;">Content Item</span></div><span style="font-size:0.75rem; color:#64748b; font-weight:600;">📄 Page • 🎴 Cards • 📽️ Slides</span></div><h4 class="embed-card-title"><a href="/content/${slug}">📑 Content Item: ${slug}</a></h4><p class="embed-card-summary" style="font-size:0.85rem;color:#64748b;">(Embedded content item with interactive presentation)</p><div class="embed-card-footer"><span class="action-btn-link primary">Open Presentation &rarr;</span></div></div>\n\n`;
    });
    // Replace {{< collection "slug" >}} or {{< content-collection "slug" >}}
    str = str.replace(/{{<\s*(?:content[-_]collection|collection)\s+(?:slug=)?["']?([^"'\s>]+)["']?\s*>}}/g, (match, slug) => {
      return `\n\n<div class="toolkit-embed-card collection-embed-card"><div class="embed-card-header"><div class="embed-badges"><span class="element-pill" style="background: #fae8ff; color: #a21caf; font-weight:700;">Content Collection</span></div></div><h4 class="embed-card-title"><a href="/content-collections/${slug}">📚 Collection: ${slug}</a></h4><p class="embed-card-summary" style="font-size:0.85rem;color:#64748b;">(Embedded topic collection)</p><div class="embed-card-footer"><span class="action-btn-link" style="color: #a21caf;">Browse Collection &rarr;</span></div></div>\n\n`;
    });
    return str;
  }

  function renderMarkdown(md) {
    if (md == null || md === '') return '';
    let str = processShortcodesForPreview(String(md));
    try {
      if (typeof marked !== 'undefined') {
        const parsed = typeof marked.parse === 'function'
          ? marked.parse(str, { breaks: true, gfm: true })
          : marked(str);
        if (typeof DOMPurify !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
          return DOMPurify.sanitize(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Markdown parsing error in preview:', err);
    }
    return str.replace(/\n/g, '<br/>');
  }

  const ContentItemPreview = ({ entry }) => {
    const [viewMode, setViewMode] = useState('page'); // 'page' | 'cards' | 'slides'
    const [flippedCards, setFlippedCards] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);

    const rawData = entry.get('data');
    const data = normalize(rawData) || {};
    const title = data.title || 'Untitled Content Item';
    const overview = data.facilitator_overview || '';
    const elements = Array.isArray(data.elements) ? data.elements : [];
    const guidance = data.adaptation_guidance || '';

    // Prepare slides sequence
    const slides = [];
    // Slide 1: Title slide (without facilitator overview)
    slides.push({
      type: 'title',
      title: title
    });

    // Element slides
    elements.forEach((el) => {
      if (!el) return;
      const elType = el.type || 'information';
      if (elType === 'quiz_question') {
        // Separate Slide A: Question
        slides.push({
          type: 'quiz_question',
          question: el.question || '',
          image: el.image || '',
          citation: el.citation || ''
        });
        // Separate Slide B: Answer & Explanation
        slides.push({
          type: 'quiz_answer',
          answer: el.answer || '',
          explanation: el.explanation || '',
          citation: el.citation || ''
        });
      } else if (elType === 'statistic') {
        slides.push({
          type: 'statistic',
          figure: el.figure || '',
          description: el.description || '',
          explanation: el.explanation || '',
          citation: el.citation || ''
        });
      } else if (elType === 'perspective') {
        slides.push({
          type: 'perspective',
          quote: el.quote || '',
          attribution: el.attribution || '',
          citation: el.citation || ''
        });
      } else if (elType === 'information') {
        slides.push({
          type: 'information',
          text: el.text || '',
          citation: el.citation || ''
        });
      } else if (elType === 'takeaways') {
        slides.push({
          type: 'takeaways',
          text: el.text || '',
          citation: el.citation || ''
        });
      }
    });

    const totalSlides = Math.max(1, slides.length);
    const safeSlideIndex = Math.min(Math.max(0, currentSlide), totalSlides - 1);
    const activeSlide = slides[safeSlideIndex] || slides[0] || { type: 'title', title: title };

    const toggleCard = (idx) => {
      setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const flipAllCards = () => {
      const allFlipped = Object.values(flippedCards).filter(Boolean).length === elements.length;
      const nextState = {};
      elements.forEach((_, idx) => {
        nextState[idx] = !allFlipped;
      });
      setFlippedCards(nextState);
    };

    return html`
      <div class="main-wrapper" style="padding: 1rem 1.25rem 3rem;">
        <!-- View Switcher Toolbar inside CMS Preview -->
        <div class="view-switcher-bar" style="position: static; margin-bottom: 1.5rem;">
          <div class="view-tabs">
            <button 
              type="button" 
              class="view-tab ${viewMode === 'page' ? 'active' : ''}" 
              onClick=${() => setViewMode('page')}
            >
              📄 Page View
            </button>
            <button 
              type="button" 
              class="view-tab ${viewMode === 'cards' ? 'active' : ''}" 
              onClick=${() => setViewMode('cards')}
            >
              🎴 Two-Sided Cards
            </button>
            <button 
              type="button" 
              class="view-tab ${viewMode === 'slides' ? 'active' : ''}" 
              onClick=${() => setViewMode('slides')}
            >
              📽️ Slide Deck
            </button>
          </div>

          ${viewMode === 'cards' && html`
            <div class="view-actions">
              <button type="button" class="action-btn" onClick=${flipAllCards}>
                ↺ Flip All Cards
              </button>
            </div>
          `}
        </div>

        <!-- (a) PAGE VIEW -->
        ${viewMode === 'page' && html`
          <div class="view-section active">
            <article class="page-header" style="margin-bottom: 1.5rem;">
              <span class="collection-badge" style="background: var(--color-primary-light); color: var(--color-primary-dark);">Content Item Preview</span>
              <h1 class="page-title" style="margin-top: 0.5rem;">${title}</h1>

              ${overview && html`
                <div class="facilitator-box">
                  <div class="facilitator-box-label">Facilitator Overview</div>
                  <div class="facilitator-box-text" dangerouslySetInnerHTML=${{ __html: renderMarkdown(overview) }} />
                </div>
              `}
            </article>

            <div class="elements-stream">
              ${elements.map((el, idx) => html`
                <div key=${idx} class="element-block element-${el.type}">
                  <div class="element-block-header">
                    <span class="element-pill ${el.type}">
                      ${el.type === 'quiz_question' ? 'Quiz Question' :
                        el.type === 'statistic' ? 'Statistic / Key Figure' :
                        el.type === 'perspective' ? 'Perspective / Quote' :
                        el.type === 'information' ? 'Information' :
                        el.type === 'takeaways' ? 'Takeaways' : el.type}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--color-muted); font-weight: 600;">Block #${idx + 1}</span>
                  </div>

                  <div class="element-block-content">
                    ${el.type === 'quiz_question' && html`
                      <div class="quiz-question" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.question) }} />
                      <details class="quiz-answer-details">
                        <summary>Answer & Explanation</summary>
                        <div class="quiz-answer-body">
                          <div style="font-weight: 600; margin-bottom: 0.5rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.answer) }} />
                          ${el.explanation && html`
                            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e9d5ff; font-size: 0.9rem;">
                              <strong>Explanation:</strong>
                              <div dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.explanation) }} />
                            </div>
                          `}
                        </div>
                      </details>
                    `}

                    ${el.type === 'statistic' && html`
                      <div class="stat-element-wrapper">
                        <div class="stat-element-figure">${el.figure}</div>
                        <div class="stat-element-body">
                          <div class="stat-element-desc">${el.description}</div>
                          ${el.explanation && html`
                            <div class="stat-element-explanation" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.explanation) }} />
                          `}
                        </div>
                      </div>
                    `}

                    ${el.type === 'perspective' && html`
                      <div class="perspective-quote-box">
                        <blockquote class="perspective-quote-text" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.quote) }} />
                        ${el.attribution && html`<div class="perspective-author">— ${el.attribution}</div>`}
                      </div>
                    `}

                    ${el.type === 'information' && html`
                      <div style="font-size: 1.05rem; line-height: 1.6;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                    `}

                    ${el.type === 'takeaways' && html`
                      <div class="takeaways-box">
                        <div style="font-weight: 700; color: #86198f; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase;">
                          Key Takeaways
                        </div>
                        <div dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                      </div>
                    `}

                    ${el.citation && html`
                      <div class="citation-line">Source / Citation: ${el.citation}</div>
                    `}
                  </div>
                </div>
              `)}
            </div>

            ${guidance && html`
              <div class="guidance-box">
                <div class="guidance-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Adaptation & Localisation Guidance
                </div>
                <div class="guidance-content" dangerouslySetInnerHTML=${{ __html: renderMarkdown(guidance) }} />
              </div>
            `}
          </div>
        `}

        <!-- (c) TWO-SIDED CARDS VIEW -->
        ${viewMode === 'cards' && html`
          <div class="view-section active">
            <div class="cards-intro-bar">
              <div class="cards-intro-text">
                <span>Click any card below to 3D flip between <strong>Front</strong> and <strong>Back</strong>.</span>
              </div>
            </div>

            <div class="cards-grid">
              ${elements.map((el, idx) => {
                const isFlipped = !!flippedCards[idx];
                return html`
                  <div 
                    key=${idx} 
                    class="card-3d-wrapper ${isFlipped ? 'is-flipped' : ''}" 
                    onClick=${() => toggleCard(idx)}
                  >
                    <div class="card-3d-inner">
                      <!-- FRONT -->
                      <div class="card-face card-face-front ${el.type === 'information' ? 'card-front-info' : ''}">
                        <div class="card-face-header">
                          ${el.type !== 'information' ? html`
                            <span class="element-pill ${el.type}">
                              ${el.type === 'quiz_question' ? 'Quiz Question' :
                                el.type === 'statistic' ? 'Statistic' :
                                el.type === 'perspective' ? 'Perspective' : 'Takeaways'}
                            </span>
                          ` : html`<span class="element-pill-spacer"></span>`}
                          <span class="card-flip-prompt">Click to flip ↺</span>
                        </div>

                        <div class="card-face-body">
                          ${el.type === 'quiz_question' && html`
                            <div class="card-main-title" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.question) }} />
                          `}
                          ${el.type === 'statistic' && html`
                            <div class="card-main-stat">${el.figure}</div>
                            <div class="card-main-title">${el.description}</div>
                          `}
                          ${el.type === 'perspective' && html`
                            <blockquote class="card-main-quote" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.quote) }} />
                          `}
                          ${el.type === 'information' && (() => {
                            const cleanText = (el.text || '').replace(/\r\n/g, '\n');
                            const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
                            const firstLine = lines.length > 0 ? lines[0] : '';
                            return html`
                              <div class="card-info-front-content">
                                <div class="card-front-title" dangerouslySetInnerHTML=${{ __html: renderMarkdown(firstLine) }} />
                                ${el.image && html`
                                  <div class="card-front-image-wrap">
                                    <img src=${el.image} alt="Card visual" class="card-front-image" />
                                  </div>
                                `}
                              </div>
                            `;
                          })()}
                          ${el.type === 'takeaways' && html`
                            <div class="card-main-title" style="color: var(--ct-color-deep-redwood);">Key Takeaways</div>
                            <div style="font-size: 0.95rem; color: var(--color-slate);">Flip for summary points</div>
                          `}
                        </div>

                        <div class="card-face-footer">
                          <span class="card-flip-btn">${el.type === 'quiz_question' ? 'Flip to Answer →' : 'Flip to Details →'}</span>
                        </div>
                      </div>

                      <!-- BACK -->
                      <div class="card-face card-face-back">
                        <div class="card-face-header">
                          <span class="element-pill" style="background: rgba(0, 68, 124, 0.1); color: var(--ct-color-fjord); border: 1px solid rgba(0, 68, 124, 0.2);">
                            ${el.type === 'quiz_question' ? 'Answer & Explanation' :
                              el.type === 'statistic' ? 'Context & Insight' :
                              el.type === 'perspective' ? 'Attribution' : 'Details'}
                          </span>
                          <span class="card-flip-prompt">Click to flip ↺</span>
                        </div>

                        <div class="card-face-body">
                          ${el.type === 'quiz_question' && html`
                            <div style="font-size: 1.05rem; font-weight: 600; color: #581c87; margin-bottom: 0.5rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.answer) }} />
                            ${el.explanation && html`
                              <div style="font-size: 0.875rem; color: var(--color-slate); line-height: 1.5;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.explanation) }} />
                            `}
                          `}
                          ${el.type === 'statistic' && html`
                            <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">${el.description}</div>
                            ${el.explanation && html`
                              <div style="font-size: 0.875rem; color: var(--color-slate);" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.explanation) }} />
                            `}
                          `}
                          ${el.type === 'perspective' && html`
                            ${el.attribution && html`
                              <div style="font-size: 1.05rem; font-weight: 700; color: #047857; margin-bottom: 0.5rem;">
                                — ${el.attribution}
                              </div>
                            `}
                          `}
                          ${el.type === 'information' && html`
                            <div class="card-back-text" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                          `}
                          ${el.type === 'takeaways' && html`
                            <div class="card-back-text" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                          `}

                          ${el.citation && html`
                            <div class="citation-line" style="margin-top: 0.5rem; font-size: 0.7rem;">
                              Source: ${el.citation}
                            </div>
                          `}
                        </div>

                        <div class="card-face-footer">
                          <span class="card-flip-btn">← Flip to Front</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>
        `}

        <!-- (b) SLIDE DECK VIEW -->
        ${viewMode === 'slides' && html`
          <div class="view-section active">
            <div class="slideshow-container" style="min-height: 480px; position: relative; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="slide-progress-bar" style="width: ${((safeSlideIndex + 1) / totalSlides) * 100}%;"></div>

              <div class="slides-viewport" style="min-height: 380px; display: flex; align-items: center; justify-content: center; padding: 2.5rem 3rem;">
                <div class="slide-item" style="display: block; width: 100%; max-width: 760px; margin: 0 auto; text-align: left;">
                  ${activeSlide.type === 'title' && html`
                    <div>
                      <span class="slide-tag">Presentation</span>
                      <h2 class="slide-title" style="font-size: 2.5rem; margin-top: 0.75rem;">${activeSlide.title}</h2>
                    </div>
                  `}

                  ${activeSlide.type === 'quiz_question' && html`
                    <div>
                      <span class="slide-tag">Quiz Question</span>
                      <div class="slide-title" style="font-size: 1.85rem; margin-top: 0.75rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.question) }} />
                    </div>
                  `}

                  ${activeSlide.type === 'quiz_answer' && html`
                    <div>
                      <span class="slide-tag" style="background: rgba(20, 184, 166, 0.25); color: #5eead4;">Quiz Answer</span>
                      <div class="slide-title" style="font-size: 1.75rem; color: #5eead4; margin-top: 0.75rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.answer) }} />
                      ${activeSlide.explanation && html`
                        <div class="slide-body" style="font-size: 1.15rem; color: #cbd5e1; margin-top: 1rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.explanation) }} />
                      `}
                      ${activeSlide.citation && html`
                        <div style="margin-top: 1.5rem; font-size: 0.8rem; color: #64748b;">
                          Source: ${activeSlide.citation}
                        </div>
                      `}
                    </div>
                  `}

                  ${activeSlide.type === 'statistic' && html`
                    <div>
                      <span class="slide-tag">Key Statistic</span>
                      <div class="slide-stat-figure" style="font-size: 4rem; margin-top: 0.5rem;">${activeSlide.figure}</div>
                      <div class="slide-title" style="font-size: 1.75rem;">${activeSlide.description}</div>
                      ${activeSlide.explanation && html`
                        <div class="slide-body" style="margin-top: 0.75rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.explanation) }} />
                      `}
                    </div>
                  `}

                  ${activeSlide.type === 'perspective' && html`
                    <div>
                      <span class="slide-tag">Perspective</span>
                      <blockquote class="slide-quote" style="margin-top: 0.75rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.quote) }} />
                      ${activeSlide.attribution && html`
                        <div class="slide-attribution" style="margin-top: 0.75rem;">— ${activeSlide.attribution}</div>
                      `}
                    </div>
                  `}

                  ${activeSlide.type === 'information' && html`
                    <div>
                      <span class="slide-tag">Information</span>
                      <div class="slide-body" style="font-size: 1.4rem; color: white; margin-top: 0.75rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.text) }} />
                    </div>
                  `}

                  ${activeSlide.type === 'takeaways' && html`
                    <div>
                      <span class="slide-tag" style="background: rgba(240, 171, 252, 0.2); color: #f0abfc;">Key Takeaways</span>
                      <div class="slide-title" style="font-size: 1.85rem; color: #f0abfc; margin-top: 0.75rem;">Key Takeaways</div>
                      <div class="slide-body" style="margin-top: 0.75rem;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(activeSlide.text) }} />
                    </div>
                  `}
                </div>
              </div>

              <!-- Slides Controls -->
              <div class="slides-controls">
                <div class="slides-nav-btns">
                  <button 
                    type="button" 
                    class="slide-btn" 
                    disabled=${safeSlideIndex === 0} 
                    onClick=${() => setCurrentSlide(Math.max(0, safeSlideIndex - 1))}
                    title="Previous Slide"
                  >
                    ←
                  </button>
                  <button 
                    type="button" 
                    class="slide-btn" 
                    disabled=${safeSlideIndex >= totalSlides - 1} 
                    onClick=${() => setCurrentSlide(Math.min(totalSlides - 1, safeSlideIndex + 1))}
                    title="Next Slide"
                  >
                    →
                  </button>
                  <span class="slide-counter">Slide ${safeSlideIndex + 1} / ${totalSlides}</span>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  };

  const ActivityPreview = ({ entry }) => {
    const rawData = entry.get('data');
    const data = normalize(rawData) || {};
    const title = data.title || 'Untitled Activity';
    const duration = data.duration || {};
    const license = data.license || {};
    const creators = Array.isArray(data.creators) ? data.creators : [];
    const files = Array.isArray(data.files) ? data.files : [];
    const body = data.body || '';

    return html`
      <div class="main-wrapper" style="padding: 1.5rem 1.75rem 3rem;">
        <nav class="breadcrumbs" style="margin-bottom: 1.5rem;">
          <span>Home</span>
          <span>/</span>
          <span>Activities</span>
          <span>/</span>
          <strong>${title}</strong>
        </nav>

        <article class="page-header" style="margin-bottom: 2rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <span class="collection-badge" style="background: #e0f2fe; color: #0369a1;">Activity</span>
            ${(duration.min || duration.max) && html`
              <span class="element-pill" style="background: #f1f5f9; color: var(--color-dark);">
                ⏱️ ${duration.min || 15}-${duration.max || 45} mins
              </span>
            `}
            ${license.name && html`
              <span class="element-pill" style="background: #ecfdf5; color: #047857;">
                ⚖️ ${license.name}
              </span>
            `}
          </div>

          <h1 class="page-title">${title}</h1>

          ${creators.length > 0 && html`
            <div style="font-size: 0.9rem; color: var(--color-slate); margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
              <strong style="color: var(--color-muted); font-size: 0.85rem;">Attribution:</strong>
              ${creators.map((c, idx) => {
                const cName = typeof c === 'string' ? c : (c.name || 'Unknown');
                const cUrl = typeof c === 'object' ? c.url : '';
                const cRole = typeof c === 'object' ? c.role : '';
                return html`
                  <span key=${idx} class="element-pill" style="background: #f1f5f9; color: var(--color-dark); padding: 0.25rem 0.65rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                    ${cUrl ? html`<a href=${cUrl} target="_blank" rel="noopener" style="font-weight: 700; color: var(--color-primary);">${cName}</a>` : html`<strong style="color: var(--color-dark);">${cName}</strong>`}
                    ${cRole && html`<span style="color: var(--color-muted); font-size: 0.75rem;">(${cRole})</span>`}
                  </span>
                `;
              })}
            </div>
          `}
        </article>

        ${files.length > 0 && html`
          <div class="element-block" style="margin-bottom: 2rem;">
            <div class="element-block-header">
              <span class="element-pill" style="background: #e0f2fe; color: #0369a1;">📁 Files & Attached Resources</span>
            </div>
            <div class="element-block-content">
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${files.map((f, idx) => {
                  const target = f.file || f.url || '';
                  const cleanPath = target.split('?')[0].split('#')[0];
                  const ext = cleanPath.includes('.') ? cleanPath.split('.').pop().toLowerCase() : '';
                  const isPdf = ext === 'pdf';
                  const isHtml = ext === 'html' || ext === 'htm';
                  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'avif'].includes(ext);
                  const canPreview = isPdf || isHtml || isImage;

                  return html`
                    <div key=${idx} style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--color-bg-alt); border-radius: var(--radius-sm); border: 1px solid var(--color-border); flex-wrap: wrap; gap: 0.75rem;">
                      <div style="min-width: 200px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                          <strong style="color: var(--color-dark);">${f.title || 'Untitled file'}</strong>
                          ${ext ? html`
                            <span class="element-pill" style="font-size: 0.68rem; padding: 0.15rem 0.4rem; background: #e2e8f0; color: #475569; font-weight: 700; text-transform: uppercase;">
                              ${ext}
                            </span>
                          ` : ''}
                        </div>
                        ${f.description && html`<div style="font-size: 0.85rem; color: var(--color-muted); margin-top: 0.2rem;">${f.description}</div>`}
                      </div>
                      <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
                        ${canPreview ? html`
                          <span class="action-btn" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            Preview Online
                          </span>
                        ` : ''}
                        ${f.file ? html`
                          <span class="action-btn primary" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download
                          </span>
                        ` : f.url && !canPreview ? html`
                          <span class="action-btn" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">Open Link &rarr;</span>
                        ` : ''}
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          </div>
        `}

        <div class="element-block" style="margin-bottom: 2.5rem;">
          <div 
            class="element-block-content activity-body-container" 
            style="padding: 2.25rem 2.5rem; font-size: 1.05rem; line-height: 1.75;"
            dangerouslySetInnerHTML=${{ __html: renderMarkdown(body) }}
          />
        </div>
      </div>
    `;
  };

  const ModulePreview = ({ entry }) => {
    const rawData = entry.get('data');
    const data = normalize(rawData) || {};
    const title = data.title || 'Untitled Module';
    const description = data.description || '';
    const welcome = data.welcome || '';
    const learning = data.learning || '';
    const discussion = data.discussion || '';
    const action = data.action || '';
    const body = data.body || '';

    return html`
      <div class="main-wrapper" style="padding: 1.5rem 1.75rem 3rem;">
        <nav class="breadcrumbs" style="margin-bottom: 1.5rem;">
          <span>Home</span>
          <span>/</span>
          <span>Modules</span>
          <span>/</span>
          <strong>${title}</strong>
        </nav>

        <article class="page-header" style="margin-bottom: 2rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
            <span class="collection-badge" style="background: var(--color-primary-light); color: var(--color-primary-dark); font-weight: 700;">Workshop Module</span>
            <span class="element-pill" style="background: #f1f5f9; color: var(--color-slate); font-weight: 600;">4 Sections</span>
          </div>
          <h1 class="page-title">${title}</h1>
          ${description && html`<p style="font-size: 1.1rem; color: var(--color-slate); margin: 0; line-height: 1.6;">${description}</p>`}
        </article>

        <!-- Section Navigation Pills in Preview -->
        <div class="module-nav-bar" style="margin-bottom: 1.5rem;">
          <span class="module-nav-label">Module Structure:</span>
          <div class="module-nav-links">
            <span class="module-nav-btn"><span class="step-num">1</span> 👋 Welcome</span>
            <span class="module-nav-btn"><span class="step-num">2</span> 💡 Learning</span>
            <span class="module-nav-btn"><span class="step-num">3</span> 💬 Discussion</span>
            <span class="module-nav-btn"><span class="step-num">4</span> ⚡ Action</span>
          </div>
        </div>

        <div class="module-sections-stream">
          <!-- 1. WELCOME -->
          <section class="module-section-card">
            <div class="module-section-header">
              <span class="section-step-pill">Section 1</span>
              <h2 class="module-section-title">👋 Welcome</h2>
            </div>
            <div class="module-section-content" dangerouslySetInnerHTML=${{ __html: renderMarkdown(welcome) || '<p style="color: #94a3b8; font-style: italic;">No welcome notes added yet.</p>' }} />
          </section>

          <!-- 2. LEARNING -->
          <section class="module-section-card">
            <div class="module-section-header">
              <span class="section-step-pill learning">Section 2</span>
              <h2 class="module-section-title">💡 Learning</h2>
            </div>
            <div class="module-section-content" dangerouslySetInnerHTML=${{ __html: renderMarkdown(learning) || '<p style="color: #94a3b8; font-style: italic;">No learning notes added yet.</p>' }} />
          </section>

          <!-- 3. DISCUSSION -->
          <section class="module-section-card">
            <div class="module-section-header">
              <span class="section-step-pill discussion">Section 3</span>
              <h2 class="module-section-title">💬 Discussion</h2>
            </div>
            <div class="module-section-content" dangerouslySetInnerHTML=${{ __html: renderMarkdown(discussion) || '<p style="color: #94a3b8; font-style: italic;">No discussion notes added yet.</p>' }} />
          </section>

          <!-- 4. ACTION -->
          <section class="module-section-card">
            <div class="module-section-header">
              <span class="section-step-pill action">Section 4</span>
              <h2 class="module-section-title">⚡ Action</h2>
            </div>
            <div class="module-section-content" dangerouslySetInnerHTML=${{ __html: renderMarkdown(action) || '<p style="color: #94a3b8; font-style: italic;">No action notes added yet.</p>' }} />
          </section>

          ${body && html`
            <section class="module-section-card extra-notes">
              <div class="module-section-header">
                <h2 class="module-section-title" style="font-size: 1.25rem;">📝 Additional Facilitator Notes</h2>
              </div>
              <div class="module-section-content" dangerouslySetInnerHTML=${{ __html: renderMarkdown(body) }} />
            </section>
          `}
        </div>
      </div>
    `;
  };

  CMS.registerPreviewTemplate('content_items', ContentItemPreview);
  CMS.registerPreviewTemplate('activities', ActivityPreview);
  CMS.registerPreviewTemplate('modules', ModulePreview);

  // Custom Editor Components (Widgets for inserting shortcodes into rich text)
  if (typeof CMS.registerEditorComponent === 'function') {
    // 1. Activity shortcode widget
    CMS.registerEditorComponent({
      id: 'activity',
      label: 'Activity Card',
      fields: [
        {
          name: 'slug',
          label: 'Select Activity',
          widget: 'relation',
          collection: 'activities',
          value_field: '{{slug}}',
          display_fields: ['title'],
          search_fields: ['title']
        }
      ],
      pattern: /^{{<\s*activity\s+(?:slug=)?["']?([^"'\s>]+)["']?\s*>}}/,
      fromBlock: (match) => ({ slug: match[1] }),
      toBlock: (data) => `{{< activity "${data.slug || ''}" >}}`,
      toPreview: (data) => `<div class="cms-shortcode-preview activity" style="padding: 0.6rem 0.85rem; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; font-size: 0.9rem; color: #0369a1; display: inline-flex; align-items: center; gap: 0.4rem;">⏱️ <strong>Activity:</strong> ${data.slug || 'None selected'}</div>`
    });

    // 2. Content Item shortcode widget
    CMS.registerEditorComponent({
      id: 'content_item',
      label: 'Content Item Card',
      fields: [
        {
          name: 'slug',
          label: 'Select Content Item',
          widget: 'relation',
          collection: 'content_items',
          value_field: '{{slug}}',
          display_fields: ['title'],
          search_fields: ['title']
        }
      ],
      pattern: /^{{<\s*content[-_]item\s+(?:slug=)?["']?([^"'\s>]+)["']?\s*>}}/,
      fromBlock: (match) => ({ slug: match[1] }),
      toBlock: (data) => `{{< content-item "${data.slug || ''}" >}}`,
      toPreview: (data) => `<div class="cms-shortcode-preview content-item" style="padding: 0.6rem 0.85rem; background: #ccfbf1; border: 1px solid #5eead4; border-radius: 6px; font-size: 0.9rem; color: #134e4a; display: inline-flex; align-items: center; gap: 0.4rem;">📑 <strong>Content Item:</strong> ${data.slug || 'None selected'}</div>`
    });

    // 3. Content Collection shortcode widget
    CMS.registerEditorComponent({
      id: 'content_collection',
      label: 'Collection Card',
      fields: [
        {
          name: 'slug',
          label: 'Select Collection',
          widget: 'relation',
          collection: 'content_collections',
          value_field: '{{slug}}',
          display_fields: ['title'],
          search_fields: ['title']
        }
      ],
      pattern: /^{{<\s*(?:content[-_]collection|collection)\s+(?:slug=)?["']?([^"'\s>]+)["']?\s*>}}/,
      fromBlock: (match) => ({ slug: match[1] }),
      toBlock: (data) => `{{< collection "${data.slug || ''}" >}}`,
      toPreview: (data) => `<div class="cms-shortcode-preview collection" style="padding: 0.6rem 0.85rem; background: #fae8ff; border: 1px solid #f0abfc; border-radius: 6px; font-size: 0.9rem; color: #a21caf; display: inline-flex; align-items: center; gap: 0.4rem;">📚 <strong>Collection:</strong> ${data.slug || 'None selected'}</div>`
    });
  }
}

