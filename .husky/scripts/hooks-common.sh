#!/bin/sh
# Shared helpers for root husky hooks and web/.vite-hooks forwards.

REPO_GIT_USER_NAME="${REPO_GIT_USER_NAME:-FECommunity}"
REPO_GIT_USER_EMAIL="${REPO_GIT_USER_EMAIL:-admin@gaoredu.com}"
# Space-separated legacy author names rewritten on commit.
LEGACY_GIT_USER_NAMES="${LEGACY_GIT_USER_NAMES:-m0_37981569}"

_is_legacy_git_user() {
  case "$1" in
    m0_37981569) return 0 ;;
    *) return 1 ;;
  esac
}

normalize_git_identity() {
  current_name="$(git config user.name 2>/dev/null || true)"
  if [ "$current_name" = "$REPO_GIT_USER_NAME" ]; then
    return 0
  fi
  if _is_legacy_git_user "$current_name"; then
    export GIT_AUTHOR_NAME="$REPO_GIT_USER_NAME"
    export GIT_AUTHOR_EMAIL="$REPO_GIT_USER_EMAIL"
    export GIT_COMMITTER_NAME="$REPO_GIT_USER_NAME"
    export GIT_COMMITTER_EMAIL="$REPO_GIT_USER_EMAIL"
  fi
}

strip_cursor_attribution() {
  sed -e '/^Co-authored-by: Cursor <cursoragent@cursor.com>$/d' \
      -e '/^Co-authored-by: Cursor Agent/d' \
      -e '/^Co-authored-by: Cursor </d' \
      -e '/^Co-authored-by: Cursor$/d' \
      -e '/^Made-with: Cursor/d'
}

sanitize_commit_message_file() {
  commit_msg_file=$1
  [ -f "$commit_msg_file" ] || return 0
  strip_cursor_attribution < "$commit_msg_file" > "${commit_msg_file}.tmp" &&
    mv "${commit_msg_file}.tmp" "$commit_msg_file"
}

commit_has_cursor_attribution() {
  git log -1 --format=%B 2>/dev/null | grep -qE '^Co-authored-by:.*[Cc]ursor|^Made-with:.*[Cc]ursor'
}

commit_needs_author_fixup() {
  author_name="$(git log -1 --format=%an 2>/dev/null || true)"
  _is_legacy_git_user "$author_name"
}

fixup_last_commit_if_needed() {
  [ "$HUSKY_FIXUP_AMENDING" = "1" ] && return 0

  needs_author=0
  needs_msg=0
  if commit_needs_author_fixup; then
    needs_author=1
  fi
  if commit_has_cursor_attribution; then
    needs_msg=1
  fi
  if [ "$needs_author" = "0" ] && [ "$needs_msg" = "0" ]; then
    return 0
  fi

  export HUSKY_FIXUP_AMENDING=1
  author="--author=${REPO_GIT_USER_NAME} <${REPO_GIT_USER_EMAIL}>"

  if [ "$needs_msg" = "1" ]; then
    git log -1 --format=%B | strip_cursor_attribution | git commit --amend --no-verify "$author" -F -
  else
    git commit --amend --no-verify "$author" --no-edit
  fi
}
