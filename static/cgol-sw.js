/* eslint-disable no-undef */
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

function generateMatrix(width,height) {
    //function that creates a matrix, in which there will be stored the alive/dead cells
    const matrix = new Array(height).fill(0)
    for (let i = 0; i < height; i++) {
        matrix[i] = new Uint8ClampedArray(width)
    }
    return matrix
}

function calculateGeneration(matrix) {
    const width = (matrix[0]?.length || 1)  - 1
    const height = (matrix.length || 1) - 1
    const nextGen = generateMatrix(width + 1, height + 1)

    for (let i = 1; i < height; i++) {
        for (let j = 1; j < width; j++) {
            //checks for every neighbour, 1 is alive, 0 is dead
            let neighbours = matrix[i - 1][j - 1] +
                matrix[i - 1][j] +
                matrix[i - 1][j + 1] +
                matrix[i][j - 1] +
                matrix[i][j + 1] +
                matrix[i + 1][j - 1] +
                matrix[i + 1][j] +
                matrix[i + 1][j + 1]
            if (!matrix[i][j]) {
                //If cell is dead
                if (neighbours == 3) {
                    nextGen[i][j] = 1
                }
            } else {
                //If cell is alive
                if (neighbours < 2 || neighbours > 3) {
                    nextGen[i][j] = 0
                } else {
                    nextGen[i][j] = 1
                }
            }
        }
    }
    return nextGen
}

Comlink.expose({
    calculateGeneration,
    generateMatrix
})

