import { useNavigate } from "react-router-dom"
import api from "../service/api"
import { useForm } from "react-hook-form"

interface LoginForm {
    email: string,
    senha: string
}

const Login = () => {

    const navigate = useNavigate()

    const { register, handleSubmit, formState:{errors}, } = useForm<LoginForm>()

    async function HandleLogin(dados: LoginForm) {
        try {
            const RespostaAPI = await api.post("/login", dados)
            localStorage.setItem("@Wedding: token", RespostaAPI.data.token)
            localStorage.setItem("@Wedding: cargo", RespostaAPI.data.pessoa.cargo)
            if(RespostaAPI.data.pessoa.cargo === 'USUARIO'){
                navigate('/usuario')
            }else if(RespostaAPI.data.pessoa.cargo === 'TECNICO'){
                navigate("/dashboard")
            }

            console.log(RespostaAPI.data)
        } catch (error) {
            console.error("Falha: ", error)
        }
    }
  return (
    <main  className="bg-gray-300 min-h-screen flex justify-center items-center">
        <div className="flex flex-col gap-17">
            <h1 className="text-5xl text-blue-950 font-bold text-center">Help-Desk</h1>
            <form  onSubmit={handleSubmit(HandleLogin)} className="max-w-100 bg-gray-100 rounded-2xl flex flex-col">
                <div className="p-3 text-center">
                    <h1 className="text-5xl text-blue-950 font-semibold">Login</h1>
                </div>
                <div className="px-10 py-2">
                    <h1 className="text-5xl text-blue-950 font-normal py-4">Email</h1>
                    <input {...register("email", {required:"Email obrigatório."})} className="p-1 border-2 border-blue-950 rounded-2xl text-2xl" type="email" />
                    {errors.email && <span className="text-[16px] text-red-600">{errors.email.message}</span>}
                </div>
                <div className="px-10 py-2">
                    <h1 className="text-5xl text-blue-950 font-normal py-4">Senha</h1>
                    <input {...register("senha", {required:"Senha obrigatória."})} className="p-1 border-2 border-blue-950 rounded-2xl text-2xl" type="password" />
                    {errors.senha && <span className="text-[16px] text-red-600">{errors.senha.message}</span>}
                </div>
                <div className="flex justify-center m-2">
                    <button className="text-4xl text-white bg-blue-950 py-5 my-2 rounded-3xl cursor-pointer px-25">
                        Entrar
                    </button>
                </div>
            </form>
        </div>
    </main>
  )
}

export default Login