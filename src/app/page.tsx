import { supabase } from "@/lib/supabase"
import PageView from "@/components/PageView"
import RealtimeStats from "@/components/RealtimeStats"
import Image from "next/image"
import Link from "next/link"
import { TrendingUp, Presentation, Briefcase, Landmark } from "lucide-react"

// Force dynamic rendering since we want fresh data
export const revalidate = 0

async function getDashboardData() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [statsRes, cacheRes] = await Promise.all([
    supabase.from("estatisticas_gerais").select("*").eq("data", todayStr).limit(1),
    supabase.from("dashboard_cache").select("*").eq("id", 1).single()
  ])
  
  return {
    estatisticas: statsRes.data && statsRes.data.length > 0 ? statsRes.data[0] : null,
    cache: cacheRes.data
  }
}

export default async function Home() {
  let data
  try {
    data = await getDashboardData()
  } catch (error) {
    console.error("Supabase connection error:", error)
  }

  const estatisticas = data?.estatisticas || {
    total_hoje: 0,
    total_mes: 0,
    total_ano: 0
  }
  
  const cache = data?.cache || {
    top_produtos: [],
    top_servicos: [],
    top_orgaos: []
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-50 relative selection:bg-cta/30">
      
      {/* Premium Background Effects (Liquid Glass Blur Orbs) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="pt-8 pb-4 px-6 flex justify-center items-center shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <Image src="/identidade/logooportunometrolicibusca.png" alt="Oportunômetro" width={180} height={40} className="object-contain drop-shadow-md" />
        </div>
      </header>

      {/* Main PageView Area */}
      <main className="flex-1 relative min-h-0 w-full mb-2 z-10">
        <PageView>
          {/* Slide 1: Totais */}
          <RealtimeStats initialData={estatisticas} />

          {/* Slide 2: Produtos e Serviços */}
          <div className="flex flex-col gap-6 h-full">
            <div className="flex-1 flex flex-col min-h-0 bg-primary/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">
              <h2 className="text-sm font-mono text-cta font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Top 3 Produtos
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto hide-scroll flex-1">
                {cache.top_produtos?.map((item: any, idx: number) => {
                  const dotColor = item.bg ? item.bg.replace('/10', '') : 'bg-blue-400';
                  const textColor = item.color || 'text-slate-300';
                  const itemName = item.nome && typeof item === 'object' ? item.nome : item;
                  return (
                  <div key={idx} className="flex items-center gap-3 p-1 rounded transition-colors hover:bg-white/5">
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate font-medium">{itemName}</p>
                    </div>
                    {item.valor && (
                      <div className={`font-mono text-sm ${textColor} font-medium shrink-0`}>
                        R$ {Math.round(item.valor).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-primary/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">
              <h2 className="text-sm font-mono text-cta font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Presentation className="w-4 h-4" /> Top 3 Serviços
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto hide-scroll flex-1">
                {cache.top_servicos?.map((item: any, idx: number) => {
                  const dotColor = item.bg ? item.bg.replace('/10', '') : 'bg-emerald-400';
                  const textColor = item.color || 'text-slate-300';
                  const itemName = item.nome && typeof item === 'object' ? item.nome : item;
                  return (
                  <div key={idx} className="flex items-center gap-3 p-1 rounded transition-colors hover:bg-white/5">
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate font-medium">{itemName}</p>
                    </div>
                    {item.valor && (
                      <div className={`font-mono text-sm ${textColor} font-medium shrink-0`}>
                        R$ {Math.round(item.valor).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>
          </div>

          {/* Slide 3: Órgãos */}
          <div className="h-full">
            <div className="bg-primary/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5 min-h-[400px] shadow-xl h-full flex flex-col">
              <h2 className="text-sm font-mono text-cta font-bold uppercase tracking-wider mb-5 flex items-center gap-2 shrink-0">
                <Landmark className="w-4 h-4" /> Top 5 Órgãos Comprando
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto hide-scroll pb-4 flex-1">
                {cache.top_orgaos?.map((item: any, idx: number) => {
                  const itemName = item.nome && typeof item === 'object' ? item.nome : item;
                  return (
                  <div key={idx} className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-3 border border-white/5 hover:bg-slate-800/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400 font-bold shrink-0 shadow-inner">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{itemName}</p>
                      {item.qtd_editais && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.qtd_editais} editais abertos {item.uf ? `• ${item.uf}` : ''}</p>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </PageView>
      </main>

      {/* Sticky Footer */}
      <footer className="shrink-0 px-5 pt-3 pb-8 relative z-20">
        <div className="absolute top-[-30px] left-0 w-full h-[30px] bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        <Link 
          href="https://app.licibusca.com" 
          className="w-full bg-cta hover:bg-emerald-500 text-white font-mono font-bold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 group"
        >
          Acessar Plataforma
        </Link>
        <div className="mt-5 text-center">
          <span className="text-xs text-slate-500 font-sans tracking-wide">
            Desenvolvido por <Link href="https://licibusca.com" className="text-slate-300 hover:text-cta transition-colors border-b border-white/10 pb-[1px]">licibusca.com</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
