#!/bin/bash
# Accept all changes from incoming branch (dev-harsh)

echo "Accepting all changes from dev-harsh branch..."

# Accept theirs (incoming) for all conflicted files
git checkout --theirs .

# Stage all resolved files
git add .

# Complete the merge
git commit -m "Merge dev-harsh: Accept all changes from dev-harsh branch"

echo "Merge completed! All conflicts resolved by accepting dev-harsh changes."
echo "You can now push with: git push origin main"
