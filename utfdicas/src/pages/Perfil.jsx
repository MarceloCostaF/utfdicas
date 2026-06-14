import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"

function Perfil() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [dicas, setDicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [curtidasUsuario, setCurtidasUsuario] = useState([])

  useEffect(() => {
    carregarPerfil()
  }, [])

  function calcularNivel(qtdDicas) {
    if (qtdDicas >= 50) return "🥇 Especialista"
    if (qtdDicas >= 20) return "🥈 Mentor"
    if (qtdDicas >= 5) return "🥉 Colaborador"
    return "🌱 Iniciante"
  }

  async function curtirDica(id, curtidasAtuais) {
    if (!user) {
      alert("Você precisa estar logado para curtir.")
      return
    }

    const jaCurtiu = curtidasUsuario.includes(id)

    if (jaCurtiu) {
      await supabase
        .from("curtidas")
        .delete()
        .eq("user_id", user.id)
        .eq("dica_id", id)

      await supabase
        .from("dicas")
        .update({ curtidas: curtidasAtuais - 1 })
        .eq("id", id)

      setCurtidasUsuario((atual) =>
        atual.filter((dicaId) => dicaId !== id)
      )

      setDicas((atuais) =>
        atuais.map((dica) =>
          dica.id === id
            ? { ...dica, curtidas: curtidasAtuais - 1 }
            : dica
        )
      )
    } else {
      await supabase
        .from("curtidas")
        .insert({
          user_id: user.id,
          dica_id: id,
        })

      await supabase
        .from("dicas")
        .update({ curtidas: curtidasAtuais + 1 })
        .eq("id", id)

      setCurtidasUsuario((atual) => [...atual, id])

      setDicas((atuais) =>
        atuais.map((dica) =>
          dica.id === id
            ? { ...dica, curtidas: curtidasAtuais + 1 }
            : dica
        )
      )
    }
  }

  async function carregarPerfil() {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      navigate("/login")
      return
    }

    setUser(userData.user)

    const { data: perfilData } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", userData.user.id)
      .single()

    setPerfil(perfilData)

    if (userData.user) {
      const { data: curtidasData } = await supabase
        .from("curtidas")
        .select("dica_id")
        .eq("user_id", userData.user.id)

      setCurtidasUsuario(curtidasData?.map((c) => c.dica_id) || [])
    }

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
      console.error("Erro ao carregar dicas:", error)
      setLoading(false)
      return
    }

    setDicas(dicasData || [])
    setLoading(false)
  }

  const totalCurtidas = dicas.reduce(
    (total, dica) => total + (dica.curtidas || 0),
    0
  )

  const materiasComentadas = new Set(
    dicas.map((dica) => dica.materia_id)
  ).size

  const professoresComentados = new Set(
    dicas.map((dica) => dica.professor_id)
  ).size

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">
            Meu perfil
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            {perfil?.nome || "Usuário"}
          </h1>

          <p className="mt-2 text-slate-600">
            {perfil?.curso || "Curso não informado"}
            {perfil?.periodo ? ` — ${perfil.periodo}` : ""}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {user?.email}
          </p>

          <div className="mt-6 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            {calcularNivel(dicas.length)}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">
              {dicas.length}
            </p>
            <p className="text-sm text-slate-500">
              Dicas publicadas
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">
              {totalCurtidas}
            </p>
            <p className="text-sm text-slate-500">
              Curtidas recebidas
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">
              {materiasComentadas}
            </p>
            <p className="text-sm text-slate-500">
              Matérias comentadas
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">
              {professoresComentados}
            </p>
            <p className="text-sm text-slate-500">
              Professores comentados
            </p>
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
                  materiaId={dica.materia_id}
                  professor={dica.professores?.nome || "Professor não informado"}
                  professorId={dica.professor_id}
                  categoria={dica.categoria}
                  dica={dica.dica}
                  autor={dica.autor || "Anônimo"}
                  curtidas={dica.curtidas || 0}
                  curtido={curtidasUsuario.includes(dica.id)}
                  onCurtir={() => curtirDica(dica.id, dica.curtidas || 0)}
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