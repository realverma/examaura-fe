import { Link } from "react-router";
import { ArrowUpRight, BookOpen, Github } from "lucide-react";

const certificationLinks = [
  { label: "Microsoft Azure", href: "/category/azure" },
  { label: "AWS Cloud", href: "/category/aws" },
  { label: "Salesforce", href: "/category/salesforce" },
  { label: "All quizzes", href: "/quizzes" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-[#0b1f50] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1e40af]">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">ExamAura</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100/65">
              Focused certification practice for people who want to understand the material, not just memorize the answers.
            </p>
            <Link
              to="/create-quiz"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#10b981] px-4 py-2.5 text-sm font-bold text-emerald-950 transition-colors hover:bg-[#34d399]"
            >
              Create your own quiz
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Certifications</h2>
            <ul className="mt-5 space-y-3">
              {certificationLinks.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm text-white/65 transition-colors hover:text-white" to={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">QuizMaster</h2>
            <ul className="mt-5 space-y-3">
              <li><Link className="text-sm text-white/65 transition-colors hover:text-white" to="/">Home</Link></li>
              <li><Link className="text-sm text-white/65 transition-colors hover:text-white" to="/profile">Your progress</Link></li>
              <li><Link className="text-sm text-white/65 transition-colors hover:text-white" to="/create-quiz">Create a quiz</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-blue-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ExamAura. Learn deliberately.</p>
          <div className="flex items-center gap-5">
            <span>Practice smarter. Certify sooner.</span>
            <a href="https://github.com" aria-label="ExamAura on GitHub" className="transition-colors hover:text-white">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
