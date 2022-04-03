<script lang="ts">
	import { Cgol } from '$lib/cgol'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import Controls from '$cmp/index/Controls.svelte'
	import Color from 'color'
	import { toast } from '$cmp/toast'
	import { Settings } from '$stores/settings'
	const { isPlaying, scale, maxFps, mainColor, palette, backgroundColor, trailToggled } = Settings
	const cgol = new Cgol()
	let width = browser ? window.innerWidth : 0
	let height = browser ? window.innerHeight : 0
	let canvas: HTMLCanvasElement
	let canvas2: HTMLCanvasElement
	let context: CanvasRenderingContext2D
	let context2: CanvasRenderingContext2D
	let rid = 0
	let isPressing = false
	async function handleFrame() {
		try {
			currentTime = Date.now()
			deltaTime = currentTime - nextTime
			if ($isPlaying && deltaTime > rafInterval) await cgol.tick()
			if (deltaTime > rafInterval) {
				nextTime = currentTime - (deltaTime % rafInterval)
				cgol.draw()
			}
		} catch (e) {
			console.error(e)
			toast.error('Oopsie, There was an error')
			cgol.reset()
			scale.set(1)
			maxFps.set(60)
		}
		rid = requestAnimationFrame(handleFrame)
	}

	async function handleScale({ detail }: CustomEvent<number>) {
		await cgol.recreate(width, height, detail)
		scale.set(detail)
		cgol.randomize()
	}

	onMount(async () => {
		context = canvas.getContext('2d')
		context2 = canvas2.getContext('2d')
		await cgol.init(width, height, context, context2)
		cgol.setMainColor($mainColor)
		cgol.setPalette($palette)
		cgol.randomize()
		handleFrame()
		return () => cancelAnimationFrame(rid)
	})
	function handleStep({ detail }: CustomEvent<number>) {
		cgol.step(detail)
		cgol.draw()
	}

	function handlePointer(eventX: number, eventY: number, e: any) {
		//@ts-ignore
		if (!isPressing || e.target?.tagName !== 'CANVAS') return
		const x = Math.floor((eventX / width) * width)
		const y = Math.floor((eventY / height) * height)
		const noise = Math.round(Math.random() * 10 + 30)
		cgol.paintNoise(x, y, noise)
	}
	let rafInterval = 1000 / $maxFps
	$: rafInterval = 1000 / ($maxFps ? $maxFps : 1)
	let currentTime = 0
	let nextTime = Date.now()
	let deltaTime = 0

	$: cgol.setPalette($palette)
	$: cgol.setMainColor($mainColor)
	$: cgol.setBackgroundcolor($backgroundColor)
	$: cgol.toggleTrail($trailToggled)
</script>

<title> Conway's Game of Life Background generator </title>
<svelte:window
	on:pointerdown={() => (isPressing = true)}
	on:touchmove={(e) => {
		for (let i = 0; i < e.touches.length; i++) {
			const touch = e.touches.item(i)
			handlePointer(touch.clientX, touch.clientY, e)
		}
	}}
	on:blur={() => (isPressing = false)}
	on:pointerup={() => (isPressing = false)}
	on:mousemove={(e) => {
		handlePointer(e.clientX, e.clientY, e)
	}}
/>
<div
	style={`--accent:${$mainColor};
	 --accent-text:${new Color($mainColor).isDark() ? 'white' : 'black'};
	 --controls-background:${new Color($backgroundColor).fade(0.35)};
	 --controls-background-text:${new Color($backgroundColor).isDark() ? 'white' : 'black'};
	 height: 100%;
	`}
>
	<div class="canvas-wrapper" style={`background-color:${$backgroundColor.toString()}`}>
		<canvas bind:this={canvas2} {width} {height} />
		<canvas bind:this={canvas} {width} {height} />
	</div>

	<Controls
		on:clear={() => {
			const newWidth = window.innerWidth
			const newHeight = window.innerHeight
			if (newWidth !== width || newHeight !== height) {
				width = newWidth
				height = newHeight
				return cgol.recreate(width, height, $scale)
			}
			cgol.reset()
		}}
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
			Settings.reset()
			await cgol.reset()
			cgol.randomize()
			cgol.draw()
		}}
		bind:palette={$palette}
		bind:backgroundColor={$backgroundColor}
		bind:isPlaying={$isPlaying}
		bind:mainColor={$mainColor}
		bind:maxFps={$maxFps}
		bind:trailToggled={$trailToggled}
		scale={$scale}
	/>
</div>

<style lang="scss">
	@import '../variables.scss';
	.canvas-wrapper {
		position: relative;
		width: 100vw;
		height: 100%;
		canvas {
			width: 100%;
			position: absolute;
			image-rendering: pixelated;
			height: 100%;
		}
	}
</style>
