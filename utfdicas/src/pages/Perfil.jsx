import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"

function Perfil() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [dicas, setDicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    carregarPerfil()
  }, [])

  async function carregarPerfil() {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      navigate("/login")
      return
    }

    setUser(userData.user)

    const { data: perfilData, error: perfilError } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", userData.user.id)
      .single()

    if (perfilError) {
      console.error("Erro ao carregar perfil:", perfilError)
    }

    setPerfil(perfilData)

    const { data: dicasData, error } = await supabase
      .from("dicas")
      .select(`
        *,
        materias (
          nome
        ),
        professores (
          nome
        )
      `)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar dicas do usuário:", error)
      setLoading(false)
      return
    }

    setDicas(dicasData || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">
            {perfil?.nome || "Meu Perfil"}
          </h1>

          <p className="mt-2 text-slate-600">
            {perfil?.curso || "Curso não informado"}
            {perfil?.periodo ? ` — ${perfil.periodo}` : ""}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {user?.email}
          </p>

          {perfil?.bio && (
            <p className="mt-4 text-slate-600">
              {perfil.bio}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {dicas.length}
              </p>
              <p className="text-sm text-slate-500">Dicas publicadas</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {dicas.reduce((total, dica) => total + (dica.curtidas || 0), 0)}
              </p>
              <p className="text-sm text-slate-500">Curtidas recebidas</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {new Set(dicas.map((dica) => dica.materia_id)).size}
              </p>
              <p className="text-sm text-slate-500">Matérias comentadas</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Minhas dicas
          </h2>

          {loading ? (
            <p className="text-slate-500">Carregando suas dicas...</p>
          ) : dicas.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
              Você ainda não publicou nenhuma dica.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {dicas.map((dica) => (
                <DicaCard
                  key={dica.id}
                  materia={dica.materias?.nome || "Matéria não informada"}
                  professor={dica.professores?.nome || "Professor não informado"}
                  categoria={dica.categoria}
                  dica={dica.dica}
                  autor={dica.autor || "Anônimo"}
                  curtidas={dica.curtidas || 0}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Perfil