# TabMan - Multi Tab Manager for Chrome

A Chrome extension that helps you manage and organize your browser tabs with categories, descriptions, and persistent storage.

## Features

- **Right-click Context Menu**: Add any webpage to TabMan by right-clicking and selecting "Add to TabMan"
- **Persistent Storage**: All saved tabs remain available even after closing the browser
- **Organized Dashboard**: View all saved tabs in a clean, tabular format with:
  - Website favicon
  - Page title
  - URL (clickable to open in new tab)
  - Category (customizable)
  - Description (customizable)
  - Date added
- **Search & Filter**: Quickly find tabs using the search bar or filter by category
- **Edit Functionality**: Update category and description for any saved tab
- **Delete Tabs**: Remove tabs you no longer need
- **Quick Open**: Open any saved tab with one click

## Testing

TabMan includes a comprehensive test suite to ensure all functionality works correctly.

**Run tests:** Open `tests/test-runner.html` in your browser

**Quick guide:** See [TESTING.md](TESTING.md) for testing instructions

**Full documentation:** See [tests/README.md](tests/README.md) for detailed test documentation

The test suite covers:
- Context menu creation and interaction
- Tab storage and retrieval (30+ tests)
- CRUD operations
- Search and filtering
- Data validation and integrity
- XSS prevention

## Installation

### Step 1: Generate Icons

1. Open `create_icons.html` in your browser
2. Download all three icon files (icon16.png, icon48.png, icon128.png)
3. Move the downloaded files to the `icons/` folder

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Select the TabMan folder (the folder containing manifest.json)
5. The extension should now appear in your extensions list

## Usage

### Adding Tabs

1. Navigate to any webpage you want to save
2. Right-click anywhere on the page
3. Select "Add to TabMan" from the context menu
4. The tab is now saved and can be viewed in the dashboard

### Viewing Saved Tabs

1. Click the TabMan icon in your Chrome toolbar
2. The dashboard will open showing all your saved tabs

### Organizing Tabs

1. Click the "Edit" button next to any tab
2. Update the category (choose from presets or create your own)
3. Add a description to help remember why you saved it
4. Click "Save"

### Searching & Filtering

- Use the search box to find tabs by title, URL, or description
- Use the category dropdown to filter tabs by category

### Opening Tabs

- Click the "Open" button to open the tab in a new browser tab
- Or click directly on the URL

### Deleting Tabs

- Click the "Delete" button next to any tab
- Confirm the deletion when prompted

## File Structure

```
TabMan/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker (context menu)
├── dashboard.html         # Main dashboard interface
├── dashboard.js           # Dashboard functionality
├── styles.css            # Dashboard styling
├── create_icons.html     # Icon generator tool
├── icons/
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
└── README.md            # This file
```

## Technical Details

### Storage

- Uses Chrome's `chrome.storage.local` API for persistent storage
- Data persists across browser sessions
- Each tab entry includes:
  - Unique ID (timestamp-based)
  - URL
  - Title
  - Favicon URL
  - Category
  - Description
  - Date added

### Permissions

The extension requires the following permissions:
- `contextMenus`: To add right-click menu option
- `storage`: To save tabs persistently
- `tabs`: To access tab information and create new tabs

## Customization

### Adding Default Categories

Edit the datalist in `dashboard.html` (line 47-53) to add your preferred categories:

```html
<datalist id="categories">
  <option value="Work">
  <option value="Personal">
  <option value="Research">
  <option value="Shopping">
  <option value="Entertainment">
  <!-- Add more categories here -->
</datalist>
```

### Changing Colors

Modify the gradient colors in `styles.css`:
- Line 9: Background gradient
- Line 65: Table header gradient
- Line 133: Category badge gradient
- Line 329: Button gradient

### Custom Icons

Replace the icon files in the `icons/` folder with your own designs (must be PNG format and exact sizes: 16x16, 48x48, 128x128).

## Troubleshooting

### Extension doesn't appear after installation
- Make sure Developer mode is enabled in `chrome://extensions/`
- Check that all required files are present
- Try reloading the extension

### Context menu not showing
- Refresh the webpage after installing the extension
- Check that the extension is enabled in `chrome://extensions/`

### Tabs not saving
- Check the browser console for errors (F12 > Console)
- Verify storage permissions are granted

### Icons not displaying
- Make sure icon files are in the `icons/` folder
- Ensure files are named exactly as specified
- Try reloading the extension

## Future Enhancements

Potential features for future versions:
- Export/import tabs as JSON or CSV
- Tab groups/collections
- Tags for better organization
- Bulk operations (delete multiple, change categories)
- Dark mode
- Keyboard shortcuts
- Cloud sync across devices

## License

This project is free to use and modify for personal and educational purposes.

## Support

For issues or questions, please check the troubleshooting section above or review the code comments for implementation details.
