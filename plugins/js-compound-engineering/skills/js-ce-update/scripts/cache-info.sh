#!/usr/bin/env bash
# Derive the compound-engineering plugin's marketplace cache location from
# ${CLAUDE_PLUGIN_ROOT} rather than from a hardcoded marketplace name, then
# report the cache base, the derived marketplace name, and the cached version
# folder(s) for the compound-engineering plugin.
#
# The standard Claude Code install resolves ${CLAUDE_PLUGIN_ROOT} to the plugin's
# version directory: <plugins-root>/cache/<marketplace>/<plugin>/<version>.
# Walking three parents up yields the cache base (.../cache); the marketplace
# name is the basename two parents up. Deriving from the path keeps this working
# under any marketplace name this fork ships as.
#
# Prints three lines:
#   CACHE_BASE=<path>            cache base dir, or sentinel if it can't be derived
#   MARKETPLACE=<name>           derived marketplace segment, or sentinel
#   VERSIONS=<v1> <v2> ...       space-separated cached version folder names,
#                                or the sentinel __CE_UPDATE_CACHE_FAILED__ if the
#                                compound-engineering cache dir does not exist
#
# Sentinels:
#   __CE_UPDATE_ROOT_FAILED__    ${CLAUDE_PLUGIN_ROOT} is empty/unresolved
#   __CE_UPDATE_CACHE_FAILED__   no compound-engineering marketplace cache present

set -u

root="${CLAUDE_PLUGIN_ROOT:-}"

# Reject empty or unresolved (literal token) plugin root.
case "$root" in
  ""|*'${CLAUDE_PLUGIN_ROOT}'*)
    echo 'CACHE_BASE=__CE_UPDATE_ROOT_FAILED__'
    echo 'MARKETPLACE=__CE_UPDATE_ROOT_FAILED__'
    echo 'VERSIONS=__CE_UPDATE_CACHE_FAILED__'
    exit 0
    ;;
esac

cache_base="$(dirname "$(dirname "$(dirname "$root")")")"
marketplace="$(basename "$(dirname "$(dirname "$root")")")"
ce_dir="$cache_base/$marketplace/compound-engineering"

echo "CACHE_BASE=$cache_base"
echo "MARKETPLACE=$marketplace"

if [ -d "$ce_dir" ]; then
  versions="$(ls "$ce_dir" 2>/dev/null | tr '\n' ' ' | sed 's/ *$//')"
  if [ -n "$versions" ]; then
    echo "VERSIONS=$versions"
  else
    echo 'VERSIONS=__CE_UPDATE_CACHE_FAILED__'
  fi
else
  echo 'VERSIONS=__CE_UPDATE_CACHE_FAILED__'
fi
