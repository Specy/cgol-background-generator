/* eslint-disable no-undef */
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

function calculateGeneration(gen, width, height) {
    const nextGen = new Uint8ClampedArray(width * height)
    
    for (let i = 1; i < height - 1; i++) {
        const row = i * width
        for (let j = 1; j < width - 1; j++) {
            //checks for every neighbour, 1 is alive, 0 is dead
            let neighbours = 
                gen[row - width + j - 1] +
                gen[row - width + j    ] +
                gen[row - width + j + 1] +
                gen[row         + j - 1] +
                gen[row         + j + 1] +
                gen[row + width + j - 1] +
                gen[row + width + j    ] +
                gen[row + width + j + 1]

            if (!gen[row + j]) {
                //If cell is dead
                if (neighbours === 3) {
                    nextGen[row + j] = 1
                }
            } else {
                //If cell is alive
                if (neighbours < 2 || neighbours > 3) {
                    nextGen[row + j] = 0
                } else {
                    nextGen[row + j] = 1
                }
            }
        }
    }
    return nextGen
}

Comlink.expose({
    calculateGeneration
})

