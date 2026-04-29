<script lang="ts">
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import ChatPanel from '$features/chat/ChatPanel.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { getContext } from 'svelte';

interface Props {
  workspaceId: string;
  peerId: string;
}

const { workspaceId, peerId }: Props = $props();
const settings = getContext<AppSettings>('app-settings');
</script>

<Pane>
  <PaneHeader title={t(settings.locale, 'nav.chat')} subtitle={`${t(settings.locale, 'common.peer')} ${peerId}`} />
  <div class="chat-route pane-body">
    <ChatPanel {peerId} {workspaceId} />
  </div>
</Pane>

<style>
  .chat-route {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
