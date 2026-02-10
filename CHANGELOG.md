# Changelog

All notable changes to the TabMan Chrome Extension will be documented in this file.

## [1.2.0] - 2026-02-10

### Enhanced
- **UI Overhaul**: Complete redesign of the dashboard for a more modern and intuitive experience.
- **Styling**: Updated `styles.css` with improved gradients, spacing, and responsive layout.
- **Performance**: Refactored `dashboard.js` for smoother interactions and better state management.
- **Usability**: Improved empty state messaging and clear "Save Current Tab" actions.

## [1.1.0] - 2025-10-25

### Added - Universal Tab Support

#### New Features
- **Universal Compatibility**: Extension now works on ALL tab types including:
  - Google Docs, Sheets, Slides, and Forms
  - PDF files (both web-based and local)
  - Image files, videos, and audio files
  - All standard webpages
  - Special Chrome pages (chrome://, chrome-extension://, etc.)

- **Multiple Save Methods**: Users can now save tabs using:
  - Right-click context menu (expanded to all contexts)
  - "Save Current Tab" button in the dashboard popup
  - Keyboard shortcut: `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
  - Extension icon click (for special pages where context menu doesn't work)

- **Visual Feedback**:
  - Success indicator (✅) appears on "Save Current Tab" button
  - Error indicator (❌) shows if save fails
  - Badge notification on extension icon for special tabs

- **Enhanced Context Menu**: Now available in multiple contexts:
  - Page (regular pages)
  - Frame (iframes)
  - Selection (when text is selected)
  - Link (on hyperlinks)
  - Editable (in text fields)
  - Image, Video, Audio (on media elements)

### Changed

- **Manifest Version**: Updated from 1.0.0 to 1.1.0
- **Permissions**: Added `activeTab` permission and `<all_urls>` host permissions
- **Dashboard UI**: Added prominent "Save Current Tab" button in controls section
- **Empty State**: Updated messaging to reflect all save methods
- **Documentation**: Comprehensive updates to README.md with all new features

### Technical Improvements

- **background.js**:
  - Added `chrome.action.onClicked` listener for special tab handling
  - Implemented `isSpecialTab()` function to detect restricted URLs
  - Badge text feedback for save confirmation
  - Expanded context menu to 8 different contexts

- **dashboard.js**:
  - New `handleSaveCurrentTab()` async function
  - Visual button state management with success/error feedback
  - Active tab detection using `chrome.tabs.query()`

- **dashboard.html**:
  - Added "Save Current Tab" button with emoji icon
  - Updated empty state hints

- **styles.css**:
  - New `.btn-save-current` class with gradient styling
  - Hover and active states for better UX
  - Responsive control layout

- **manifest.json**:
  - Added keyboard shortcut command
  - Added `default_title` for extension action
  - Added `host_permissions` for universal access

### Fixed

- Context menu now works on Google Workspace documents (Docs, Sheets, Slides)
- Can save PDF tabs that were previously unsupported
- Special Chrome pages (settings, extensions, etc.) can now be saved via button
- Media-only tabs (images, videos) are fully supported

---

## [1.0.0] - 2025-10-25

### Initial Release

#### Core Features
- Right-click context menu to save tabs
- Persistent storage using Chrome Storage API
- Dashboard with tabular view of saved tabs
- Search functionality (by title, URL, description)
- Category filtering
- Edit tab details (category and description)
- Delete saved tabs
- Open tabs in new browser tab
- Custom categories support

#### Testing
- Comprehensive test suite with 30+ tests
- Custom test framework
- Mock Chrome APIs
- Visual test runner interface
- Tests for CRUD operations, search, filtering, and data integrity

#### Documentation
- Complete README.md
- Testing documentation (TESTING.md, TEST-SUMMARY.md)
- HOW-TO-TEST.txt quick guide
- Icon generator tool (create_icons.html)

#### Files
- manifest.json (v3)
- background.js (service worker)
- dashboard.html, dashboard.js, styles.css
- Icon files (16x16, 48x48, 128x128)
- Comprehensive test suite in tests/ directory
- .gitignore for project cleanliness

---

## Future Enhancements (Planned)

### Potential Features
- [ ] Export/import saved tabs (JSON, CSV)
- [ ] Tab collections/groups
- [ ] Tag system for better organization
- [ ] Bulk operations (select multiple tabs)
- [ ] Dark mode support
- [ ] Cloud sync across devices
- [ ] Tab history and versioning
- [ ] Duplicate detection
- [ ] Auto-categorization using AI/ML
- [ ] Browser bookmark import
- [ ] Notes/annotations for saved tabs
- [ ] Reminder system for important tabs
- [ ] Analytics (most visited categories, etc.)

### Technical Improvements
- [ ] IndexedDB for larger storage capacity
- [ ] Service worker optimization
- [ ] Progressive Web App (PWA) version
- [ ] Firefox and Edge compatibility
- [ ] Internationalization (i18n)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance monitoring
- [ ] Error tracking and reporting

---

## Version Numbering

TabMan follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for added functionality (backwards compatible)
- **PATCH** version for backwards compatible bug fixes

## Support

For issues, bug reports, or feature requests:
- GitHub Issues: https://github.com/Shashwat-Nandan/TabMan/issues
- Repository: https://github.com/Shashwat-Nandan/TabMan
