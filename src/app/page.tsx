'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { GameManager } from './GameManager'
import { GameDifficulty } from './types'

/**
 * マインスイーパーゲームのメインコンポーネント
 * @returns {JSX.Element} ゲームコンポーネント
 */
export default function Home() {
  /**
   * ゲームマネージャーのインスタンス。ゲームの状態やロジックを管理します。
   * @type {GameManager | null}
   */
  const [gameManager, setGameManager] = useState<GameManager | null>(null)

  /**
   * ゲームが終了したかどうかを示すフラグ。
   * ゲームオーバー時にtrueに設定されます。
   * @type {boolean}
   */
  const [gameOver, setGameOver] = useState(false)

  /**
   * ゲームに勝利したかどうかを示すフラグ。
   * ゲームが勝利した場合にtrueに設定されます。
   * @type {boolean}
   */
  const [win, setWin] = useState(false)

  /**
   * ゲームの難易度を管理するフラグ。
   * 初期値は'easy'（初級）です。
   * @type {GameDifficulty}
   */
  const [difficulty, setDifficulty] = useState<GameDifficulty>('easy')

  /**
   * 強制的にコンポーネントを再レンダリングするためのフラグ。
   * 変更時にコンポーネントの再レンダリングがトリガーされます。
   * @type {boolean}
   */
  const [forceUpdateFlag, setForceUpdateFlag] = useState(false)

  /**
   * 操作方法（遊び方）の表示状態を管理するフラグ。
   * trueの場合、遊び方が表示されます。
   * @type {boolean}
   */
  const [showInstructions, setShowInstructions] = useState(false)

  /**
   * セルを長押ししているかどうかを管理するフラグ。
   * trueの場合、長押しが検出されており、フラグの切り替えが行われます。
   * @type {boolean}
   */
  const [isLongPress, setIsLongPress] = useState(false)

  /**
   * 長押しタイマーのIDを保持するフラグ。
   * 長押しが始まった際にタイマーを設定し、終了時にクリアします。
   * @type {NodeJS.Timeout | null}
   */
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  /**
   * ゲームマネージャーの状態を再生成して更新
   */
  const forceUpdate = () => setForceUpdateFlag(!forceUpdateFlag)

  useEffect(() => {
    // ゲームの初期化
    setGameManager(new GameManager(difficulty))
    setGameOver(false)
    setWin(false)
  }, [difficulty])

  /**
   * セルの操作を処理する関数
   * クリックまたは長押しによってセルを開く、またはフラグを立てる
   * @param {number} row 行番号
   * @param {number} col 列番号
   * @param {boolean} isLongPress 長押しかどうか
   */
  const handleCellAction = (row: number, col: number, isLongPress: boolean) => {
    if (!gameManager || gameOver || win) return

    if (isLongPress) {
      // 長押し時はフラグの切り替え
      gameManager.toggleFlag(row, col)
    } else {
      // クリック時はセルを開く
      const isMine = gameManager.revealCell(row, col)
      if (isMine) setGameOver(true)
      else if (gameManager.checkWinCondition()) setWin(true)
    }
    forceUpdate()
  }

  /**
   * 長押し開始時の処理
   * @param {number} row 行番号
   * @param {number} col 列番号
   */
  const handlePressStart = (row: number, col: number) => {
    setIsLongPress(false)

    // 長押し判定タイマーをセット
    const timer = setTimeout(() => {
      setIsLongPress(true)
      handleCellAction(row, col, true)
    }, 500)
    setLongPressTimer(timer)
  }

  /**
   * 長押し終了時またはタップ終了時の処理
   * @param {number} row 行番号
   * @param {number} col 列番号
   */
  const handlePressEnd = (row: number, col: number) => {
    if (longPressTimer) {
      // 長押しタイマーをクリア
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    if (!isLongPress) handleCellAction(row, col, false)
  }

  /**
   * セルを右クリックした際の処理
   * @param {number} row 行番号
   * @param {number} col 列番号
   * @param {React.MouseEvent<HTMLButtonElement>} event イベントオブジェクト
   */
  const onRightClick = (row: number, col: number, event: React.MouseEvent<HTMLButtonElement>) => {
    // 右クリックのデフォルト動作を無効化
    event.preventDefault()

    //    handleCellAction(row, col, true)
  }

  /**
   * ゲームを新しく開始する処理
   * 現在の難易度でゲームを再初期化します。
   */
  const startNewGame = () => {
    setGameOver(false)
    setWin(false)
    setGameManager(new GameManager(difficulty))
  }

  return (
    <div className="container mx-auto p-4 justify-items-center">
      <Head>
        <title>マインスイーパー</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-2xl font-bold mb-4 text-center">マインスイーパー</h1>

      <div className="flex items-center justify-center mb-4">
        {/* 遊び方ボタン */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
        </button>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
          className="ml-2 p-2 rounded-md ml-2"
        >
          <option value="easy">初級</option>
          <option value="medium">中級</option>
          <option value="hard">上級</option>
        </select>
        <button
          onClick={startNewGame}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md ml-2"
        >
          新しいゲーム
        </button>
      </div>

      <div className="mb-4">
        {showInstructions && (
          <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-xl font-bold mb-2">遊び方</h2>
            <p>地雷を避けながら、すべてのセルを開くことができればゲームクリアです。</p>
            <p>地雷をすべて回避し、全ての安全なセルを開けると勝利となります。</p>
            <p>難易度を選択して新しいゲームを開始できます。難易度に応じて、地雷の数やボードのサイズが変わります。</p>

            <h3 className="font-semibold mt-4">PCでの操作</h3>
            <p>セルをクリックすると、そのセルが開示されます。</p>
            <p>右クリックでフラグを立て、地雷の場所を示すことができます。</p>

            <h3 className="font-semibold mt-4">タブレットでの操作</h3>
            <p>セルをタップすると、そのセルが開示されます。</p>
            <p>セルを長押しすると、そのセルにフラグを立てて地雷の可能性を示すことができます。</p>
          </div>
        )}
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
                onTouchStart={() => handlePressStart(rowIndex, colIndex)}
                onTouchEnd={() => handlePressEnd(rowIndex, colIndex)}
                onTouchCancel={() => handlePressEnd(rowIndex, colIndex)}
                onClick={() => handleCellAction(rowIndex, colIndex, false)}
                onContextMenu={(e) => onRightClick(rowIndex, colIndex, e)}
                style={{
                  WebkitTouchCallout: 'none', // 長押し時のメニュー表示を無効化 (iOS Safari)
                  WebkitUserSelect: 'none', // テキスト選択無効化 (Safari)
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
