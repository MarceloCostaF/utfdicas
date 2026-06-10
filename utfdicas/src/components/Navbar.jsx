import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

function Navbar() {
  const [user, setUser] = useState(null)
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
    navigate("/")
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          UTFDicas
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/materias">Matérias</Link>
          <Link to="/professores">Professores</Link>
          <Link to="/nova-dica">Nova Dica</Link>
          <Link to="/perfil">Perfil</Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                {user.email}
              </span>

              <button
                onClick={sair}
                className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar