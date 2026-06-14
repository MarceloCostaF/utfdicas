import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Navbar() {
  const [user, setUser] = useState(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    buscarUsuario()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function buscarUsuario() {
    const { data } = await supabase.auth.getUser()
    setUser(data?.user || null)
  }

  async function sair() {
    await supabase.auth.signOut()
    setUser(null)
    setMenuAberto(false)
    navigate("/")
  }

  const fecharMenu = () => setMenuAberto(false)

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={fecharMenu}
          className="text-xl font-bold text-indigo-600 md:text-2xl"
        >
          UTFDicas
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/materias">Matérias</Link>
          <Link to="/professores">Professores</Link>
          <Link to="/nova-dica">Nova Dica</Link>
          <Link to="/nova-avaliacao">Nova Avaliação</Link>
          <Link to="/perfil">Perfil</Link>

          {user ? (
            <button
              onClick={sair}
              className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
            >
              Sair
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 md:hidden"
        >
          ☰
        </button>
      </div>

      {menuAberto && (
        <nav className="mt-4 grid gap-2 text-sm md:hidden">
          <Link onClick={fecharMenu} to="/materias" className="rounded-xl px-3 py-2 hover:bg-slate-100">
            📚 Matérias
          </Link>

          <Link onClick={fecharMenu} to="/professores" className="rounded-xl px-3 py-2 hover:bg-slate-100">
            👨‍🏫 Professores
          </Link>

          <Link onClick={fecharMenu} to="/nova-dica" className="rounded-xl px-3 py-2 hover:bg-slate-100">
            ✏️ Nova Dica
          </Link>

          <Link onClick={fecharMenu} to="/nova-avaliacao" className="rounded-xl px-3 py-2 hover:bg-slate-100">
            ⭐ Nova Avaliação
          </Link>

          <Link onClick={fecharMenu} to="/perfil" className="rounded-xl px-3 py-2 hover:bg-slate-100">
            👤 Perfil
          </Link>

          {user ? (
            <button
              onClick={sair}
              className="rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Sair
            </button>
          ) : (
            <Link
              onClick={fecharMenu}
              to="/login"
              className="rounded-xl bg-indigo-600 px-3 py-2 text-center font-semibold text-white"
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}

export default Navbar