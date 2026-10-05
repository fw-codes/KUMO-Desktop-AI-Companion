type ChatbubbleProps = {
  message: string
  sender: "user" | "kumoi"
}

function Chatbubble({ message, sender }: ChatbubbleProps): React.JSX.Element {
  return (
    <div className= {`cbubble ${sender}`}> 
      {message}
    </div>
  )
}
export default Chatbubble