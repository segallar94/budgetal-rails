import _ from 'lodash';

export default {
  getRequest(path) {
    return request('GET', path, {})
  },
  postRequest(path, body={}) {
    return request('POST', path, body);
  },
  putRequest(path, body={}) {
    return request('PUT', path, body);
  },
  deleteRequest(path) {
    return request('DELETE', path);
  },
  patchRequest(path, body) {
    return request('PATCH', path, body);
  }
}

function requestOk(request) {
  return request.ok || [401, 422].includes(request.status);
}

function getSession() {
  var defaultSession = '{"authentication_token":"","authentication_key":""}';
  return JSON.parse(localStorage['session'] || defaultSession);
}

function requestHeaders() {
  var session = getSession();
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-AUTHENTICATION-TOKEN': session.authentication_token,
    'X-AUTHENTICATION-KEY': session.authentication_key
  }
}

function request(method, path, body) {
  var path = `/api${path}`;
  var headers = requestHeaders();
  var request = {method, headers};
  if (method !== 'GET')
    request.body = JSON.stringify(body);

  return fetch(path, request).then((r) => {
    if (r.status === 401) {
      localStorage.clear();
      let json = r.json();
      return json.then(Promise.reject.bind(Promise));
    } else if (r.ok) {
      return r.json();
    } else {
      return {success: false, message: r.statusText};
    }
  })
}