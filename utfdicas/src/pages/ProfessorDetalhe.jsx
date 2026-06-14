import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function ProfessorDetalhe() {
  const { id } = useParams()

  const [professor, setProfessor] = useState(null)
  const [dicas, setDicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [materiasProfessor, setMateriasProfessor] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [curtidasUsuario, setCurtidasUsuario] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])


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

  async function carregarDados() {
    const { data: professorData, error: professorError } = await supabase
      .from("professores")
      .select("*")
      .eq("id", id)
      .single()

    const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)

      if (userData.user) {
        const { data: curtidasData } = await supabase
          .from("curtidas")
          .select("dica_id")
          .eq("user_id", userData.user.id)

        setCurtidasUsuario(curtidasData?.map((c) => c.dica_id) || [])
      }

    const { data: materiasProfessor } = await supabase
      .from("professor_materia")
      .select(`
        materias (
          id,
          nome
        )
      `)
      .eq("professor_id", id)

    const { data: avaliacoesData, error: avaliacoesError } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("professor_id", id)

    if (avaliacoesError) {
      console.error("Erro ao carregar avaliações:", avaliacoesError)
    }

    setAvaliacoes(avaliacoesData || [])
      
    const { data: dicasData, error: dicasError } = await supabase
      .from("dicas")
      .select(`
        *,
        materias (
          nome
        ),
        perfis (
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
    setMateriasProfessor(
      materiasProfessor?.map((item) => item.materias) || []
    )
  }

  const mediaDificuldade =
    avaliacoes.length > 0
      ? avaliacoes.reduce(
          (soma, av) => soma + Number(av.dificuldade),
          0
        ) / avaliacoes.length
      : 0

  const percentualRecomendacao =
    avaliacoes.length > 0
      ? (
          avaliacoes.filter(
            (av) => av.recomendaria
          ).length /
          avaliacoes.length
        ) * 100
      : 0

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

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {mediaDificuldade.toFixed(1)}
              </p>

              <p className="text-sm text-slate-500">
                Dificuldade média
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {avaliacoes.length}
              </p>

              <p className="text-sm text-slate-500">
                Avaliações
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {percentualRecomendacao.toFixed(0)}%
              </p>

              <p className="text-sm text-slate-500">
                Recomendariam
              </p>
            </div>

          </div>

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
          
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">
              Matérias que leciona
            </h2>

            <div className="flex flex-wrap gap-2">
              {materiasProfessor.map((materia) => (
                <Link
                  key={materia.id}
                  to={`/materia/${materia.id}/professor/${id}`}
                  className="rounded-full bg-indigo-100 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-200"
                >
                  {materia.nome}
                </Link>
              ))}
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
                autor={dica.perfis?.nome || dica.autor || "Anônimo"}
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

export default ProfessorDetalhe