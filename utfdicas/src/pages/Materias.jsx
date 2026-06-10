import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function Materias() {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")

  useEffect(() => {
    carregarMaterias()
  }, [])

  async function carregarMaterias() {
    const { data, error } = await supabase
      .from("materias")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao carregar matérias:", error)
      setLoading(false)
      return
    }

    setMaterias(data)
    setLoading(false)
  }

  const materiasFiltradas = materias.filter((materia) =>
    materia.nome
      ?.toLowerCase()
      .includes(busca.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Matérias</h1>

          <p className="mt-2 text-slate-600">
            Explore as disciplinas e veja onde os alunos recomendam focar.
          </p>

          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar matéria..."
            className="mt-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm outline-none focus:border-indigo-400"
          />
        </section>

        {loading ? (
          <p className="text-slate-500">Carregando matérias...</p>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materiasFiltradas.map((materia) => (
              <div
                key={materia.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {materia.nome}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {materia.categoria || "Sem categoria"}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    {materia.dificuldade || "-"} / 5
                  </span>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">
                      Dificuldade percebida
                    </span>
                    <span className="font-semibold text-slate-800">
                      {materia.dificuldade || "-"}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{
                        width: `${((materia.dificuldade || 0) / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  to={`/materia/${materia.id}`}
                  className="mt-6 block w-full rounded-xl border border-indigo-200 px-4 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Ver dicas da matéria
                </Link>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default Materias