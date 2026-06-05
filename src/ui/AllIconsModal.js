import { useEffect, useRef, useState } from 'react'
import { LIBRARIES, getLibrary, drawLibIcon, libIconCount } from '../lib/icons/index.js'
import { useIconLib } from './useIconLib.js'

// Sinônimos PT→EN (as chaves dos ícones são em inglês). Busca em português passa a achar.
const SYN = {
  cachorro: ['dog'], cao: ['dog'], gato: ['cat'], leao: ['lion'], tigre: ['tiger'], girafa: ['giraffe'], crocodilo: ['crocodile'], elefante: ['elephant'], zebra: ['zebra'], cavalo: ['horse'], vaca: ['cow'], porco: ['pig'], ovelha: ['sheep', 'ewe'], cabra: ['goat'], coelho: ['rabbit'], urso: ['bear'], raposa: ['fox'], lobo: ['wolf'], macaco: ['monkey'], gorila: ['gorilla'], panda: ['panda'], canguru: ['kangaroo'], passaro: ['bird'], coruja: ['owl'], aguia: ['eagle'], pinguim: ['penguin'], pato: ['duck'], galinha: ['chicken'], peixe: ['fish'], tubarao: ['shark'], baleia: ['whale'], golfinho: ['dolphin'], polvo: ['octopus'], caranguejo: ['crab'], cobra: ['snake'], tartaruga: ['turtle'], sapo: ['frog'], dragao: ['dragon'], aranha: ['spider'], abelha: ['bee', 'honeybee'], borboleta: ['butterfly'], formiga: ['ant'], caracol: ['snail'],
  moto: ['motorbike', 'moped', 'scooter'], carro: ['car'], caminhao: ['truck'], onibus: ['bus'], bicicleta: ['bicycle', 'bike'], aviao: ['plane', 'airplane'], barco: ['boat', 'ship'], foguete: ['rocket'], combustivel: ['fuel'], capacete: ['helmet'],
  casa: ['home', 'house'], cama: ['bed'], cadeira: ['chair'], mesa: ['table'], sofa: ['sofa', 'couch'], porta: ['door'], janela: ['window'], chave: ['key'], lampada: ['lamp', 'bulb', 'light'], geladeira: ['fridge'], fogao: ['stove'], microondas: ['microwave'], banheiro: ['toilet', 'bath'], chuveiro: ['shower'], escada: ['stairs', 'ladder'], ventilador: ['fan'], televisao: ['television'], espelho: ['mirror'], vassoura: ['broom'], lixo: ['trash'], planta: ['plant', 'flower', 'leaf'], cortina: ['curtain'],
  martelo: ['hammer'], serra: ['saw'], chavedefenda: ['screwdriver'], parafuso: ['screw'], prego: ['nail'], alicate: ['pliers'], furadeira: ['drill'], regua: ['ruler', 'tape-measure'], pincel: ['brush'], tinta: ['paint'], ferramenta: ['tool'], machado: ['axe'],
  coracao: ['heart'], estrela: ['star'], relogio: ['clock'], calendario: ['calendar'], camera: ['camera'], telefone: ['phone'], musica: ['music'], presente: ['gift'], dinheiro: ['money', 'cash', 'coin', 'dollar'], carrinho: ['cart'], etiqueta: ['tag'], caixa: ['box'], cafe: ['coffee'], comida: ['food'], bebida: ['drink', 'bottle'], bolo: ['cake'], maca: ['apple'], pao: ['bread'], cerveja: ['beer'], vinho: ['wine'], sol: ['sun'], lua: ['moon'], nuvem: ['cloud'], chuva: ['rain'], fogo: ['fire', 'flame'], arvore: ['tree'], flor: ['flower'], folha: ['leaf'], aviso: ['warning', 'alert'], cadeado: ['lock'], usuario: ['user'], pessoas: ['users', 'people'], olho: ['eye'], busca: ['search'], seta: ['arrow'], wifi: ['wifi'], bateria: ['battery'], raio: ['bolt', 'flash'], escudo: ['shield'], coroa: ['crown'], bandeira: ['flag'], trofeu: ['trophy'], medalha: ['medal']
}
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
// Expande a busca: o termo + sinônimos de qualquer chave PT que contenha o termo.
function searchTerms(query) {
  const q = stripAccents(query)
  const terms = new Set([q])
  for (const k in SYN) if (k.includes(q)) SYN[k].forEach((t) => terms.add(t))
  return [...terms]
}

function Preview({ libId, icon }) {
  const ref = useRef(null)
  const ready = useIconLib(libId)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawLibIcon(ctx, libId, icon, 4, 4, c.width - 8)
  }, [libId, icon, ready])
  return <canvas ref={ref} width={34} height={34} />
}

function IconBtn({ libId, icon, value, valueLib, onPick, onClose }) {
  return (
    <button
      className={`icon-opt ${libId === valueLib && value === icon ? 'sel' : ''}`}
      title={icon}
      onClick={() => { onPick(libId, icon); onClose() }}
    >
      <Preview libId={libId} icon={icon} />
    </button>
  )
}

// Modal "ver todos": navega por biblioteca/categoria; com busca, procura em TODAS as libs.
export default function AllIconsModal({ open, libId, value, onPick, onClose }) {
  const [lib, setLib] = useState(libId || 'etiqya')
  const [q, setQ] = useState('')
  useEffect(() => { if (open) { setLib(libId || 'etiqya'); setQ('') } }, [open, libId])
  if (!open) return null

  const query = q.trim().toLowerCase()
  const searching = query.length > 0

  // Resultados globais (todas as libs) quando há busca, com sinônimos PT→EN.
  const terms = searching ? searchTerms(query) : []
  const globalResults = searching
    ? LIBRARIES.map((l) => {
      const keys = []
      l.categories.forEach((c) => c.keys.forEach((k) => {
        if (!keys.includes(k) && terms.some((t) => k.includes(t))) keys.push(k)
      }))
      return { id: l.id, name: l.name, keys: keys.slice(0, 160) }
    }).filter((l) => l.keys.length)
    : []

  const library = getLibrary(lib)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide allicons" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Todos os ícones</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        <input
          className="ai-search"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar em todas as bibliotecas… (ex: moto, cachorro, girafa, casa)"
        />

        {!searching && (
          <div className="lib-tabs">
            {LIBRARIES.map((l) => (
              <button key={l.id} className={`lib-tab ${lib === l.id ? 'sel' : ''}`} onClick={() => setLib(l.id)}>
                {l.name} <span>{libIconCount(l.id)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="ai-scroll">
          {searching ? (
            globalResults.length === 0
              ? <p className="hint">Nenhum ícone encontrado em nenhuma biblioteca.</p>
              : globalResults.map((l) => (
                <div key={l.id} className="ai-cat">
                  <h4>{l.name} · {l.keys.length}</h4>
                  <div className="ai-grid">
                    {l.keys.map((k) => <IconBtn key={l.id + k} libId={l.id} icon={k} value={value} valueLib={libId} onPick={onPick} onClose={onClose} />)}
                  </div>
                </div>
              ))
          ) : (
            library.categories.map((c) => (
              <div key={c.id} className="ai-cat">
                <h4>{c.name}</h4>
                <div className="ai-grid">
                  {c.keys.map((k) => <IconBtn key={k} libId={lib} icon={k} value={value} valueLib={libId} onPick={onPick} onClose={onClose} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
