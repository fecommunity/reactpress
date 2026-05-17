#!/bin/sh
# Remove Cursor attribution trailers; GitHub counts Co-authored-by as contributors.
strip_cursor_attribution() {
  sed -e '/^Co-authored-by: Cursor <cursoragent@cursor.com>$/d' \
      -e '/^Co-authored-by: Cursor Agent/d' \
      -e '/^Co-authored-by: Cursor </d' \
      -e '/^Co-authored-by: Cursor$/d' \
      -e '/^Made-with: Cursor/d'
}
