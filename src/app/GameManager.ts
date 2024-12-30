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
        const board = this.createEmptyBoard()
        this.placeMines(board)
        this.calculateNeighborMines(board)
        return board
    }

    /**
     * 空のボードを作成する
     * @returns {CellState[][]} 空のボード
     */
    private createEmptyBoard(): CellState[][] {
        return Array(this.rows).fill(null).map(() =>
            Array(this.cols).fill(null).map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
            }))
        )
    }

    /**
     * ボードに地雷を配置する
     * @param {CellState[][]} board - ボード
     */
    private placeMines(board: CellState[][]): void {
        let minesPlaced = 0
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows)
            const col = Math.floor(Math.random() * this.cols)
            if (!board[row][col].isMine) {
                board[row][col].isMine = true
                minesPlaced++
            }
        }
    }

    /**
     * 隣接する地雷の数を計算する
     * @param {CellState[][]} board - ボード
     */
    private calculateNeighborMines(board: CellState[][]): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!board[row][col].isMine) {
                    board[row][col].neighborMines = this.countNeighborMines(board, row, col)
                }
            }
        }
    }

    /**
     * 指定されたセルが有効範囲内かどうかを確認する
     * @param {number} row - 行インデックス
     * @param {number} col - 列インデックス
     * @returns {boolean} セルが有効範囲内であればtrue、そうでなければfalse
     */
    private isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
    }

    /**
     * 指定されたセルの隣接する地雷の数を数える
     * @param {CellState[][]} board - ボード
     * @param {number} row - セルの行インデックス
     * @param {number} col - セルの列インデックス
     * @returns {number} 隣接する地雷の数
     */
    private countNeighborMines(board: CellState[][], row: number, col: number): number {
        let count = 0
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (this.isValidCell(row + i, col + j) && board[row + i][col + j].isMine) {
                    count++
                }
            }
        }
        return count
    }

    /**
     * セルを開示する
     * @param {number} row - 行インデックス
     * @param {number} col - 列インデックス
     */
    revealCell(row: number, col: number): boolean {
        if (!this.isValidCell(row, col) || this.board[row][col].isRevealed) {
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
