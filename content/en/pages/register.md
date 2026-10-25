---
title: "Register a Community Assembly"
description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
weight: 50
group: register
stage: ""
draft: false
aliases:
  - /register/
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Registration Form (Prototype)

<form class="handbook-form" onsubmit="event.preventDefault(); alert('Registration prototype submitted!');" aria-label="Register a community assembly">
  <div class="form-group">
    <label for="reg-name"><strong>Lorem Ipsum Name</strong></label>
    <input type="text" id="reg-name" name="name" placeholder="Lorem ipsum dolor..." class="form-input" required />
  </div>

  <div class="form-group">
    <label for="reg-org"><strong>Lorem Ipsum Organisation</strong></label>
    <input type="text" id="reg-org" name="organization" placeholder="Consectetur adipiscing..." class="form-input" required />
  </div>

  <div class="form-group">
    <label for="reg-email"><strong>Lorem Ipsum Email</strong></label>
    <input type="email" id="reg-email" name="email" placeholder="lorem@example.org" class="form-input" required />
  </div>

  <div class="form-group">
    <label for="reg-location"><strong>Lorem Ipsum Location</strong></label>
    <input type="text" id="reg-location" name="location" placeholder="Civitas, Regio..." class="form-input" />
  </div>

  <div class="form-group">
    <label for="reg-date"><strong>Lorem Ipsum Date</strong></label>
    <input type="date" id="reg-date" name="date" class="form-input" />
  </div>

  <div class="form-group">
    <label><strong>Lorem Ipsum Topics</strong></label>
    <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.25rem;">
      <label><input type="checkbox" name="topic" value="1"> 1. AI: Hopes and Fears</label>
      <label><input type="checkbox" name="topic" value="2"> 2. AI Safety & Security</label>
      <label><input type="checkbox" name="topic" value="3"> 3. Infrastructure & Data Centres</label>
      <label><input type="checkbox" name="topic" value="4"> 4. Language and Diversity</label>
      <label><input type="checkbox" name="topic" value="5"> 5. AI Governance</label>
    </div>
  </div>

  <div class="form-group">
    <label for="reg-notes"><strong>Lorem Ipsum Notes</strong></label>
    <textarea id="reg-notes" name="notes" rows="4" placeholder="Duis aute irure dolor in reprehenderit..." class="form-input"></textarea>
  </div>

  <button type="submit" class="view-item-link" style="background: var(--ct-color-fjord, #00447C); color: #FFFFFF; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem;">
    Submit Registration &rarr;
  </button>
</form>
