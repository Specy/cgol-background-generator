<script lang="ts">
	import { Cgol, DEFAULT_BACKGROUND, DEFAULT_COLOR, DEFAULT_PALETTE } from '$lib/cgol'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import Controls from '$cmp/index/Controls.svelte'
	import Color from 'color'
	import { toast } from '$cmp/toast'
	import { getScreenRefreshRate } from '$lib/getRefreshRate'
	const cgol = new Cgol()
	const width = browser ? window.innerWidth : 0
	const height = browser ? window.innerHeight : 0
	let canvas: HTMLCanvasElement
	let canvas2: HTMLCanvasElement
	let context: CanvasRenderingContext2D
	let context2: CanvasRenderingContext2D
	let isPlaying = true
	let rid = 0
	let scale = browser ? JSON.parse(localStorage.getItem('cgol-scale')) || 1 : 1
	let maxFps = 60
	let rafInterval = 1000 / maxFps
	$: rafInterval = 1000 / (maxFps ? maxFps : 1)
	let currentTime = 0
	let nextTime = Date.now()
	let deltaTime = 0
	let backgroundColor = browser
		? localStorage.getItem('cgol-bg-color') || DEFAULT_BACKGROUND
		: DEFAULT_BACKGROUND
	let palette = browser
		? JSON.parse(localStorage.getItem('cgol-palette')) || DEFAULT_PALETTE
		: DEFAULT_PALETTE
	let mainColor = browser 
		? localStorage.getItem('cgol-main-color') || DEFAULT_COLOR 
		: DEFAULT_COLOR
	async function handleFrame() {
		try {
			currentTime = Date.now()
			deltaTime = currentTime - nextTime
			if (isPlaying && deltaTime > rafInterval) {
				nextTime = currentTime - (deltaTime % rafInterval)
				await cgol.tick()
				cgol.draw()
			}
		} catch (e) {
			console.error(e)
			toast.error('Oopsie, There was an error')
			cgol.reset()
			scale = 1
			maxFps = 60
		}

		rid = requestAnimationFrame(handleFrame)
	}

	async function handleScale({ detail }: CustomEvent<number>) {
		await cgol.recreate(width, height, detail)

		cgol.randomize()
	}

	onMount(async () => {
		context = canvas.getContext('2d')
		context2 = canvas2.getContext('2d')
		await cgol.init(width, height, context, context2)
		cgol.setMainColor(mainColor)
		cgol.setPalette(palette)
		cgol.randomize()
		setTimeout(() => {
			getScreenRefreshRate((fps) => {
				const savedFps = browser ? JSON.parse(localStorage.getItem('cgol-max-fps')) || -1 : -1
				maxFps = savedFps > 0 ? savedFps : fps
			}, false)
		}, 1000)
		handleFrame()
		return () => cancelAnimationFrame(rid)
	})
	function handleStep({ detail }: CustomEvent<number>) {
		cgol.step(detail)
		cgol.draw()
	}
	$: {
		cgol.setPalette(palette)
		cgol.setMainColor(mainColor)
		cgol.setBackgroundcolor(backgroundColor)
		if (browser) {
			localStorage.setItem('cgol-main-color', mainColor)
			localStorage.setItem('cgol-palette', JSON.stringify(palette))
			localStorage.setItem('cgol-bg-color', backgroundColor)
		}
	}
	$: {
		if (browser) localStorage.setItem('cgol-scale', scale.toString())
		if (browser) localStorage.setItem('cgol-max-fps', maxFps ? maxFps.toString() : '1')
	}
</script>

<title> Conway's Game of Life Background generator </title>

<div style={
	`--accent:${mainColor};
	 --accent-text:${new Color(mainColor).isDark() ? 'white' : 'black'};
	 --controls-background:${new Color(backgroundColor).fade(0.35)};
	 --controls-background-text:${new Color(backgroundColor).isDark() ? 'white' : 'black'};
	`}>
	<div class="canvas-wrapper" style={`background-color:${backgroundColor.toString()}`}>
		<canvas bind:this={canvas2} {width} {height} />
		<canvas bind:this={canvas} {width} {height} />
	</div>

	<Controls
		on:clear={() => cgol.reset()}
		on:randomize={() => {
			cgol.randomize()
			cgol.draw()
		}}
		on:snapshot={() => {
			cgol.download()
			toast.success('Snapshot downlaoded')
		}}
		on:scale={handleScale}
		on:step={handleStep}
		on:reset-settings={async () => {
			scale = 1
			maxFps = 60
			palette = DEFAULT_PALETTE
			mainColor = DEFAULT_COLOR
			backgroundColor = DEFAULT_BACKGROUND
			await cgol.reset()
			cgol.randomize()
			cgol.draw()
		}}
		bind:palette
		bind:backgroundColor
		bind:isPlaying
		bind:mainColor
		bind:maxFps
		{scale}
	/>
</div>

<style lang="scss">
	@import '../variables.scss';
	.canvas-wrapper {
		position: relative;
		width: 100vw;
		height: 100vh;
		canvas {
			width: 100%;
			position: absolute;
			image-rendering: pixelated;
			height: 100%;
		}
	}
</style>
