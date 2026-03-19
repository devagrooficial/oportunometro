"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { MapPin, Presentation } from "lucide-react"

interface Licitacao {
  id: string;
  titulo: string;
  estado: string;
  cidade: string;
  valor_estimado: number | null;
}

export default function UltimasLicitacoes() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])

  useEffect(() => {
    const fetchLicitacoes = async () => {
      const { data } = await supabase
        .from('licitacoes')
        .select('id, titulo, estado, cidade, valor_estimado')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (data) {
        setLicitacoes(data as Licitacao[]);
      }
    };
    fetchLicitacoes();

    const channel = supabase.channel('realtime_ultimas_licitacoes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'licitacoes' },
        (payload) => {
          const newData = payload.new as Licitacao;
          setLicitacoes(prev => {
            const newList = [newData, ...prev];
            return newList.slice(0, 3);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatarMoeda = (valor: number | null) => {
    if (!valor) return "R$ 0,00"; // ou "Sob consulta"
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full bg-primary/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">
      <h2 className="text-sm font-mono text-cta font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
        <Presentation className="w-4 h-4" /> Últimas Oportunidades
      </h2>
      <div className="flex flex-col gap-3 overflow-y-auto hide-scroll flex-1">
        {licitacoes.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-slate-800/80 transition-colors">
            <h3 className="text-sm text-slate-200 font-medium line-clamp-2 leading-tight">
              {item.titulo || 'Licitação sem título'}
            </h3>
            
            <div className="flex items-center justify-between gap-4 mt-auto pt-1">
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="text-xs truncate">
                  {item.cidade && item.estado ? `${item.cidade} / ${item.estado}` : item.cidade || item.estado || 'Local não informado'}
                </span>
              </div>
              
              <div className="font-mono text-sm text-emerald-500 font-semibold shrink-0">
                {formatarMoeda(item.valor_estimado)}
              </div>
            </div>
          </div>
        ))}
        {licitacoes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            Buscando dados...
          </div>
        )}
      </div>
    </div>
  )
}
