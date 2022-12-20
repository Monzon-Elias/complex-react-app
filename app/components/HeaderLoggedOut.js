import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext)
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()

  const handleSubmit = async e => {
    e.preventDefault()
    if (!username) {
      appDispatch({ type: "flashMessage", value: "Username required", alertType: "alert-danger" })
      return
    }
    if (!password) {
      appDispatch({ type: "flashMessage", value: "Password required", alertType: "alert-danger" })
      return
    }
    try {
      const resp = await Axios.post("/login", {
        username,
        password
      })
      resp.data ? appDispatch({ type: "login", data: resp.data })(appDispatch({ type: "flashMessage", value: "You have successfully logged in!" })) : appDispatch({ type: "flashMessage", value: "Invalid username / password" })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setUsername(e.target.value)} name="username" className={"form-control form-control-sm input-dark " + !username ? "is-invalid" : ""} type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setPassword(e.target.value)} name="password" className={"form-control form-control-sm input-dark " + !password ? "is-invalid" : ""} type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  )
}

export default HeaderLoggedOut
