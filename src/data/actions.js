import fetch from 'isomorphic-fetch'
import { userapi_path, headers } from '../configs.js'

export const fetchWrapper = ({path, method='GET', body=null, handler, custom_headers, callback=()=>(null)}) => {
  return (dispatch) => {
    console.log("fetch " + path)
    console.log(body);
    return fetch(path, {
      credentials: "same-origin",
      headers: {...headers, ...custom_headers},
      method: method,
      body: body,
    }).then(response => {

      return response.text().then(data => {
  	  if (data) {
        try {
            data = JSON.parse(data)
        }
        catch (e) {
          // # do nothing
        }
      }
        dispatch(handler({status: response.status, data: data, headers:response.headers}))
        callback()
        return Promise.resolve(data)
      })
    }).catch(error => {
      console.log(error)
      dispatch(connectionError())
    })
  }
}


export const unauthorizedError = () => {
  return {
    type: 'REQUEST_ERROR',
    error: 'unauthorized'
  }
}

export const connectionError = () => {
  console.log('connection error')
  return {
    type: 'REQUEST_ERROR',
    error: 'connection_error'
  }
}


export const receiveUser = ({status, data}) => {
  switch (status) {
    case 200:
      return {
        type: 'RECEIVE_USER',
        user: data
      }
    default:
      return {
        type: 'FETCH_ERROR',
        error: data['error']
      }
  }
}



export const startFetchUser = () => {

}

export const fetchUser = () => {
  return fetchWrapper({
    path: userapi_path + "user/",
    handler: receiveUser
  })
}

export const requireAuth = (store, additionalHooks) => {
  return  (nextState, replace, callback) => {
    store.dispatch(fetchUser()).then(() =>{
      let { user } = store.getState();
      if (!user.username) {
        replace({ pathname: '/login', query: { next: nextState.location.pathname } });
      }
      if (additionalHooks){
        return additionalHooks();
      }
      else {
        Promise.resolve()
      }
    }).then(()=>callback())
  }
}
