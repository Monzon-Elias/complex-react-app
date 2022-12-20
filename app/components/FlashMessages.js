import React, { useEffect } from "react"

function FlashMessages(props) {
  return (
    <div className="floating-alerts">
      {props.messages.map((msg, index) => {
        return (
          <div key={index} className={"alert text-center floating-alert shadow-sm " + props.alertType}>
            {msg}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
