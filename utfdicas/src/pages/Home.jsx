import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import DicaCard from "../components/DicaCard"
import { supabase } from "../lib/supabase"

function Home() {
  const [dicas, setDicas] = useState([])
  const [materiasAlta, setMateriasAlta] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [totalProfessores, setTotalProfessores] = useState(0)
  const [curtidasUsuario, setCurtidasUsuario] = useState([])
  const [user, setUser] = useState(null)
  const [materiaTop, setMateriaTop] = useState(null)
  const [professorTop, setProfessorTop] = useState(null)
  const [ultimaDica, setUltimaDica] = useState(null)

  useEffect(() => {
    carregarHome()
  }, [])

  async function carregarHome() {

    const {
      data: dicasData,
      error: dicasError
    } = await supabase
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
      .order("created_at", {
        ascending: false
      })

    const {
      data: materiasData,
      error: materiasError
    } = await supabase
      .from("materias")
      .select("*")
      .order("dificuldade", {
        ascending: false
      })
      .limit(4)

    const {
      data: professoresData,
      error: professoresError
    } = await supabase
      .from("professores")
      .select("*")

    const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)

      if (userData.user) {
        const { data: curtidasData } = await supabase
          .from("curtidas")
          .select("dica_id")
          .eq("user_id", userData.user.id)

        setCurtidasUsuario(curtidasData?.map((c) => c.dica_id) || [])
      }
      
    if (
      dicasError ||
      materiasError ||
      professoresError
    ) {
      console.error(
        dicasError ||
        materiasError ||
        professoresError
      )

      setLoading(false)
      return
    }

    setDicas(dicasData || [])
    setMateriasAlta(materiasData || [])
    setTotalProfessores(professoresData?.length || 0)

    setLoading(false)
    
    if (dicasData?.length > 0) {
      setUltimaDica(dicasData[0])
    }

    const contadorProfessores = {}

    dicasData?.forEach((dica) => {
      const nome = dica.professores?.nome

      if (!nome) return

      contadorProfessores[nome] =
        (contadorProfessores[nome] || 0) + 1
    })

    const professorMaisComentado =
      Object.entries(contadorProfessores)
        .sort((a, b) => b[1] - a[1])[0]

    if (professorMaisComentado) {
      setProfessorTop({
        nome: professorMaisComentado[0],
        quantidade: professorMaisComentado[1],
      })
    }

    const contadorMaterias = {}

    dicasData?.forEach((dica) => {
      const nome = dica.materias?.nome

      if (!nome) return

      contadorMaterias[nome] =
        (contadorMaterias[nome] || 0) + 1
    })

    const materiaMaisComentada =
      Object.entries(contadorMaterias)
        .sort((a, b) => b[1] - a[1])[0]

    if (materiaMaisComentada) {
      setMateriaTop({
        nome: materiaMaisComentada[0],
        quantidade: materiaMaisComentada[1],
      })
    }

  }

  async function curtirDica(id, curtidasAtuais) {
    if (!user) {
      alert("Você precisa estar logado para curtir.")
      return
    }

    const jaCurtiu = curtidasUsuario.includes(id)

    if (jaCurtiu) {
      const { error } = await supabase
        .from("curtidas")
        .delete()
        .eq("user_id", user.id)
        .eq("dica_id", id)

      if (error) {
        console.error("Erro ao remover curtida:", error)
        return
      }

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
      const { error } = await supabase
        .from("curtidas")
        .insert({
          user_id: user.id,
          dica_id: id,
        })

      if (error) {
        console.error("Erro ao curtir:", error)
        return
      }

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

  const dicasFiltradas = dicas.filter((dica) => {
    const textoBusca = busca.toLowerCase()

    return (
      dica.dica?.toLowerCase().includes(textoBusca) ||
      dica.categoria?.toLowerCase().includes(textoBusca) ||
      dica.autor?.toLowerCase().includes(textoBusca) ||
      dica.materias?.nome?.toLowerCase().includes(textoBusca) ||
      dica.professores?.nome?.toLowerCase().includes(textoBusca)
    )
  })

  const totalCurtidas = dicas.reduce(
    (total, dica) => total + (dica.curtidas || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Aprenda com quem já passou pela matéria
          </h2>

          <p className="mt-2 text-slate-600">
            Dicas sobre disciplinas, professores, provas e estratégias de estudo.
          </p>

          <div className="mt-6">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar matéria, professor ou dica..."
              className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">
                {materiasAlta.length}
              </p>
              <p className="text-sm text-slate-500">Matérias em destaque</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">
                {totalProfessores}
              </p>
              <p className="text-sm text-slate-500">Professores cadastrados</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">
                {dicas.length}
              </p>
              <p className="text-sm text-slate-500">Dicas compartilhadas</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">
                {totalCurtidas}
              </p>
              <p className="text-sm text-slate-500">Curtidas recebidas</p>
            </div>
          </div>
        </section>

        <section className="mt-8 mb-12">
          <h3 className="mb-4 text-xl font-bold text-slate-800">
            Destaques da Comunidade
          </h3>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                🔥 Matéria mais comentada
              </p>

              <h4 className="mt-2 text-lg font-semibold">
                {materiaTop?.nome || "-"}
              </h4>

              <p className="text-sm text-slate-500">
                {materiaTop?.quantidade || 0} dicas
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                👨‍🏫 Professor mais comentado
              </p>

              <h4 className="mt-2 text-lg font-semibold">
                {professorTop?.nome || "-"}
              </h4>

              <p className="text-sm text-slate-500">
                {professorTop?.quantidade || 0} dicas
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                💡 Última dica enviada
              </p>

              <h4 className="mt-2 text-lg font-semibold">
                {ultimaDica?.materias?.nome || "-"}
              </h4>

              <p className="text-sm text-slate-500 line-clamp-2">
                {ultimaDica?.dica || ""}
              </p>
            </div>

          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">
              Matérias em alta
            </h3>

            <Link to="/materias" className="text-sm text-indigo-600">
              Ver todas
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {materiasAlta.map((materia) => (
              <div
                key={materia.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h4 className="font-semibold text-slate-800">
                  {materia.nome}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Dificuldade: {materia.dificuldade || "-"} / 5
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-bold text-slate-800">
            Dicas
          </h3>

          {loading ? (
            <p className="text-slate-500">Carregando dicas...</p>
          ) : dicasFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
              Ainda não há dicas cadastradas.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {dicasFiltradas.map((dica) => (
                <DicaCard
                  key={dica.id}
                  materia={dica.materias?.nome || "Matéria não informada"}
                  professor={dica.professores?.nome || "Professor não informado"}
                  categoria={dica.categoria}
                  dica={dica.dica}
                  autor={dica.autor || "Anônimo"}
                  curtidas={dica.curtidas || 0}
                  onCurtir={() => curtirDica(dica.id, dica.curtidas || 0)}
                  materiaId={dica.materia_id}
                  professorId={dica.professor_id}
                  curtido={curtidasUsuario.includes(dica.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Link
        to="/nova-dica"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-3xl text-white shadow-lg hover:bg-indigo-700"
      >
        +
      </Link>
    </div>
  )
}

export default Home