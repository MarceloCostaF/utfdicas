import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Materias from "./pages/Materias"
import Professores from "./pages/Professores"
import NovaDica from "./pages/NovaDica"
import Perfil from "./pages/Perfil"
import MateriaDetalhe from "./pages/MateriaDetalhe"
import Login from "./pages/Login"
import ProfessorDetalhe from "./pages/ProfessorDetalhe"
import NovaAvaliacao from "./pages/NovaAvaliacao"
import MateriaProfessorDetalhe from "./pages/MateriaProfessorDetalhe"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/materias" element={<Materias />} />
        <Route path="/professores" element={<Professores />} />
        <Route path="/nova-dica" element={<NovaDica />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/professor/:id" element={<ProfessorDetalhe />} />
        <Route path="/nova-avaliacao" element={<NovaAvaliacao />} />
        <Route
          path="/materia/:materiaId/professor/:professorId"
          element={<MateriaProfessorDetalhe />}
        />

        <Route
          path="/materia/:id"
          element={<MateriaDetalhe />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App