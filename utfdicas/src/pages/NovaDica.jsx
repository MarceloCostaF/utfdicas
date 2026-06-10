import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

function NovaDica() {
  const [materias, setMaterias] = useState([])
  const [professores, setProfessores] = useState([])

  const [materiaId, setMateriaId] = useState("")
  const [professorId, setProfessorId] = useState("")
  const [categoria, setCategoria] = useState("Estudo")
  const [autor, setAutor] = useState("")
  const [dica, setDica] = useState("")

  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
  verificarLogin()
  carregarDados()
  }, [])

  async function verificarLogin() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      navigate("/login")
    }
  }

  async function carregarDados() {
    const { data: materiasData, error: materiasError } = await supabase
      .from("materias")
      .select("*")
      .order("nome", { ascending: true })

    const { data: professoresData, error: professoresError } = await supabase
      .from("professores")
      .select("*")
      .order("nome", { ascending: true })

    if (materiasError || professoresError) {
      console.error("Erro ao carregar dados:", materiasError || professoresError)
      return
    }

    setMaterias(materiasData)
    setProfessores(professoresData)
  }

  async function enviarDica(event) {
    event.preventDefault()
    setEnviando(true)
    setMensagem("")

    const { data: userData } =
      await supabase.auth.getUser()

    const { error } =
      await supabase
        .from("dicas")
        .insert({
          materia_id: Number(materiaId),
          professor_id: professorId
            ? Number(professorId)
            : null,
          categoria,
          dica,
          autor: userData.user.email,
          user_id: userData.user.id,
          curtidas: 0,
        })

    if (error) {
      console.error("Erro ao enviar dica:", error)
      setMensagem(`Erro: ${error.message}`)
      setEnviando(false)
      return
    }

    setMensagem("Dica enviada com sucesso!")
    setMateriaId("")
    setProfessorId("")
    setCategoria("Estudo")
    setAutor("")
    setDica("")
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-800">Nova Dica</h1>

        <p className="mt-2 text-slate-600">
          Compartilhe uma experiência que possa ajudar outros alunos.
        </p>

        <form
          onSubmit={enviarDica}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Matéria
            </label>

            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            >
              <option value="">Selecione uma matéria</option>

              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Professor
            </label>

            <select
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            >
              <option value="">Selecione um professor</option>

              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome} — {professor.area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Categoria
            </label>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            >
              <option>Estudo</option>
              <option>Prova</option>
              <option>Professor</option>
              <option>Laboratório</option>
              <option>Software</option>
              <option>Carreira</option>
              <option>Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Sua dica
            </label>

            <textarea
              rows="6"
              value={dica}
              onChange={(e) => setDica(e.target.value)}
              required
              placeholder="Conte o que estudar, como lidar com a matéria, onde focar..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            />
          </div>

          {mensagem && (
            <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar dica"}
          </button>
        </form>
      </main>
    </div>
  )
}

export default NovaDica