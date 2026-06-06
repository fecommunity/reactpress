'use client';

import { DevChunkRecovery as ToolkitDevChunkRecovery } from '@fecommunity/reactpress-toolkit/app';

/** Dev-only: auto-reload when on-demand route chunks are stale after compilation. */
export default function DevChunkRecovery() {
  return <ToolkitDevChunkRecovery />;
}
