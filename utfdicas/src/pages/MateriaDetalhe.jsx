import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function MateriaDetalhe() {

  const { id } = useParams()

  const [materia, setMateria] = useState(null)
  const [dicas, setDicas] = useState([])
  const [professoresMateria, setProfessoresMateria] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {

    const { data: materiaData } =
      await supabase
        .from("materias")
        .select("*")
        .eq("id", id)
        .single()
    
    const { data: avaliacoesData, error: avaliacoesError } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("materia_id", id)

    if (avaliacoesError) {
      console.error("Erro ao carregar avaliações:", avaliacoesError)
    }

    setAvaliacoes(avaliacoesData || [])

    const { data: professoresData, error: professoresError } =
      await supabase
        .from("professor_materia")
        .select(`
          professores (
            id,
            nome
          )
        `)
        .eq("materia_id", id)
    
    if (professoresError) {
      console.error(professoresError)
    }

    setProfessoresMateria(
      professoresData?.map((item) => item.professores) || []
    )

    const { data: dicasData } =
      await supabase
        .from("dicas")
        .select(`
          *,
          professores (
            nome
          ),
          perfis (
            nome
          )
        `)
        .eq("materia_id", id)
        .order("created_at", {
          ascending: false
        })

    setMateria(materiaData)
    setDicas(dicasData || [])
  }

  if (!materia) {
    return <p>Carregando...</p>
  }
  
  const mediaDificuldade =
    avaliacoes.length > 0
      ? avaliacoes.reduce((soma, av) => soma + Number(av.dificuldade), 0) /
        avaliacoes.length
      : 0

  const percentualRecomendacao =
    avaliacoes.length > 0
      ? (avaliacoes.filter((av) => av.recomendaria).length / avaliacoes.length) * 100
      : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-bold">
          {materia.nome}
        </h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-2xl font-bold text-indigo-600">
            {mediaDificuldade.toFixed(1)}
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
            {percentualRecomendacao.toFixed(0)}%
          </p>
          <p className="text-sm text-slate-500">Recomendariam</p>
        </div>
      </div>

        <div className="mt-6">
          <h2 className="font-semibold text-slate-800">
            Professores que lecionam
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {professoresMateria.map((professor) => (
              <Link
                key={professor.id}
                to={`/materia/${id}/professor/${professor.id}`}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-200"
              >
                {professor.nome}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-2 text-slate-600">
          Categoria: {materia.categoria}
        </p>

        <h2 className="mt-10 mb-4 text-xl font-bold">
          Dicas da comunidade
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          {dicas.map((dica) => (
            <DicaCard
            key={dica.id}
            materia={materia.nome}
            materiaId={materia.id}
            professor={dica.professores?.nome || "Professor não informado"}
            professorId={dica.professor_id}
            categoria={dica.categoria}
            dica={dica.dica}
            autor={dica.perfis?.nome || dica.autor || "Anônimo"}
            curtidas={dica.curtidas || 0}
            />
          ))}

        </div>

      </main>
    </div>
  )
}

export default MateriaDetalhe