import React, { useEffect, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { useParams, Link, useNavigate } from "react-router-dom"
import Page from "./Page"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.title
        draft.isFetching = false
        return
      case "titleChange":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) draft.sendCount++
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "You must provide a title"
        }
        return
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "You must provide a body content"
        }
        return
      case "notFound":
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)
  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: "titleRules", value: state.title.value }) //if user submits the form with errors, typing the enter key, this guy will triggers and stops submittion
    dispatch({ type: "bodyRules", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source() //it cancels the request
    async function fetchPost() {
      try {
        const resp = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
        if (resp.data) {
          dispatch({ type: "fetchComplete", value: resp.data })
          if (appState.user.username != resp.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You do not have permission to edit that post", alertType: "alert-warning" })
            //redirect to homepage
            navigate("/")
          }
        } else dispatch({ type: "notFound" })
      } catch (error) {
        appDispatch({ type: "flashMessage", value: "there was a problem or the request was cancelled", alertType: "alert-danger" })
      }
    }
    fetchPost()
    return () => ourRequest.cancel()
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" })
      const ourRequest = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const resp = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token })
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashMessage", value: "Post was updated!", alertType: "alert-success" })
        } catch (error) {
          appDispatch({ type: "flashMessage", value: "there was a problem or the request was cancelled", alertType: "alert-danger" })
        }
      }
      fetchPost()
      return () => ourRequest.cancel()
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value}>
            {" "}
          </textarea>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button disabled={state.isSaving} className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </Page>
  )
}

export default EditPost
