<script>
	import Button from '$cmp/buttons/Button.svelte'
	import ColorPicker from '$cmp/ColorPicker.svelte'
    import { fade, scale } from 'svelte/transition';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte'

	import { flip } from 'svelte/animate';
	import ControlsOption from './ControlsOption.svelte'
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte'
	import Icon from '$cmp/layout/Icon.svelte'
    import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from '$lib/cgol';
	export let palette = []
	export let mainColor = DEFAULT_COLOR
    export let backgroundColor = DEFAULT_BACKGROUND
	function addColor() {
		palette = [...palette, '#ffffff']
	}
</script>

<ControlsOption name="Main color">
	<ColorPicker bind:value={mainColor} />
</ControlsOption>
<ControlsOption name="Background color">
	<ColorPicker bind:value={backgroundColor} />
</ControlsOption>
<ControlsOption name="Palette" style='gap: 0.7rem'>
	{#each palette as color, i (i)}
		<div 
            animate:flip={{ duration: 300 }}
            out:scale={{ duration: 250 }}
            in:fade={{ duration: 250 }}
            class="color-wrapper"
        >
			<ColorPicker bind:value={color} />
			<Icon
                style="color:red; margin-left: 0.2rem"
				on:click={() => {
					palette = palette.filter((_, index) => index !== i)
				}}
			>
				<FaTimes/>
			</Icon>
		</div>
	{/each}
	<Button on:click={addColor} style="padding: 0.3rem;">
        <Icon style='width: 1.6rem; height: 1.6rem'>
            <FaPlus/>
        </Icon>
    </Button>
</ControlsOption>

<style>
    .color-wrapper{
        display: flex;
        align-items: center;
        margin-right: 1rem;
    }
</style>