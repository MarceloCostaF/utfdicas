import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [modoCadastro, setModoCadastro] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState("")
  const [curso, setCurso] = useState("")
  const [periodo, setPeriodo] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem("")
    setErro("")
    setLoading(true)

    if (modoCadastro) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
            emailRedirectTo: "https://utfdicas-a1tr.vercel.app/login",
        },
        })

        if (error) {
        setErro(error.message)
        setLoading(false)
        return
        }

        await supabase.from("perfis").insert({
        id: data.user.id,
        nome,
        curso,
        periodo,
        })

      setLoading(false)

      if (error) {
        setErro(error.message)
        return
      }

      setMensagem("Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.")
      setModoCadastro(false)
      setSenha("")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    setLoading(false)

    if (error) {
      setErro("E-mail ou senha inválidos.")
      return
    }

    navigate("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="grid min-h-screen md:grid-cols-2">
        <section className="hidden bg-indigo-600 p-10 text-white md:flex md:flex-col md:justify-between">
          <Link to="/" className="text-2xl font-bold">
            UTFDicas
          </Link>

          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Aprenda com quem já passou pela disciplina.
            </h1>

            <p className="mt-4 text-indigo-100">
              Compartilhe dicas sobre matérias, professores, provas e estratégias
              de estudo com outros alunos.
            </p>
          </div>

          <p className="text-sm text-indigo-100">
            Plataforma colaborativa para estudantes.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <Link to="/" className="text-2xl font-bold text-indigo-600 md:hidden">
              UTFDicas
            </Link>

            <h2 className="mt-8 text-3xl font-bold text-slate-800 md:mt-0">
              {modoCadastro ? "Criar conta" : "Entrar na conta"}
            </h2>

            <p className="mt-2 text-slate-500">
              {modoCadastro
                ? "Crie sua conta para compartilhar dicas."
                : "Acesse para publicar dicas e interagir com a comunidade."}
            </p>

            {modoCadastro && (
                <>
                    <div>
                    <label className="text-sm font-medium text-slate-700">
                        Nome
                    </label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
                        required
                    />
                    </div>

                    <div>
                    <label className="text-sm font-medium text-slate-700">
                        Curso
                    </label>
                    <input
                        type="text"
                        value={curso}
                        onChange={(e) => setCurso(e.target.value)}
                        placeholder="Ex: Engenharia Química"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
                        required
                    />
                    </div>

                    <div>
                    <label className="text-sm font-medium text-slate-700">
                        Período
                    </label>
                    <input
                        type="text"
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        placeholder="Ex: 8º período"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
                    />
                    </div>
                </>
                )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
                  required
                />
              </div>

              {erro && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {erro}
                </p>
              )}

              {mensagem && (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  {mensagem}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading
                  ? "Carregando..."
                  : modoCadastro
                    ? "Criar conta"
                    : "Entrar"}
              </button>
            </form>

            <button
              onClick={() => {
                setModoCadastro(!modoCadastro)
                setErro("")
                setMensagem("")
              }}
              className="mt-6 w-full text-center text-sm font-medium text-indigo-600 hover:underline"
            >
              {modoCadastro
                ? "Já tenho uma conta"
                : "Ainda não tenho conta"}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Login