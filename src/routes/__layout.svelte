<script lang="ts">
	import '../global.css'
	import ErrorLogger from '$cmp/misc/ErrorLogger.svelte'
	import PageTransition from '$cmp/layout/PageTransition.svelte'
	import { page } from '$app/stores'
	import { browser } from '$app/env'
</script>

<ErrorLogger>
	<PageTransition refresh={$page.url.pathname}>
		<slot />
	</PageTransition>
</ErrorLogger>