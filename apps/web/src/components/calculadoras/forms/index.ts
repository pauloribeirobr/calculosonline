import type { ComponentType } from 'react'
import type { FormProps } from './types'
import { RescisaoForm } from './RescisaoForm'
import { FeriasForm } from './FeriasForm'
import { DecimoTerceiroForm } from './DecimoTerceiroForm'
import { HoraExtraForm } from './HoraExtraForm'
import { FGTSForm } from './FGTSForm'
import { SalarioLiquidoForm } from './SalarioLiquidoForm'
import { INSSForm } from './INSSForm'
import { IRRFForm } from './IRRFForm'
import { IRPFForm } from './IRPFForm'
import { DASMEIForm } from './DASMEIForm'
import { JurosCompostosForm } from './JurosCompostosForm'
import { PorcentagemForm } from './PorcentagemForm'
import { EmprestimoForm, FinanciamentoForm } from './AmortizacaoForm'
import { CDBForm } from './CDBForm'
import { PoupancaForm } from './PoupancaForm'
import { TesouroDiretoForm } from './TesouroDiretoForm'
import { IMCForm } from './IMCForm'
import { CaloriasForm } from './CaloriasForm'
import { MargemLucroForm } from './MargemLucroForm'

const FORMS: Record<string, ComponentType<FormProps>> = {
  'rescisao-trabalhista': RescisaoForm,
  ferias: FeriasForm,
  'decimo-terceiro': DecimoTerceiroForm,
  'hora-extra': HoraExtraForm,
  fgts: FGTSForm,
  'salario-liquido': SalarioLiquidoForm,
  inss: INSSForm,
  irrf: IRRFForm,
  irpf: IRPFForm,
  'das-mei': DASMEIForm,
  'juros-compostos': JurosCompostosForm,
  porcentagem: PorcentagemForm,
  emprestimo: EmprestimoForm,
  financiamento: FinanciamentoForm,
  cdb: CDBForm,
  poupanca: PoupancaForm,
  'tesouro-direto': TesouroDiretoForm,
  imc: IMCForm,
  calorias: CaloriasForm,
  'margem-lucro': MargemLucroForm,
}

export function getCalculadoraForm(slug: string): ComponentType<FormProps> | undefined {
  return FORMS[slug]
}

export type { FormProps }
