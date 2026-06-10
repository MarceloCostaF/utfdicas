import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

function Professores() {
  const [professores, setProfessores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarProfessores()
  }, [])

  async function carregarProfessores() {
    const { data, error } = await supabase
      .from("professores")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao carregar professores:", error)
      setLoading(false)
      return
    }

    setProfessores(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-800">Professores</h1>

        <p className="mt-2 text-slate-600">
          Veja experiências compartilhadas pelos alunos sobre diferentes professores.
        </p>

        {loading ? (
          <p className="mt-6 text-slate-500">Carregando professores...</p>
        ) : (
          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {professores.map((professor) => (
              <div
                key={professor.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-800">
                  {professor.nome}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {professor.area || "Área não informada"}
                </p>

                <Link
                to={`/professor/${professor.id}`}
                className="mt-6 block w-full rounded-xl border border-indigo-200 px-4 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                Ver dicas do professor
                </Link>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default Professores