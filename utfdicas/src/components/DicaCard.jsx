import { Link } from "react-router-dom"

function DicaCard({
  materia,
  materiaId,
  professor,
  professorId,
  categoria,
  dica,
  autor,
  curtidas,
  onCurtir,
  curtido,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between gap-3">
        <div>
          {materiaId ? (
            <Link
              to={`/materia/${materiaId}`}
              className="text-lg font-semibold text-indigo-600 hover:underline"
            >
              {materia}
            </Link>
          ) : (
            <h2 className="text-lg font-semibold text-slate-800">{materia}</h2>
          )}

          {professorId ? (
            <Link
              to={`/professor/${professorId}`}
              className="block text-sm text-slate-500 hover:text-indigo-600"
            >
              {professor}
            </Link>
          ) : (
            <p className="text-sm text-slate-500">{professor}</p>
          )}
        </div>

        <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full h-fit">
          {categoria}
        </span>
      </div>

      <p className="mt-4 text-slate-700">{dica}</p>

      <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
        <span>Por {autor}</span>

        <button
          onClick={onCurtir}
          className={`rounded-xl px-3 py-2 ${
            curtido
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700"
          }`}
        >
          {curtido ? "💜 Curtido" : `👍 ${curtidas}`}
        </button>
      </div>
    </div>
  )
}

export default DicaCard