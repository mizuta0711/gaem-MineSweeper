'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'

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
type Difficulty = 'easy' | 'medium' | 'hard'

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
 * マインスイーパーゲームのメインコンポーネント
 * @returns {JSX.Element}
 */
export default function Home() {
  const [board, setBoard] = useState<CellState[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  /**
   * 新しいゲームボードを初期化する
   * @param {Difficulty} diff - 難易度
   */
  const initializeBoard = (diff: Difficulty) => {
    const { rows, cols, mines } = DIFFICULTY_SETTINGS[diff]
    const newBoard: CellState[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    )

    // 地雷を配置
    let minesPlaced = 0
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true
        minesPlaced++
      }
    }

    // 隣接する地雷の数を計算
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (row + i >= 0 && row + i < rows && col + j >= 0 && col + j < cols) {
                if (newBoard[row + i][col + j].isMine) count++
              }
            }
          }
          newBoard[row][col].neighborMines = count
        }
      }
    }

    setBoard(newBoard)
    setGameOver(false)
    setWin(false)
  }

  useEffect(() => {
    initializeBoard(difficulty)
  }, [difficulty])

  /**
   * セルをクリックしたときの処理
   * @param {number} row - 行インデックス
   * @param {number} col - 列インデックス
   */
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || win || board[row][col].isRevealed || board[row][col].isFlagged) return

    const newBoard = [...board]
    if (newBoard[row][col].isMine) {
      // 地雷をクリックした場合
      newBoard[row][col].isRevealed = true
      setBoard(newBoard)
      setGameOver(true)
    } else {
      // 安全なセルをクリックした場合
      revealCell(newBoard, row, col)
      setBoard(newBoard)
      checkWinCondition(newBoard)
    }
  }

  /**
   * セルを再帰的に開示する
   * @param {CellState[][]} newBoard - 新しいボード状態
   * @param {number} row - 行インデックス
   * @param {number} col - 列インデックス
   */
  const revealCell = (newBoard: CellState[][], row: number, col: number) => {
    if (row < 0 || row >= newBoard.length || col < 0 || col >= newBoard[0].length || newBoard[row][col].isRevealed) return

    newBoard[row][col].isRevealed = true

    if (newBoard[row][col].neighborMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(newBoard, row + i, col + j)
        }
      }
    }
  }

  /**
   * 勝利条件をチェックする
   * @param {CellState[][]} newBoard - 新しいボード状態
   */
  const checkWinCondition = (newBoard: CellState[][]) => {
    const allNonMinesRevealed = newBoard.every(row =>
      row.every(cell => cell.isMine || cell.isRevealed)
    )
    if (allNonMinesRevealed) {
      setWin(true)
    }
  }

  /**
   * セルを右クリックしたときの処理（フラグの切り替え）
   * @param {number} row - 行インデックス
   * @param {number} col - 列インデックス
   */
  const handleRightClick = (row: number, col: number) => {
    if (gameOver || win || board[row][col].isRevealed) return

    const newBoard = [...board]
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged
    setBoard(newBoard)
  }

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>マインスイーパー</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl font-bold mb-4">マインスイーパー</h1>

      <div className="mb-4">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="p-2 border rounded"
        >
          <option value="easy">初級</option>
          <option value="medium">中級</option>
          <option value="hard">上級</option>
        </select>
        <button
          onClick={() => initializeBoard(difficulty)}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          新しいゲーム
        </button>
      </div>

      <div className="grid gap-1" style={{
        gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].cols}, minmax(0, 1fr))`,
        width: DIFFICULTY_SETTINGS[difficulty].cols * 35,
      }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => {
                e.preventDefault()
                handleRightClick(rowIndex, colIndex)
              }}
              className={`w-8 h-8 border ${
                cell.isRevealed
                  ? cell.isMine
                    ? 'bg-red-500'
                    : 'bg-gray-200'
                  : 'bg-gray-300'
              }`}
            >
              {cell.isRevealed
                ? cell.isMine
                  ? '💣'
                  : cell.neighborMines > 0
                    ? cell.neighborMines
                    : ''
                : cell.isFlagged
                  ? '🚩'
                  : ''}
            </button>
          ))
        )}
      </div>

      {gameOver && <p className="mt-4 text-xl font-bold text-red-500">ゲームオーバー！</p>}
      {win && <p className="mt-4 text-xl font-bold text-green-500">勝利！おめでとうございます！</p>}
    </div>
  )
}
