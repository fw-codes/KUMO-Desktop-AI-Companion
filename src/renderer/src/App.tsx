import kumo from './assets/kumo.svg'
import eyeL from './assets/eye-left.svg'   // use your real file names
import eyeR from './assets/eye-right.svg'
import { useEffect, useRef, useState } from 'react'
import Cbubble from './components/Chatbubble'
import Cinput from './components/Chatinput'

type Message = { text: string; sender: 'user' | 'kumoi' }

function App(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [showInput, setShowInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hit, setHit] = useState<{ axis: 'x' | 'y'; id: number } | null>(null)
  const downPos = useRef<{ x: number; y: number } | null>(null)
  const kumoRef = useRef<HTMLDivElement>(null)
  const eyesRef = useRef<HTMLDivElement>(null)

  // streaming replies + bounce squash
  useEffect(() => {
    const removeToken = window.electron?.onToken?.((chunk: string) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev
        const last = prev[prev.length - 1]
        if (last.sender !== 'kumoi') return prev
        return [...prev.slice(0, -1), { ...last, text: last.text + chunk }]
      })
    })
    const removeDone = window.electron?.onDone?.(() => setLoading(false))
    const removeBounce = window.electron?.onBounce?.(({ axis }) =>
      setHit({ axis, id: Date.now() })
    )
    return () => {
      removeToken?.()
      removeDone?.()
      removeBounce?.()
    }
  }, [])

  // eyes follow cursor
  useEffect(() => {
    const off = window.electron?.onCursor?.(({ x, y }) => {
      const root = kumoRef.current
      const eyes = eyesRef.current
      if (!root || !eyes) return
      const r = root.getBoundingClientRect()
      const dx = x - (r.left + r.width / 2)
      const dy = y - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy) || 1
      const MAX = 6 // max px the eyes travel
      const k = ((Math.min(dist, 150) / 150) * MAX) / dist
      eyes.style.transform = `translate(${dx * k}px, ${dy * k}px)`
    })
    return () => off?.()
  }, [])

  const handleSend = async (message: string): Promise<void> => {
    if (!message.trim()) return
    setMessages((prev) =>
      [...prev, { text: message, sender: 'user' as const }, { text: '', sender: 'kumoi' as const }].slice(-6)
    )
    setLoading(true)
    try {
      await window.electron.askKumo(message)
    } catch (err) {
      console.error('IPC invocation error:', err)
      setLoading(false)
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    downPos.current = { x: e.screenX, y: e.screenY }
    e.currentTarget.setPointerCapture(e.pointerId)
    window.electron.dragStart()
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    window.electron.dragEnd()
    const d = downPos.current
    if (d && Math.hypot(e.screenX - d.x, e.screenY - d.y) < 5) {
      setShowInput((s) => !s)
    }
    downPos.current = null
  }

  return (
    <>
      <div className={`chat-area ${showInput ? 'open' : ''}`}>
        {messages.map((msg, i) => (
          <Cbubble key={i} message={msg.text} sender={msg.sender} />
        ))}
      </div>

      <div className={`input-wrap ${showInput ? 'open' : ''}`}>
        <Cinput onSend={handleSend} />
      </div>

      <div className="container">
        <div className="kumo-body" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div key={hit?.id} className={hit ? `hit-${hit.axis}` : ''}>
            <div className="kumo-float">
              <div ref={kumoRef} className={`kumo ${showInput ? 'open' : ''}`}>
                <img src={kumo} alt="Kumo" className="kumo-img" draggable={false} />
                <div className="eyes" ref={eyesRef}>
                  <img src={eyeL} className="eye eye-l" draggable={false} />
                  <img src={eyeR} className="eye eye-r" draggable={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App