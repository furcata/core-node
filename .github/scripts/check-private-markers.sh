#!/usr/bin/env bash
#
# check-private-markers.sh
#
# This is a PUBLIC repository. This package is consumed by other services that
# are not public, and the operational details of those services must not appear
# here. The leak vector is not only documentation: it is every code comment,
# config comment, test fixture, commit message, pull request title and pull
# request body. A marker written in good faith by someone who simply did not
# know a repository was public is the realistic failure mode, so this check is
# automated rather than left to review.
#
# It scans, in order:
#   1. tracked files in the working tree
#   2. commit messages in the range under review
#   3. commit authorship (attribution trailers are not permitted here)
#
# The marker patterns are ASSEMBLED FROM FRAGMENTS below rather than written as
# literals. If they were written literally this script would match itself, and
# the only ways out of that are to exclude the script from its own scan — which
# turns it into a blind spot — or to publish the very strings it exists to
# block. Assembling them keeps the file both self-consistent and clean.
#
# CONSEQUENTLY THIS FILE IS **NOT** EXEMPT FROM ITS OWN SCAN, and must never be
# made exempt. There is no allow-list and no skipped path, so this file is not a
# blind spot: a real marker written here is caught exactly like a marker written
# anywhere else. That was verified by planting a synthetic finding-style
# identifier in this file and observing the check fail, citing this file's own
# line number. An exempted path is somewhere a real marker could be hidden, and
# an undocumented exempted path is how that rots quietly — so the correct design
# is no exemption at all, and the fragment assembly above is what makes that
# possible.
#
# Usage:
#   check-private-markers.sh --self-test   prove the patterns detect a synthetic marker
#   check-private-markers.sh [RANGE]       scan files, commit messages and authorship
#                                          RANGE defaults to origin/main..HEAD
set -uo pipefail

# --- pattern assembly (no private literal appears in this file) --------------
ORG='fur'"cata"

# Case-insensitive: names of non-public sibling repositories and environments.
PAT_NAMES="${ORG}/(functions|app|config)|${ORG}-(production|staging)"

# Case-sensitive and word-bounded: internal tracker / finding identifiers.
# Deliberately narrow. A looser form (an unbounded, case-insensitive "W[0-5]")
# was measured against this repository and produced 105 false positives — 101
# from base64 integrity hashes in package-lock.json and 4 from a video id in a
# test fixture — against 0 true positives. A check that cries wolf on every
# lockfile refresh is one that gets commented out, which is the same inert
# outcome as having no check at all.
PAT_IDS='\bORCH-[0-9]+\b|\bFN-M-[0-9]+\b|\b[HM]-0[0-9]\b|\bW[0-5] wave\b'

ATTRIB='[Cc]o-authored-by:'

fail=0

note() { printf '%s\n' "$*"; }
err()  { printf '::error::%s\n' "$*" >&2; }

# --- self test ---------------------------------------------------------------
# A guard that has never been observed rejecting anything is a hypothesis, not a
# control. This runs on every CI invocation, so the patterns are demonstrated
# live rather than trusted. The probe strings are built at runtime from split
# fragments: nothing greppable is written to disk and nothing is published.
self_test() {
  local rc=0 tmp
  tmp="$(mktemp -d)"

  # Positive control: each class must match a synthetic instance.
  {
    printf '%s/%s\n' "$ORG" "functions"
    printf '%s-%s\n' "$ORG" "production"
    printf 'ORCH-%s\n' "42"
    printf 'FN-M-%s\n' "7"
    printf 'H-%s\n' "01"
    printf 'W%s wave\n' "0"
  } > "$tmp/positive.txt"

  local want=6 got_names got_ids got
  got_names=$(grep -ciE "$PAT_NAMES" "$tmp/positive.txt" || true)
  got_ids=$(grep -cE "$PAT_IDS" "$tmp/positive.txt" || true)
  got=$(( got_names + got_ids ))
  if [ "$got" -ne "$want" ]; then
    err "self-test FAILED: patterns matched $got/$want synthetic markers"
    rc=1
  else
    note "self-test: positive control OK ($got/$want synthetic markers detected)"
  fi

  # Attribution trailer control.
  printf 'Co-authored-by: Someone <x@example.com>\n' > "$tmp/attrib.txt"
  if ! grep -qE "$ATTRIB" "$tmp/attrib.txt"; then
    err "self-test FAILED: attribution pattern did not match a synthetic trailer"
    rc=1
  else
    note "self-test: attribution control OK"
  fi

  # Negative control: ordinary text must NOT match, otherwise a pass is noise.
  printf 'An ordinary sentence about a TypeScript model library.\n' > "$tmp/negative.txt"
  if grep -qiE "$PAT_NAMES" "$tmp/negative.txt" || grep -qE "$PAT_IDS" "$tmp/negative.txt"; then
    err "self-test FAILED: patterns matched clean text (false positive)"
    rc=1
  else
    note "self-test: negative control OK (clean text not matched)"
  fi

  rm -rf "$tmp"
  return "$rc"
}

# --- file scan ---------------------------------------------------------------
scan_files() {
  local hits hits_ids
  hits="$(git ls-files -z | xargs -0 grep -nIiE "$PAT_NAMES" 2>/dev/null || true)"
  hits_ids="$(git ls-files -z | xargs -0 grep -nIE "$PAT_IDS" 2>/dev/null || true)"

  if [ -n "$hits" ] || [ -n "$hits_ids" ]; then
    err "private markers found in tracked files"
    [ -n "$hits" ] && printf '%s\n' "$hits"
    [ -n "$hits_ids" ] && printf '%s\n' "$hits_ids"
    fail=1
  else
    note "files: clean"
  fi
}

# --- commit message scan -----------------------------------------------------
# Commit messages never appear in a file diff, so they are the easiest place for
# a marker to survive review untouched.
scan_commits() {
  local range="$1" msgs
  if ! git rev-parse --quiet --verify "${range%%..*}" >/dev/null 2>&1; then
    note "commits: range '$range' unavailable, scanning HEAD only"
    msgs="$(git log -1 --format='%B' 2>/dev/null || true)"
  else
    msgs="$(git log "$range" --format='%H%n%B' 2>/dev/null || true)"
  fi

  if [ -z "$msgs" ]; then
    note "commits: no commit messages in range"
    return
  fi

  if printf '%s' "$msgs" | grep -qiE "$PAT_NAMES" || printf '%s' "$msgs" | grep -qE "$PAT_IDS"; then
    err "private markers found in commit messages in range $range"
    printf '%s' "$msgs" | grep -niE "$PAT_NAMES" || true
    printf '%s' "$msgs" | grep -nE "$PAT_IDS" || true
    fail=1
  else
    note "commits: messages clean"
  fi

  if printf '%s' "$msgs" | grep -qE "$ATTRIB"; then
    err "attribution trailer found in a commit message in range $range"
    fail=1
  else
    note "commits: no attribution trailer in messages"
  fi
}

# --- authorship scan ---------------------------------------------------------
# A clean message check is necessary but not sufficient. A squash merge can
# synthesise an attribution trailer server-side from the AUTHORSHIP of the
# squashed commits, so a branch whose every message greps clean still produces
# one if an author differs from the merging identity. No local message hook can
# intercept that, because it never runs.
scan_authorship() {
  local range="$1" ids
  git rev-parse --quiet --verify "${range%%..*}" >/dev/null 2>&1 || return 0
  ids="$(git log "$range" --format='%an <%ae> | %cn <%ce>' 2>/dev/null | sort -u || true)"
  if [ -n "$ids" ]; then
    note "commits: distinct author|committer identities in range:"
    printf '%s\n' "$ids" | sed 's/^/    /'
  fi
}

# --- main --------------------------------------------------------------------
if [ "${1:-}" = "--self-test" ]; then
  self_test || exit 1
  exit 0
fi

RANGE="${1:-origin/main..HEAD}"

self_test || fail=1
scan_files
scan_commits "$RANGE"
scan_authorship "$RANGE"

if [ "$fail" -ne 0 ]; then
  err "private-marker check FAILED. Describe what is true about this package; do not name where else it is used or what internal work motivated a change."
  exit 1
fi

note "private-marker check passed."
