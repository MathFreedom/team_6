import Link from "next/link";

const ROUTES = [
  { path: "/auth", label: "Auth — login / signup choice" },
  { path: "/signup/identity", label: "Signup 1/3 — Identity" },
  { path: "/signup/phone", label: "Signup 2/3 — Phone" },
  { path: "/signup/address", label: "Signup 3/3 — Address" },
  { path: "/scan-prm", label: "Scan PRM" },
  { path: "/contract/provider", label: "Contract 1/3 — Provider" },
  { path: "/contract/tariff", label: "Contract 2/3 — Tariff" },
  { path: "/contract/offer", label: "Contract 3/3 — Offer" },
  { path: "/analyzing", label: "Analyzing (15s loading)" },
  { path: "/results", label: "Results — top 3 offers" },
  { path: "/mandate", label: "Mandate — sign SEPA" },
  { path: "/success", label: "Success — confettis" },
  { path: "/dashboard", label: "Dashboard — app home" },
];

export default function PreviewIndex() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white px-6 py-12 text-[#0a1628]">
      <h1 className="text-2xl font-semibold">Nova — preview</h1>
      <p className="mt-1 text-sm text-[#5a6b80]">
        Index dev pour naviguer entre les écrans.
      </p>
      <ul className="mt-6 flex flex-col gap-2">
        {ROUTES.map((r) => (
          <li key={r.path}>
            <Link
              href={r.path}
              className="flex h-14 items-center justify-between rounded-2xl border bg-white px-4 transition-colors hover:bg-gray-50"
              style={{ borderColor: "rgba(10,22,40,0.08)" }}
            >
              <span className="flex flex-col">
                <span className="font-mono text-xs text-[#5a6b80]">{r.path}</span>
                <span className="text-sm font-medium">{r.label}</span>
              </span>
              <span className="text-[#1e40af]">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
