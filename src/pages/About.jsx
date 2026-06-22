export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">About Algodeck</h1>

      <section className="prose-dsa space-y-4 text-text">
        <p>
          Algodeck is a personal <strong>DSA trainer</strong> built for the way I actually want to learn:
          curated problems, real code execution, and a no-judgment flow that respects the struggle.
        </p>

        <h2>The 3-click rule</h2>
        <p>
          Every problem hides its solution behind <strong>three clicks</strong>. Click 1 shows you a
          <em> reframe</em> — a different angle on what the problem is asking. Click 2 reveals the
          <em> approach</em> — high-level strategy, still no code. Click 3 finally opens the full solution
          with complexity analysis and language tabs.
        </p>
        <p>
          Each click costs you <strong>5 XP</strong>. Closing the modal mid-flow resets your progress,
          so you can't peek without committing. The whole point is: <em>try first, escalate second</em>.
        </p>

        <h2>Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> Vite + React + TailwindCSS</li>
          <li><strong>Editor:</strong> Monaco (the engine behind VSCode)</li>
          <li><strong>Execution:</strong> Piston API (free public sandbox, supports JS/Python/Java/C++/Go)</li>
          <li><strong>Backend:</strong> Supabase Postgres (progress, activity, achievements)</li>
          <li><strong>Auth:</strong> None — just a handle. No passwords, no friction.</li>
        </ul>

        <h2>Why</h2>
        <p>
          LeetCode is great but the solutions are right there in one click — too easy to peek.
          boot.dev has the right vibes (gamified, dark, satisfying) but its problems don't teach
          you interview patterns. Algodeck is the intersection.
        </p>

        <h2>Credits</h2>
        <p>
          Built by <a href="https://github.com/dapealfy">Daffa Reri</a>. Problems curated from the
          NeetCode 150 set. Solutions hand-written (or adapted from community references).
        </p>
      </section>
    </div>
  )
}