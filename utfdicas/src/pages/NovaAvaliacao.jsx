import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"

function NovaAvaliacao() {
  const navigate = useNavigate()

  const [professores, setProfessores] = useState([])
  const [materias, setMaterias] = useState([])

  const [professorId, setProfessorId] = useState("")
  const [materiaId, setMateriaId] = useState("")
  const [dificuldade, setDificuldade] = useState(3)
  const [recomendaria, setRecomendaria] = useState(true)
  const [comentario, setComentario] = useState("")

  const [mensagem, setMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    verificarLogin()
    carregarProfessores()
  }, [])

  async function verificarLogin() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      navigate("/login")
    }
  }

  async function carregarProfessores() {
    const { data, error } = await supabase
      .from("professores")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setProfessores(data || [])
  }

  async function carregarMateriasDoProfessor(id) {
    setProfessorId(id)
    setMateriaId("")

    if (!id) {
      setMaterias([])
      return
    }

    const { data, error } = await supabase
      .from("professor_materia")
      .select(`
        materias (
          id,
          nome
        )
      `)
      .eq("professor_id", id)

    if (error) {
      console.error(error)
      return
    }

    setMaterias(data.map((item) => item.materias))
  }

  async function enviarAvaliacao(e) {
    e.preventDefault()
    setEnviando(true)
    setMensagem("")

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("avaliacoes")
      .upsert({
        user_id: userData.user.id,
        materia_id: Number(materiaId),
        professor_id: Number(professorId),
        dificuldade: Number(dificuldade),
        recomendaria,
        comentario,
      }, {
        onConflict: "user_id,materia_id,professor_id"
      })

    if (error) {
      console.error(error)
      setMensagem("Erro ao salvar avaliação.")
      setEnviando(false)
      return
    }

    setMensagem("Avaliação salva com sucesso!")
    setDificuldade(3)
    setRecomendaria(true)
    setComentario("")
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-800">Nova Avaliação</h1>

        <p className="mt-2 text-slate-600">
          Avalie sua experiência com uma matéria e professor.
        </p>

        <form
          onSubmit={enviarAvaliacao}
          className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Professor
            </label>

            <select
              value={professorId}
              onChange={(e) => carregarMateriasDoProfessor(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            >
              <option value="">Selecione um professor</option>
              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Matéria
            </label>

            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              required
              disabled={!professorId}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 disabled:bg-slate-100"
            >
              <option value="">
                {professorId ? "Selecione uma matéria" : "Selecione um professor primeiro"}
              </option>

              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Dificuldade percebida: {dificuldade}
            </label>

            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              className="mt-3 w-full"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Tranquila</span>
              <span>Muito difícil</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Você recomendaria cursar com esse professor?
            </label>

            <select
              value={recomendaria ? "sim" : "nao"}
              onChange={(e) => setRecomendaria(e.target.value === "sim")}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            >
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Comentário opcional
            </label>

            <textarea
              rows="4"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ex: prova justa, cobra listas, explica bem..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            />
          </div>

          {mensagem && (
            <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              {mensagem}
            </p>
          )}

          <button
            disabled={enviando}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Salvar avaliação"}
          </button>
        </form>
      </main>
    </div>
  )
}

export default NovaAvaliacao