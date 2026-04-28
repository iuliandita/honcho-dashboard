<script lang="ts">
import { type DividerStyle, divider } from './divider';

interface Props {
  cols?: number;
  style?: DividerStyle;
}

const { cols = 40, style = 'line' }: Props = $props();
</script>

<pre class="ascii divider" aria-hidden="true">{divider(cols, style)}</pre>

<style>
  .divider {
    margin: 0;
    color: currentColor;
    overflow: hidden;
  }
</style>
