pnpm build \
  && (pnpm dev &) \
  && pnpm version:patch \
  && pnpm publish:all \
  && pnpm offline:reset \
  && for port in {3000..3006}; do lsof -ti:$port | xargs kill -9 2>/dev/null; done
