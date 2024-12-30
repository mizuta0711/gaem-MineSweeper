'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { GameManager, Difficulty } from './GameManager'

/**
 * マインスイーパーゲームのメインコンポーネント
 * @returns {JSX.Element}
 */
export default function Home() {
  const [gameManager, setGameManager] = useState<GameManager | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [forceUpdateFlag, setForceUpdateFlag] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const forceUpdate = () => setForceUpdateFlag(!forceUpdateFlag);

  useEffect(() => {
    const manager = new GameManager(difficulty)
    setGameManager(manager)
    setGameOver(false)
    setWin(false)
  }, [difficulty])

  const handleCellClick = (row: number, col: number) => {
    if (!gameManager || gameOver || win) return

    const isMine = gameManager.revealCell(row, col)
    forceUpdate();

    if (isMine) {
      setGameOver(true)
    } else if (gameManager.checkWinCondition()) {
      setWin(true)
    }
  }

  const handleRightClick = (row: number, col: number) => {
    if (!gameManager || gameOver || win) return

    gameManager.toggleFlag(row, col)
    forceUpdate();
  }

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>マインスイーパー</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl font-bold mb-4">マインスイーパー</h1>

      <div className="mb-4">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="mb-2 p-2 bg-green-500 text-white rounded"
        >
          {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
        </button>

        {showInstructions && (
          <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-xl font-bold mb-2">遊び方</h2>
            <p>・地雷を避けて全てのセルを開示すると勝利です。</p>
            <p>・セルを左クリックすると開示されます。</p>
            <p>・右クリックでフラグを立てて地雷をマークできます。</p>
            <p>・難易度を選択して新しいゲームを開始できます。</p>
          </div>
        )}
      </div>

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
          onClick={() => setDifficulty(difficulty)}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          新しいゲーム
        </button>
      </div>

      {gameManager && (
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gameManager.cols}, minmax(0, 1fr))`,
            width: gameManager.cols * 35,
          }}
        >
          {gameManager.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  handleRightClick(rowIndex, colIndex)
                }}
                className={`w-8 h-8 border ${cell.isRevealed
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
      )}

      {gameOver && <p className="mt-4 text-xl font-bold text-red-500">ゲームオーバー！</p>}
      {win && <p className="mt-4 text-xl font-bold text-green-500">勝利！おめでとうございます！</p>}
    </div>
  )
}
