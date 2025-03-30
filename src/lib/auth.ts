'use client';

type headersProps = {
  [key: string]: string;
};
type fetchTokenProps = {
  path: string;
  method?: string;
  headers?: headersProps;
  body?: Record<string, unknown>;
};
type fetchTokenReturnPorps = {
  ok: boolean;
  isLogin: boolean;
  [key: string]: unknown;
};
type reqDataProps = {
  method: string;
  headers: headersProps;
  body?: Record<string, unknown>;
};
export type ReturnDataProps = {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role?: string;
} | null;

export const getToken = async () => {
  const token = await localStorage.getItem('token');
  if (!token) {
    return { status: false, ok: false };
  } else {
    return { status: true, ok: true, token: token };
  }
};

const fetchToken = async ({
  path,
  method = 'GET',
  headers,
  body,
}: fetchTokenProps): Promise<fetchTokenReturnPorps> => {
  const tokens = await getToken();
  if (!tokens.status) {
    console.error('Tokens status is false');
    return {
      error: 'client has no token',
      ok: false,
      isLogin: false,
    };
  }
  try {
    const token = tokens.token;
    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const reqHeaders: headersProps = {
      ...defaultHeaders,
      ...headers,
    };
    const requestdata: reqDataProps = {
      method: method,
      headers: reqHeaders,
    };
    if (body) {
      requestdata.body = body;
    }
    // console.log(requestdata)
    const req = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/${path}`,
      requestdata as RequestInit
    );

    // if (!req.ok) {
    //   return { error: "can't fetch", isLogin: true, ...req }
    // }
    const reqData = await req.json();
    return { isLogin: true, ok: true, ...reqData };
  } catch (error) {
    throw new Error(`Error fetching auth session: ${error}`);
  }
};

// const useAuth = () => {
//   const [loginUser, setLoginUser] = useState({
//     id: "",
//     email: "",
//     name: "",
//     nickname: "",
//     avater_url: "",
//     bio: "",
//     create_at: "",
//     updated_at: ""
//   });
//   const [isLoggedIn, setIsLoggedIn] = useState({
//     state: false,
//     token: "",
//     user: loginUser
//   });
//   const loginPagePath = "/user/login"

//   const router = useRouter()

//   useEffect(() => {
//     const chkToken = async () => {
//       const tokens = await getToken()
//       if (!tokens.status || !tokens.token) {
//         return { "state": false }
//       }
//       const token: string = tokens.token
//       try {
//         const res = await fetchToken({
//           path: 'me'
//         })
//         if (!res.ok) {
//           // router.push(loginPagePath)
//           console.error("login failed")
//           return { state: false };
//         }
//         const responce = await res.json()
//         setLoginUser(responce);
//         setIsLoggedIn({
//           state: true,
//           token: token,
//           user: loginUser
//         })
//       } catch (error: any) {
//         throw Error;
//         return { state: false };
//       }
//     }
//   }, [router])
//   return isLoggedIn
// }

// const Password = async () => {
//   const [current_password, setCurrentPassword] = useState("")
//   const [new_password, setNewPassword] = useState("")

//   const body = {
//     "current_password": current_password,
//     "new_password": new_password
//   }
//   const res = await fetchToken({
//     path: 'password',
//     method: 'PUT',
//     body: body
//   })

//   if (!res.ok) {

//   }

// }

export const getAuthSession = async ({ id }: { id?: string } = { id: undefined }) => {
  // const dummy:ReturnDataProps = {
  //   id: "sheep",
  //   name: "ひつじ",
  //   nickname: "ひつじ",
  //   email: "hogehoge@huga.nya"
  // }
  // return(dummy)
  const session = await getToken();
  if (!session.ok) {
    return null;
  }
  const user = await fetchToken({
    path: 'me',
  });
  if (!user.ok) {
    console.error('Failed to fetch user data');
    throw new Error(`HTTP error! status: ${JSON.stringify(user)}`);
  }
  if (id && user.id !== id) {
    console.warn(`User ID mismatch: expected ${id}, get ${user.id}`);
    return null;
  }
  const returnData: ReturnDataProps = {
    id: user.id as string,
    name: user.name as string,
    nickname: user.nickname as string,
    email: user.email as string,
    // "role": user.role as string
  };
  return returnData;
};
