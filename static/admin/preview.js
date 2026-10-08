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

  function renderMarkdown(md) {
    if (md == null || md === '') return '';
    const str = String(md);
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
                      <div class="card-face card-face-front">
                        <div class="card-face-header">
                          <span class="element-pill ${el.type}">
                            ${el.type === 'quiz_question' ? 'Quiz Question' :
                              el.type === 'statistic' ? 'Statistic' :
                              el.type === 'perspective' ? 'Perspective' :
                              el.type === 'information' ? 'Concept' : 'Takeaways'}
                          </span>
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
                          ${el.type === 'information' && html`
                            <div class="card-main-title" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                          `}
                          ${el.type === 'takeaways' && html`
                            <div class="card-main-title" style="color: #86198f;">Key Takeaways</div>
                            <div style="font-size: 0.95rem; color: var(--color-slate);">Flip for summary points</div>
                          `}
                        </div>

                        <div class="card-face-footer">
                          <span class="card-side-tag front">Front Side</span>
                          <span class="card-flip-btn">Flip to Back →</span>
                        </div>
                      </div>

                      <!-- BACK -->
                      <div class="card-face card-face-back">
                        <div class="card-face-header">
                          <span class="element-pill" style="background: #e0f2fe; color: #0369a1;">
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
                            <div style="font-size: 0.95rem; line-height: 1.5;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                          `}
                          ${el.type === 'takeaways' && html`
                            <div style="font-size: 0.9rem; line-height: 1.5;" dangerouslySetInnerHTML=${{ __html: renderMarkdown(el.text) }} />
                          `}

                          ${el.citation && html`
                            <div class="citation-line" style="margin-top: 0.5rem; font-size: 0.7rem;">
                              Source: ${el.citation}
                            </div>
                          `}
                        </div>

                        <div class="card-face-footer">
                          <span class="card-side-tag back">Back Side</span>
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
                ${files.map((f, idx) => html`
                  <div key=${idx} style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; background: var(--color-bg-alt); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                    <div>
                      <strong style="color: var(--color-dark);">${f.title || 'Untitled file'}</strong>
                      ${f.description && html`<div style="font-size: 0.85rem; color: var(--color-muted);">${f.description}</div>`}
                    </div>
                    ${f.file ? html`
                      <span class="action-btn primary" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;">Download File</span>
                    ` : f.url ? html`
                      <span class="action-btn" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;">Open Link &rarr;</span>
                    ` : ''}
                  </div>
                `)}
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

  CMS.registerPreviewTemplate('content_items', ContentItemPreview);
  CMS.registerPreviewTemplate('activities', ActivityPreview);
}

