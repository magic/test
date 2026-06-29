#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Building @magic/test..."
npm run build

rm -f ~/dev/magic/util/test/test-output.txt

TEST_DIST="$SCRIPT_DIR/dist"
PROJECTS=(
  "$HOME/dev/arm/systemkollektiv/components"
  "$HOME/dev/arm/systemkollektiv/audio-player"
  "$HOME/dev/arm/systemkollektiv/resizable-list"
  "$HOME/dev/arm/systemkollektiv/render-jsx"
  "$HOME/dev/arm/systemkollektiv/i18n"
)

for project in "${PROJECTS[@]}"; do
  echo ""
  echo "=== Testing $project ==="
  TARGET_DIR="$project/node_modules/@magic/test/dist"
  if [ -d "$TARGET_DIR" ]; then
    cp -r "$TEST_DIST/"* "$TARGET_DIR/"
    cd "$project"
    chmod +x ./node_modules/.bin/t
    npm run test -- -p >> ~/dev/magic/util/test/test-output.txt
    cd "$SCRIPT_DIR"
  else
    echo "Skipping $project (node_modules/@magic/test not found)"
  fi
done

echo ""
echo "All tests complete."
