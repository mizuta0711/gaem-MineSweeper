/**
 * セルの状態を表す型
 * @typedef {Object} CellState
 * @property {boolean} isMine - 地雷かどうか
 * @property {boolean} isRevealed - 開示されているかどうか
 * @property {boolean} isFlagged - フラグが立てられているかどうか
 * @property {number} neighborMines - 隣接する地雷の数
 */
type CellState = {
    isMine: boolean
    isRevealed: boolean
    isFlagged: boolean
    neighborMines: number
}

/**
 * ゲームの難易度を表す型
 * @typedef {'easy' | 'medium' | 'hard'} Difficulty
 */
export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * 難易度に応じたゲーム設定
 * @type {Object.<Difficulty, {rows: number, cols: number, mines: number}>}
 */
const DIFFICULTY_SETTINGS = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 },
}

/**
 * ゲームロジックを管理するクラス
 */
export class GameManager {
    board: CellState[][]
    rows: number
    cols: number
    mines: number

    constructor(difficulty: Difficulty) {
        const { rows, cols, mines } = DIFFICULTY_SETTINGS[difficulty]
        this.rows = rows
        this.cols = cols
        this.mines = mines
        this.board = this.initializeBoard()
    }

    /**
     * ボードを初期化する
     * @returns {CellState[][]} 初期化されたボード
     */
    initializeBoard(): CellState[][] {
        const board: CellState[][] = Array(this.rows).fill(null).map(() =>
            Array(this.cols).fill(null).map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
            }))
        )

        let minesPlaced = 0
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows)
            const col = Math.floor(Math.random() * this.cols)
            if (!board[row][col].isMine) {
                board[row][col].isMine = true
                minesPlaced++
            }
        }

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!board[row][col].isMine) {
                    let count = 0
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (
                                row + i >= 0 &&
                                row + i < this.rows &&
                                col + j >= 0 &&
                                col + j < this.cols &&
                                board[row + i][col + j].isMine
                            ) {
                                count++
                            }
                        }
                    }
                    board[row][col].neighborMines = count
                }
            }
        }
        return board
    }

    /**
     * セルを開示する
     * @param {number} row - 行インデックス
     * @param {number} col - 列インデックス
     */
    revealCell(row: number, col: number): boolean {
        if (
            row < 0 ||
            row >= this.rows ||
            col < 0 ||
            col >= this.cols ||
            this.board[row][col].isRevealed
        ) {
            return false
        }

        this.board[row][col].isRevealed = true

        if (this.board[row][col].isMine) {
            return true // 地雷を踏んだ
        }

        if (this.board[row][col].neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.revealCell(row + i, col + j)
                }
            }
        }

        return false
    }

    /**
     * 勝利条件を確認する
     * @returns {boolean} 勝利条件を満たしているかどうか
     */
    checkWinCondition(): boolean {
        return this.board.every(row =>
            row.every(cell => cell.isMine || cell.isRevealed)
        )
    }

    /**
     * フラグを切り替える
     * @param {number} row - 行インデックス
     * @param {number} col - 列インデックス
     */
    toggleFlag(row: number, col: number) {
        if (!this.board[row][col].isRevealed) {
            this.board[row][col].isFlagged = !this.board[row][col].isFlagged
        }
    }
}