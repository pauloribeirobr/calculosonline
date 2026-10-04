/**
 * Categoria Tempo (F68) — aritmética de calendário e de relógio.
 *
 * É o primeiro módulo do core sem legislação por trás: nada aqui muda de um
 * ano para o outro, e por isso nada aqui precisa ser revisado em janeiro.
 *
 * Hoje: **datas** (F68) e **feriados nacionais** (F72), que alimentam os
 * dias úteis das datas. As frentes cadastradas no backlog reaproveitam este
 * módulo: horas (F73) e contagem regressiva (F74). Os feriados são a exceção
 * à regra de cima: a lista segue a lei, e uma lei nova de feriado obriga a
 * revisar `feriados.ts`.
 */

export * from './datas'
export * from './feriados'
