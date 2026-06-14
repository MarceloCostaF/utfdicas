import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"

function MateriaProfessorDetalhe() {
  const { materiaId, professorId } = useParams()

  const [materia, setMateria] = useState(null)
  const [professor, setProfessor] = useState(null)
  const [dicas, setDicas] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const { data: materiaData } = await supabase
      .from("materias")
      .select("*")
      .eq("id", materiaId)
      .single()

    const { data: professorData } = await supabase
      .from("professores")
      .select("*")
      .eq("id", professorId)
      .single()

    const { data: dicasData } = await supabase
      .from("dicas")
      .select(`
        *,
        perfis (
          nome
        )
      `)
      .eq("materia_id", materiaId)
      .eq("professor_id", professorId)
      .order("created_at", { ascending: false })

    const { data: avaliacoesData } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("materia_id", materiaId)
      .eq("professor_id", professorId)

    setMateria(materiaData)
    setProfessor(professorData)
    setDicas(dicasData || [])
    setAvaliacoes(avaliacoesData || [])
    setLoading(false)
  }

  const mediaDificuldade =
    avaliacoes.length > 0
      ? avaliacoes.reduce((soma, av) => soma + Number(av.dificuldade), 0) /
        avaliacoes.length
      : 0

  const percentualRecomendacao =
    avaliacoes.length > 0
      ? (avaliacoes.filter((av) => av.recomendaria).length /
          avaliacoes.length) *
        100
      : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-slate-500">Carregando...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-indigo-600">
            Experiência matéria + professor
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            {materia?.nome}
          </h1>

          <p className="mt-2 text-slate-600">
            com {professor?.nome}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {avaliacoes.length > 0
                  ? mediaDificuldade.toFixed(1)
                  : "-"}
              </p>
              <p className="text-sm text-slate-500">Dificuldade média</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {avaliacoes.length}
              </p>
              <p className="text-sm text-slate-500">Avaliações</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {avaliacoes.length > 0
                  ? `${percentualRecomendacao.toFixed(0)}%`
                  : "-"}
              </p>
              <p className="text-sm text-slate-500">Recomendariam</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Dicas específicas dessa combinação
          </h2>

          {dicas.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
              Ainda não há dicas para essa combinação.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {dicas.map((dica) => (
                <DicaCard
                  key={dica.id}
                  materia={materia?.nome}
                  materiaId={materia?.id}
                  professor={professor?.nome}
                  professorId={professor?.id}
                  categoria={dica.categoria}
                  dica={dica.dica}
                  autor={dica.perfis?.nome || dica.autor || "Anônimo"}
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

export default MateriaProfessorDetalhe