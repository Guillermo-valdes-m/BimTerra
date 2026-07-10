export default function EnConstruccion({ titulo, sprint }: { titulo: string; sprint: string }) {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <p className="cota-label">{sprint}</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-white">{titulo}</h1>
      <div className="panel mt-8 flex h-64 items-center justify-center">
        <p className="text-blueprint-400">Este módulo se construirá en un próximo sprint.</p>
      </div>
    </div>
  );
}
