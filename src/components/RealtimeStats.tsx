"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import NumberTicker from "@/components/NumberTicker"

export default function RealtimeStats({ initialData }: { initialData: any }) {
  const [totais, setTotais] = useState(initialData)

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const fetchTotais = async () => {
      // Busca a última linha registrada (Regra 1: Contínuo)
      const { data } = await supabase
        .from('estatisticas_gerais')
        .select('*')
        .order('data', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const ultimo = data[0];
        if (ultimo.data === todayStr) {
          setTotais(ultimo);
        } else {
          // Se for um novo dia sem licitações, herda Ano e Mês, mas zera o Hoje
          const isMesmoMes = ultimo.data.substring(0, 7) === todayStr.substring(0, 7);
          const isMesmoAno = ultimo.data.substring(0, 4) === todayStr.substring(0, 4);

          setTotais({
            total_hoje: 0,
            total_mes: isMesmoMes ? ultimo.total_mes : 0,
            total_ano: isMesmoAno ? ultimo.total_ano : 0
          });
        }
      } else {
        setTotais({ total_hoje: 0, total_mes: 0, total_ano: 0 });
      }
    };
    fetchTotais();

    // Escuta QUALQUER mudança, sem filtro de data, para pegar o momento exato que "Hoje" nasce
    const channel = supabase.channel('realtime_totais')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'estatisticas_gerais' },
        (payload) => {
          // Avisamos o TypeScript para não encher o saco com a tipagem aqui
          const newData = payload.new as any;

          if (newData && newData.data === todayStr) {
            console.log('NOVO DADO RECEBIDO DO SUPABASE:', newData);
            setTotais(newData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center gap-3 h-full pt-1 pb-1 w-full">

      {/* Card 1 */}
      <div className="flex-1 bg-primary/40 backdrop-blur-xl rounded-2xl p-2 border border-white/5 shadow-2xl transition-all duration-300 flex flex-col items-center justify-center min-h-0 w-full overflow-hidden">
        <div className="w-full flex flex-col items-center justify-center text-center space-y-2 py-4">
          <div className="flex items-baseline justify-center gap-2 w-full">
            <span className="text-xl md:text-2xl text-emerald-500 font-bold">R$</span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              <NumberTicker key={totais.total_hoje} value={totais.total_hoje} />
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider">
            Hoje
          </span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="flex-1 bg-primary/40 backdrop-blur-xl rounded-2xl p-2 border border-white/5 shadow-2xl transition-all duration-300 flex flex-col items-center justify-center min-h-0 w-full overflow-hidden">
        <div className="w-full flex flex-col items-center justify-center text-center space-y-2 py-4">
          <div className="flex items-baseline justify-center gap-2 w-full">
            <span className="text-xl md:text-2xl text-emerald-500 font-bold">R$</span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              <NumberTicker key={totais.total_mes} value={totais.total_mes} />
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider">
            Mês de Março
          </span>
        </div>
      </div>

      {/* Card 3 */}
      <div className="flex-1 bg-primary/60 backdrop-blur-2xl rounded-2xl p-2 border border-cta/20 shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-300 flex flex-col items-center justify-center min-h-0 relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cta/10 to-transparent pointer-events-none" />
        <div className="w-full flex flex-col items-center justify-center text-center space-y-2 py-4 relative z-10">
          <div className="flex items-baseline justify-center gap-2 w-full">
            <span className="text-xl md:text-2xl text-emerald-500 font-bold">R$</span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              <NumberTicker key={totais.total_ano} value={totais.total_ano} />
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-300 font-medium uppercase tracking-wider">
            Oportunidades de 2026
          </span>
        </div>
      </div>

    </div>
  )
}
