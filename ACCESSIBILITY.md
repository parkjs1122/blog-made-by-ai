# Accessibility Testing Guide

This document provides guidelines for manual accessibility testing, particularly for screen reader testing and keyboard navigation verification.

## Table of Contents
- [Screen Reader Testing](#screen-reader-testing)
- [Keyboard Navigation Testing](#keyboard-navigation-testing)
- [WCAG Compliance Checklist](#wcag-compliance-checklist)
- [Common Issues and Fixes](#common-issues-and-fixes)

## Screen Reader Testing

### Recommended Screen Readers

#### Windows
- **NVDA (NonVisual Desktop Access)** - Free, open-source
  - Download: https://www.nvaccess.org/
  - Shortcut: `Ctrl + Alt + N` to start/stop
  - Navigate: `↓ ↑` arrows to read line by line
  - Headings: `H` to jump between headings
  - Links: `K` to jump between links
  - Buttons: `B` to jump between buttons

#### macOS
- **VoiceOver** - Built-in
  - Start/Stop: `Cmd + F5`
  - Navigate: `Ctrl + Option + →/←` arrows
  - Interact: `Ctrl + Option + Space`
  - Rotor: `Ctrl + Option + U` (navigate by headings, links, etc.)

#### Linux
- **Orca** - Free, open-source
  - Start: `Super + Alt + S`
  - Navigate: Arrow keys
  - Links: `K` to jump between links

### Screen Reader Testing Checklist

#### 1. Page Structure
- [ ] All headings are announced in correct order (h1 → h2 → h3)
- [ ] Main landmarks are announced (header, nav, main, aside, footer)
- [ ] Skip links allow jumping to main content
- [ ] Page title is descriptive and announced on load

#### 2. Navigation
- [ ] All navigation menus are announced with proper labels
- [ ] Current page is indicated in navigation
- [ ] Breadcrumbs (if present) are announced correctly
- [ ] All links have descriptive text (avoid "click here")

#### 3. Interactive Elements
- [ ] All buttons have clear labels or aria-labels
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced

#### 4. Images and Media
- [ ] All images have alt text describing the content
- [ ] Decorative images have empty alt="" or role="presentation"
- [ ] SVG icons have aria-hidden="true" or aria-label
- [ ] Image captions are associated with images

#### 5. Forms
- [ ] All form fields have labels
- [ ] Required fields are indicated
- [ ] Error messages are clear and associated with fields
- [ ] Instructions are announced before form fields
- [ ] Form submit confirmation is announced

#### 6. Dynamic Content
- [ ] ARIA live regions announce updates
- [ ] Loading indicators are announced
- [ ] Modal dialogs trap focus and announce title
- [ ] Dismissible notifications are announced

### Testing Procedure

1. **Initial Page Load**
   ```
   - Start screen reader
   - Navigate to page
   - Listen for page title
   - Verify main heading is announced
   ```

2. **Navigate by Headings**
   ```
   - Press H (NVDA/JAWS) or Ctrl+Option+Cmd+H (VoiceOver)
   - Verify all major sections have headings
   - Check heading hierarchy is logical
   ```

3. **Navigate by Links**
   ```
   - Press K (NVDA/JAWS) or use Rotor (VoiceOver)
   - Verify all link text is descriptive
   - Check external links are indicated
   ```

4. **Navigate by Form Elements**
   ```
   - Press F (NVDA/JAWS)
   - Verify all fields have labels
   - Check error messages are announced
   ```

5. **Test Interactive Components**
   ```
   - Navigate to buttons, toggle switches, etc.
   - Verify state changes are announced (e.g., "expanded", "collapsed")
   - Check keyboard shortcuts are announced
   ```

## Keyboard Navigation Testing

### Basic Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate links and buttons |
| `Space` | Activate buttons and checkboxes |
| `Escape` | Close modals and menus |
| `Arrow Keys` | Navigate within components (menus, tabs) |

### Keyboard Testing Checklist

#### 1. Focus Management
- [ ] All interactive elements are focusable with Tab
- [ ] Focus order follows visual layout
- [ ] Focus indicator is clearly visible
- [ ] No keyboard traps (can always Tab out)
- [ ] Skip links allow bypassing navigation

#### 2. Interactive Elements
- [ ] Buttons activate with Enter and Space
- [ ] Links activate with Enter
- [ ] Dropdowns work with arrow keys
- [ ] Checkboxes toggle with Space
- [ ] Radio buttons navigate with arrows

#### 3. Modal Dialogs
- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Escape closes modal
- [ ] Focus returns to trigger element when closed

#### 4. Menus and Dropdowns
- [ ] Arrow keys navigate menu items
- [ ] Enter selects menu items
- [ ] Escape closes menu
- [ ] First letter navigation works (optional)

### Testing Procedure

1. **Disconnect Mouse**
   - Use only keyboard for all interactions
   - Attempt to complete all user flows

2. **Tab Through Page**
   ```
   - Press Tab repeatedly
   - Verify all interactive elements are reached
   - Check focus indicator is visible
   - Ensure logical tab order
   ```

3. **Test Each Component**
   ```
   - Theme toggle: Tab, Enter/Space to activate
   - Search: Tab to input, type query, Enter to search
   - Post cards: Tab to links, Enter to navigate
   - Tags: Tab to tag links, Enter to filter
   ```

4. **Test Forms**
   ```
   - Tab through all fields
   - Use Space for checkboxes
   - Use arrows for radio buttons
   - Press Enter to submit
   ```

## WCAG Compliance Checklist

### Level A (Minimum)
- [ ] All images have alt text
- [ ] Color is not the only way to convey information
- [ ] All functionality available from keyboard
- [ ] No keyboard traps
- [ ] Page titles are descriptive
- [ ] Link purpose is clear from link text
- [ ] Multiple ways to navigate (search, menu, sitemap)
- [ ] Headings and labels are descriptive
- [ ] Focus is visible

### Level AA (Recommended)
- [ ] Color contrast ratio at least 4.5:1 for normal text
- [ ] Color contrast ratio at least 3:1 for large text
- [ ] Text can be resized to 200% without loss of functionality
- [ ] Images of text are avoided (use actual text)
- [ ] Multiple ways to find content
- [ ] Consistent navigation across pages
- [ ] Consistent identification of components
- [ ] Error messages provide suggestions
- [ ] Labels are present for all form inputs

### Level AAA (Enhanced)
- [ ] Color contrast ratio at least 7:1 for normal text
- [ ] Color contrast ratio at least 4.5:1 for large text
- [ ] No images of text (except logos)
- [ ] Section headings organize content
- [ ] Unusual words are defined
- [ ] Abbreviations are explained

## Common Issues and Fixes

### Issue: Missing Alt Text
**Problem**: Images don't have alt attributes
**Fix**:
```tsx
// Bad
<img src="/photo.jpg" />

// Good
<img src="/photo.jpg" alt="Person coding on laptop" />

// Decorative
<img src="/decoration.svg" alt="" role="presentation" />
```

### Issue: Poor Link Text
**Problem**: Links say "click here" or "read more"
**Fix**:
```tsx
// Bad
<a href="/post">Click here</a>

// Good
<a href="/post">Read the full article about Next.js</a>
```

### Issue: Missing Form Labels
**Problem**: Form inputs don't have associated labels
**Fix**:
```tsx
// Bad
<input type="text" placeholder="Name" />

// Good
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// Or with aria-label
<input type="text" aria-label="Name" />
```

### Issue: No Focus Indicator
**Problem**: Can't see where focus is
**Fix**:
```css
/* Good focus styles */
:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Don't remove outline without replacement */
/* Bad */
* { outline: none; }
```

### Issue: Icon Buttons Without Labels
**Problem**: Buttons with only icons aren't accessible
**Fix**:
```tsx
// Bad
<button><SearchIcon /></button>

// Good
<button aria-label="Search posts">
  <SearchIcon aria-hidden="true" />
</button>
```

### Issue: Low Color Contrast
**Problem**: Text is hard to read
**Fix**:
```css
/* Bad - too light */
.text { color: #aaa; background: #fff; }

/* Good - sufficient contrast */
.text { color: #333; background: #fff; }
```

### Issue: Keyboard Trap
**Problem**: Can't Tab out of component
**Fix**:
```tsx
// Bad
const handleKeyDown = (e) => {
  e.preventDefault() // Traps all keys
}

// Good
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    closeModal()
  }
  // Allow Tab to work normally
}
```

## Automated Testing

### Running Accessibility Tests

```bash
# Run WCAG compliance tests
npm test -- --run __tests__/accessibility/wcag.test.tsx

# Run keyboard navigation tests
npm test -- --run __tests__/accessibility/keyboard-navigation.test.tsx

# Run all accessibility tests
npm test -- --run __tests__/accessibility
```

### Browser Extensions

- **axe DevTools** - Free accessibility scanner
  - Chrome: https://chrome.google.com/webstore
  - Firefox: https://addons.mozilla.org/

- **WAVE** - Web accessibility evaluation tool
  - Chrome/Firefox extension available

- **Lighthouse** - Built into Chrome DevTools
  - Run: DevTools → Lighthouse → Accessibility audit

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Screen Reader Guide](https://webaim.org/articles/screenreader_testing/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Deque axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

## Continuous Testing

1. **During Development**
   - Use browser extensions (axe DevTools)
   - Test with keyboard only
   - Check color contrast
   - Add accessibility tests for new components

2. **Before Deployment**
   - Run automated accessibility tests
   - Manual keyboard testing
   - Screen reader spot checks
   - Lighthouse audit

3. **After Deployment**
   - Monitor real user feedback
   - Regular accessibility audits
   - Update as standards evolve
