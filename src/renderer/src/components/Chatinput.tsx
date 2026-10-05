import { useState } from "react"
type ChatinputProps = {
  onSend: (message: string) => void
}

function Chatinput({ onSend }: ChatinputProps): React.JSX.Element {
  const [message, setmessage] = useState("")
  const handleSend = () => {
    if (message.trim() === "") return
    onSend(message)
    setmessage("")
  }
    return(
         <div className="inputb">
            <input type="text" placeholder="Ask me anything..." value={message}
            onChange={(e)=>setmessage(e.target.value)}/>
            <button onClick={handleSend}>GO</button>
           
        </div>
        
    )
}
export default Chatinput