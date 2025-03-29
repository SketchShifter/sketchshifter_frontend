'use clinet'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "./api";

type headersProps = {
  [key: string]: string
}
type fetchTokenProps = {
  path: string
  method?: string
  headers?: headersProps
  body?: any
}
type fetchTokenReturnPorps = {
  ok: boolean
  isLogin: boolean
  [key: string]: any
}
type reqDataProps = {
  method: string
  headers: any
  body?: any
}
export type ReturnDataProps = {
  id: string
  name: string
  email: string
  nickname: string
  role?: string
} | null

const getToken = async () => {
  const token = await localStorage.getItem('token');
  if (!token) {
    return { "status": false, "ok": false }
  } else {
    return { "status": true, "ok": true, "token": token }
  }
}

const fetchToken = async ({ path, method = 'GET', headers, body }: fetchTokenProps): Promise<fetchTokenReturnPorps> => {
  const tokens = await getToken()
  if (!tokens.status) {
    return {
      "error": "client has no token",
      "ok": false,
      "isLogin": false
    }
  }
  try {
    const token = tokens.token;
    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    const reqHeaders: headersProps = {
      ...defaultHeaders,
      ...headers
    }
    const requestdata: reqDataProps = {
      method: method,
      headers: reqHeaders
    }
    if (body) {
      requestdata.body = body;
    }
    const req = await fetch(`${API_URL}/auth/${path}`, requestdata);
    if (!req.ok) {
      return { error: "can't fetch", isLogin: true, ...req }
    }
    return { isLogin: true, ...req };
  } catch (error) {
    console.error("fetch error occured");
    return { error: error, ok: false, isLogin: true };
  }
}

const useAuth = () => {
  const [loginUser, setLoginUser] = useState({
    id: "",
    email: "",
    name: "",
    nickname: "",
    avater_url: "",
    bio: "",
    create_at: "",
    updated_at: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState({
    state: false,
    token: "",
    user: loginUser
  });
  const loginPagePath = "/user/login"

  const router = useRouter()

  useEffect(() => {
    const chkToken = async () => {
      const tokens = await getToken()
      if (!tokens.status || !tokens.token) {
        return { "state": false }
      }
      const token: string = tokens.token
      try {
        const res = await fetchToken({ path: `${API_URL}/auth/me` })
        if (!res.ok) {
          // router.push(loginPagePath)
          console.error("login failed")
          return { state: false };
        }
        const responce = await res.json()
        setLoginUser(responce);
        setIsLoggedIn({
          state: true,
          token: token,
          user: loginUser
        })
      } catch (error: any) {
        throw Error;
        return { state: false };
      }
    }
  }, [router])
  return isLoggedIn
}

const Password = async () => {
  const [current_password, setCurrentPassword] = useState("")
  const [new_password, setNewPassword] = useState("")

  const body = {
    "current_password": current_password,
    "new_password": new_password
  }
  const res = await fetchToken({
    path: 'password',
    method: 'PUT',
    body: body
  })

  if (!res.ok) {

  }

}

export const getAuthSession = async ({ id = undefined }: { id?: string } = { id: undefined }) => {
  const session = await getToken()
  if (!session.ok) {
    return null;
  }
  const user = await fetchToken({
    path: 'me'
  })
  if (!user.ok) {
    return null
  }
  if (id && user.id !== id) {
    return null
  }
  const returnData: ReturnDataProps = {
    id: user.id,
    name: user.name,
    email: user.email,
    nickname: user.nickname,
    // role: user.role
  }
  return returnData;
}