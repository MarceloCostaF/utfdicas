import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"

function ProfessorDetalhe() {
  const { id } = useParams()

  const [professor, setProfessor] = useState(null)
  const [dicas, setDicas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const { data: professorData, error: professorError } = await supabase
      .from("professores")
      .select("*")
      .eq("id", id)
      .single()

    const { data: dicasData, error: dicasError } = await supabase
      .from("dicas")
      .select(`
        *,
        materias (
          nome
        )
      `)
      .eq("professor_id", id)
      .order("created_at", { ascending: false })

    if (professorError || dicasError) {
      console.error("Erro ao carregar professor:", professorError || dicasError)
      setLoading(false)
      return
    }

    setProfessor(professorData)
    setDicas(dicasData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-slate-500">Carregando professor...</p>
        </main>
      </div>
    )
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-slate-500">Professor não encontrado.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">
            {professor.nome}
          </h1>

          <p className="mt-2 text-slate-600">
            Área: {professor.area || "Área não informada"}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {dicas.length}
              </p>
              <p className="text-sm text-slate-500">
                Dicas sobre este professor
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {dicas.reduce((total, dica) => total + (dica.curtidas || 0), 0)}
              </p>
              <p className="text-sm text-slate-500">
                Curtidas recebidas nas dicas
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Dicas da comunidade
          </h2>

          {dicas.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
              Ainda não há dicas sobre este professor.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {dicas.map((dica) => (
                <DicaCard
                key={dica.id}
                materia={dica.materias?.nome || "Matéria não informada"}
                materiaId={dica.materia_id}
                professor={professor.nome}
                professorId={professor.id}
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

export default ProfessorDetalhe