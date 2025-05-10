#!/bin/bash

# ページ構造の作成
mkdir -p app/projects
touch app/projects/page.tsx

mkdir -p app/projects/[id]
touch app/projects/[id]/page.tsx

mkdir -p app/projects/[id]/tasks/[taskId]/votes/[voteId]
touch app/projects/[id]/tasks/[taskId]/page.tsx
touch app/projects/[id]/tasks/[taskId]/votes/[voteId]/page.tsx

# コンポーネント構造の作成
mkdir -p components/project

for component in ProjectCard TaskCard VoteCard MemberCard; do
  touch components/project/${component}.tsx
done

echo "✅ ページとコンポーネントの構造を作成しました。"
