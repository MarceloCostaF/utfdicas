import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"

function MateriaDetalhe() {

  const { id } = useParams()

  const [materia, setMateria] = useState(null)
  const [dicas, setDicas] = useState([])

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

    const { data: dicasData } =
      await supabase
        .from("dicas")
        .select(`
          *,
          professores(nome)
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-bold">
          {materia.nome}
        </h1>

        <p className="mt-2 text-slate-600">
          Categoria: {materia.categoria}
        </p>

        <p className="mt-2 text-slate-600">
          Dificuldade: {materia.dificuldade}/5
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
            autor={dica.autor || "Anônimo"}
            curtidas={dica.curtidas || 0}
            />
          ))}

        </div>

      </main>
    </div>
  )
}

export default MateriaDetalhe