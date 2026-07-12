# Upload Rules

> **Uploads are currently disabled.** The MCP server runs with no allowed
> upload directories, so the `upload-file` tool is unavailable. **Do not attempt
> to upload files.** Everything below this banner is the policy that takes
> effect when uploads are enabled later.

This document is the **single owner** of upload policy for AI agents on the
NITC Wiki (AGENTS.md §5 and the skills point here).

---

## Allowed formats

| Format | Extensions | Max file size | Notes |
|---|---|---|---|
| PNG | `.png` | 10 MB | Preferred for screenshots and diagrams |
| JPEG | `.jpg`, `.jpeg` | 10 MB | Preferred for photographs |
| SVG | `.svg` | 5 MB | Preferred for logos and illustrations |
| GIF (animated) | `.gif` | 5 MB | Use only when animation is essential |
| GIF (static) | `.gif` | 10 MB | Prefer PNG over static GIF |

## Prohibited formats

- Executables (`.exe`, `.bin`, `.sh`, `.bat`)
- Archives (`.zip`, `.rar`, `.tar`, `.gz`, `.7z`)
- Documents (`.doc`, `.docx`, `.xls`, `.pptx`) — convert to PDF if needed
- Audio (`.mp3`, `.wav`, `.ogg`) except for educational media
- Video (`.mp4`, `.avi`, `.mov`) except for educational media
- Font files (`.ttf`, `.otf`, `.woff`)

## Naming conventions

Format: `Topic-Description.ext`

Correct:
- `FOSSMeet-2025-group-photo.jpg`
- `Ragam-2025-poster.png`
- `NITC-campus-map.svg`
- `CodeInit-workshop-slide-1.png`

Incorrect:
- `image1.jpg` (not descriptive)
- `Ragam 2025 poster.png` (spaces — use hyphens)
- `POSTER.PNG` (all caps)
- `Screenshot_2025-01-01_at_12.00.00.png` (auto-generated name)

## License tags

Every upload must include exactly one license template on the file description page:

| License | Template |
|---|---|
| Creative Commons Attribution-ShareAlike 4.0 | `{{CC-BY-SA-4.0}}` |
| Creative Commons Attribution 4.0 | `{{CC-BY-4.0}}` |
| Own work, public domain | `{{PD-self}}` |
| GNU Free Documentation License | `{{GFDL}}` |
| Wikimedia Commons import | `{{From Wikimedia Commons}}` |

> Verify the license template exists (`get-page` on `Template:<name>`) before
> using it — this table lists intent, the live wiki is the authority.

## Upload procedure for agents (when uploads are enabled)

1. Verify the file format is in the allowed list.
2. Verify the file size is under the limit.
3. Construct a descriptive filename following naming conventions.
4. Upload using the `upload-file` or `upload-file-from-url` tool.
5. After upload, edit the file description page to add the license template and a summary.
6. Add the file to appropriate categories (e.g., `Category:Files/Posters`).

## Prohibited uploads

- Non-free / fair use content. The wiki is licensed under CC-BY-SA 4.0.
- Files with no license tag — these will be deleted by sysops.
- Copyrighted material without explicit permission from the copyright holder.
- Personal photos not related to wiki content.
- Duplicates of existing files (use `Special:FileDuplicateSearch` to check).
