import React, { useEffect } from "react";

function FlashMessages() {
  return (
    <div className="floating-alerts">
      <div className="alert alert-success text-center floating-alert shadow-sm">
        hello, this is quite a message!
      </div>
    </div>
  );
}

export default FlashMessages;
