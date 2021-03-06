import * as Comlink from 'comlink'
import Color from 'color'
interface CgolSW {
    calculateGeneration: (gen: ArrayBufferLike, width: number, height:number) => Promise<Uint8ClampedArray>
}
export const DEFAULT_PALETTE = ["#283049", "#404B69", "#278EA5", "#134753"]
export const DEFAULT_COLOR = '#FF0074'
export const DEFAULT_BACKGROUND = "#0f0d19"
class Cgol {
    gen: Uint8ClampedArray
    width = 0
    height = 0
    private changeColorEvery = 15
    private colorCounter = 0
    private trailData: Uint8ClampedArray
    private trailLength = 15
    trailToggled = true
    bgColor: Color
    generations: Uint8ClampedArray[] = []
    generationCounter = 0
    palette: Color[]
    mainColor: Color
    currentColor: Color
    context: CanvasRenderingContext2D
    context2: CanvasRenderingContext2D
    sw: CgolSW
    constructor(changeColorEvery = 15, trailLength = 15) {
        this.gen = new Uint8ClampedArray(0)
        this.changeColorEvery = changeColorEvery
        this.trailLength = trailLength
        this.mainColor = new Color(DEFAULT_COLOR)
        this.bgColor = new Color(DEFAULT_BACKGROUND)
        this.palette = DEFAULT_PALETTE.map(c => new Color(c))
        this.currentColor = this.palette[0]
        this.trailData = new Uint8ClampedArray(0)
    }
    get generationColor(): Color {
        if (this.colorCounter++ > this.changeColorEvery) {
            this.colorCounter = 0
            let newColor = this.currentColor
            for (let i = 0; newColor.hex() === this.currentColor.hex() && i < 15; i++) {
                newColor = this.palette[Math.floor(Math.random() * this.palette.length)] || new Color('#FFFFFF')
            }
            this.currentColor = newColor
        }
        return this.currentColor
    }
    async init(width: number, height: number, context: CanvasRenderingContext2D, contxt2: CanvasRenderingContext2D): Promise<void> {
        width = Math.floor(width)
        height = Math.floor(height)
        this.sw = Comlink.wrap(new Worker('cgol-sw.js')) as CgolSW
        this.gen = new Uint8ClampedArray(width * height)
        this.trailData = new Uint8ClampedArray(width * height * 4)
        this.width = width
        this.height = height
        this.context = context
        this.context2 = contxt2
        this.generationCounter = 0
    }
    dispose(): void {
        this.context = null
        this.context2 = null
    }
    randomize(bias = 0.4): void {
        const { width, height, gen } = this
        for(let i = 0; i < width * height; i++) {
            if (!gen[i]) gen[i] = (Math.round(Math.random() - bias))
        }
        this.generationCounter++
    }
    toggleTrail(override?: boolean): void {
        this.trailToggled = override === undefined ? !this.trailToggled : override
    }
    async recreate(width: number, height: number, scale = 1): Promise<void> {
        const finalWidth = Math.floor(width * scale)
        const finalHeight = Math.floor(height * scale)
        if (this.context) this.context.canvas.width = finalWidth
        if (this.context2) this.context2.canvas.width = finalWidth
        if (this.context) this.context.canvas.height = finalHeight
        if (this.context2) this.context2.canvas.height = finalHeight
        this.context?.clearRect(0, 0, this.width, this.height)
        this.context2?.clearRect(0, 0, this.width, this.height)
        this.gen = new Uint8ClampedArray(finalWidth * finalHeight)
        this.context?.clearRect(0, 0, finalWidth, finalHeight)
        this.context2?.clearRect(0, 0, finalWidth, finalHeight)
        this.trailData = new Uint8ClampedArray(finalWidth * finalHeight * 4)
        this.width = finalWidth
        this.height = finalHeight
        this.generationCounter = 0
    }
    async reset(): Promise<void> {
        await this.recreate(this.width, this.height)
    }
    async tick(): Promise<void> {
        const generationNumber = this.generationCounter
        const nextGeneration = await this.sw.calculateGeneration(this.gen, this.width, this.height)
        if (this.generationCounter === generationNumber) {
            this.addGeneration(this.gen)
            this.gen = nextGeneration
            this.generationCounter++
        }
    }
    async step(direction: number): Promise<void> {
        if (direction > 0) {
            await this.tick()
        } else {
            if (this.generations.length <= 0) return
            this.gen = this.generations.pop()
        }

    }

    paintNoise(x: number, y: number, noise: number): void {
        const {width} = this
        try {
            for (let i = 0; i < noise; i++) {
                const noiseX = Math.round(Math.random() * -20 + 15)
                const noiseY = Math.round(Math.random() * -20 + 15)
                this.gen[(x + noiseX) + (y + noiseY) * width] = 1
            }
            this.generationCounter++
        } catch (e) { return }
    }
    draw(): void {
        this.drawOnLayer(1, true)
        if (this.trailToggled) this.drawOnLayer(2, false)
    }
    drawOnLayer(layer: 1 | 2, erase: boolean): void {

        const { width, height, gen, trailData } = this
        const context = layer === 1 ? this.context : this.context2
        const rgbObj = layer === 1 ? this.mainColor.object() : this.generationColor.object()
        const data = erase ? new Uint8ClampedArray(width * height * 4).fill(0) : trailData
        let counter = 0
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                //if the current pixel has never been drawn
                if (data[counter + 3]) {
                    //if it has, ignore it and continue
                    counter += 4
                } else {
                    //if it's not, add each subpixel data
                    if (gen[i * width + j]) {
                        //if the cell is alive add the selected color to the data
                        data[counter] = rgbObj.r
                        data[counter + 1] = rgbObj.g
                        data[counter + 2] = rgbObj.b
                        data[counter + 3] = 255
                        counter += 4
                    } else {
                        //if the cell is dead, turn the pixel black
                        data[counter + 1] = 0
                        counter += 4

                    }
                }
            }
        }

        if (!erase) this.trailData = data
        //actually draw the image generated above
        context.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0)

    }

    private addGeneration(generation: Uint8ClampedArray): void {
        if (this.generations.length > this.trailLength) {
            this.generations.shift()
        }
        this.generations.push(generation)
    }
    download(): void {
        const finalCanvas = document.createElement("canvas")
        finalCanvas.width = this.width * 2
        finalCanvas.height = this.height * 2
        finalCanvas.style.imageRendering = "pixelated"

        const finalContext = finalCanvas.getContext("2d")
        finalContext.imageSmoothingEnabled = false
        finalContext.fillStyle = this.bgColor.toString()
        finalContext.fillRect(0, 0, finalCanvas.width, finalCanvas.height)
        const layer1 = this.context.canvas
        const layer2 = this.context2.canvas
        finalContext.drawImage(layer2, 0, 0, finalCanvas.width, finalCanvas.height)
        finalContext.drawImage(layer1, 0, 0, finalCanvas.width, finalCanvas.height)

        const a = document.createElement("a")
        a.href = finalCanvas.toDataURL("image/png", 1)
        a.download = "picture.png"
        a.click()
    }
    setMainColor(color: string): void {
        this.mainColor = new Color(color)
    }
    setBackgroundcolor(color: string): void {
        this.bgColor = new Color(color)
    }
    setPalette(palette: string[]): void {
        this.palette = palette.map(color => new Color(color))
    }
}

export {
    Cgol
}